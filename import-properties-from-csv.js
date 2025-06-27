const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

// Helper function to create slug from text
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Helper function to parse price string and extract numeric value
function parsePrice(priceStr) {
  if (!priceStr) return '0';
  // Extract numbers from strings like "₹29.70 Lakhs Onwards" or "₹4.25 Crores Onwards"
  const match = priceStr.match(/₹?([\d,]+\.?\d*)/);
  if (match) {
    const number = parseFloat(match[1].replace(/,/g, ''));
    if (priceStr.includes('Crore')) {
      return (number * 10000000).toString(); // Convert crores to rupees
    } else if (priceStr.includes('Lakh')) {
      return (number * 100000).toString(); // Convert lakhs to rupees
    }
    return number.toString();
  }
  return '0';
}

// Helper function to parse numeric price from the CSV
function parseNumericPrice(numericPrice) {
  if (!numericPrice) return '0';
  return numericPrice.toString();
}

// Helper function to map property types
function mapPropertyType(csvPropertyType) {
  const typeMap = {
    'Farm Plots': 'PLOT',
    'Farmhouse': 'FARMLAND', 
    'Villas': 'VILLA',
    'Apartments': 'APARTMENT',
    'Farm Plots': 'PLOT',
    'Resort': 'HOLIDAY_HOME',
    'Residential Plots': 'PLOT',
    'Holiday Home': 'HOLIDAY_HOME',
    'Farmland': 'FARMLAND'
  };
  return typeMap[csvPropertyType] || 'HOLIDAY_HOME';
}

// Helper function to extract coordinates
function parseCoordinates(latitude, longitude) {
  if (!latitude || !longitude) return null;
  
  // Clean latitude and longitude values
  const cleanLat = latitude.toString().replace(/[^\d.-]/g, '');
  const cleanLng = longitude.toString().replace(/[^\d.-]/g, '');
  
  const lat = parseFloat(cleanLat);
  const lng = parseFloat(cleanLng);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  return { lat, lng };
}

// Helper function to parse amenities from CSV
function parseAmenities(amenitiesStr) {
  if (!amenitiesStr || amenitiesStr.trim() === '') return [];
  
  const amenities = amenitiesStr
    .split(',')
    .map(a => a.trim())
    .filter(a => a && a !== 'Not applicable')
    .map(amenity => ({
      name: amenity,
      icon: 'star' // Default icon
    }));
  
  return amenities;
}

// Helper function to parse views
function parseViews(viewsStr) {
  if (!viewsStr || viewsStr.trim() === '') return [];
  
  return viewsStr
    .split(',')
    .map(v => v.trim())
    .filter(v => v);
}

// Helper function to create location data from property
function createLocationFromProperty(property) {
  const micromarket = property['Micromarket'] || '';
  const state = property['State'] || '';
  const pool = property['Pool'] || '';
  
  // Create location name from micromarket and state
  let locationName = micromarket;
  if (state && !micromarket.includes(state)) {
    locationName = `${micromarket}, ${state}`;
  }
  
  const coordinates = parseCoordinates(property['Latitude'], property['Longitude']);
  
  return {
    name: locationName || 'Unknown Location',
    slug: createSlug(locationName || 'unknown-location'),
    description: property['Info - Micromarket'] || `Properties in ${locationName}`,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=800',
    coordinates: coordinates ? JSON.stringify(coordinates) : JSON.stringify({ lat: 0, lng: 0 }),
    highlights: JSON.stringify([]),
    amenities: JSON.stringify([]),
    featured: false,
    active: true,
    propertyCount: 0
  };
}

// Main function to process and import properties
async function importProperties() {
  console.log('🚀 Starting property import from CSV...');
  
  const properties = [];
  const csvFilePath = 'Properties Details_N - Main Project Details-2.csv';
  
  // Check if CSV file exists
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ CSV file not found:', csvFilePath);
    console.log('Please make sure the CSV file is in the root directory');
    return;
  }
  
  // Read and parse CSV
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        properties.push(data);
      })
      .on('end', async () => {
        console.log(`📊 Found ${properties.length} properties in CSV`);
        
        try {
          await processProperties(properties);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Process properties and save to database
async function processProperties(properties) {
  console.log('🔄 Processing properties...');
  
  const locationMap = new Map(); // Cache locations to avoid duplicates
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < properties.length; i++) {
    const csvProperty = properties[i];
    
    try {
      console.log(`\n📝 Processing property ${i + 1}/${properties.length}: ${csvProperty['Project Name']}`);
      
      // Skip if project name is empty
      if (!csvProperty['Project Name'] || csvProperty['Project Name'].trim() === '') {
        console.log('⏭️  Skipping property with empty name');
        continue;
      }
      
      // Create or get location
      const locationData = createLocationFromProperty(csvProperty);
      let location;
      
      if (locationMap.has(locationData.slug)) {
        location = locationMap.get(locationData.slug);
      } else {
        // Check if location exists in database
        location = await prisma.location.findUnique({
          where: { slug: locationData.slug }
        });
        
        if (!location) {
          console.log(`📍 Creating new location: ${locationData.name}`);
          location = await prisma.location.create({
            data: locationData
          });
        }
        
        locationMap.set(locationData.slug, location);
      }
      
      // Parse property data
      const propertySlug = csvProperty['Listing Id'] || createSlug(csvProperty['Project Name']);
      const coordinates = parseCoordinates(csvProperty['Latitude'], csvProperty['Longitude']);
      const amenities = parseAmenities(csvProperty['Amenities']);
      const views = parseViews(csvProperty['Views']);
      
      // Extract size information
      const sizeRange = csvProperty['Size Range (in sq.ft)'] || csvProperty['Sq.ft Onwards - Size'] || '';
      const area = parseInt(sizeRange.replace(/[^\d]/g, '')) || 1000; // Default to 1000 if no size
      
      // Prepare property data
      const propertyData = {
        title: csvProperty['Project Name'],
        slug: propertySlug,
        description: csvProperty['About the Project'] || csvProperty['Project Headline'] || 'Premium property development',
        price: parseNumericPrice(csvProperty['Numerical_Price']) || parsePrice(csvProperty['Starting Price (INR )']),
        locationId: location.id,
        propertyType: mapPropertyType(csvProperty['Property Type']),
        bedrooms: 2, // Default, can be extracted from unit configuration if needed
        bathrooms: 2, // Default
        area: area,
        floors: 1, // Default
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=800',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&h=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&h=800'
        ]),
        amenities: JSON.stringify(amenities),
        features: JSON.stringify(views.map(view => ({ name: view, icon: 'eye' }))),
        coordinates: coordinates ? JSON.stringify(coordinates) : null,
        status: 'AVAILABLE',
        featured: csvProperty['Project Listed on Website'] === 'Yes',
        active: true,
        
        // Additional fields from CSV
        unitConfiguration: csvProperty['Type - Unit Configuration'] ? JSON.stringify({
          types: csvProperty['Type - Unit Configuration'],
          sizes: csvProperty['Size - Unit Configuration'],
          prices: csvProperty['Price - Unit Configuration']
        }) : null,
        
        aboutProject: csvProperty['About the Project'],
        
        legalApprovals: JSON.stringify([
          {
            title: 'RERA',
            value: csvProperty['RERA ID'] || 'Not Available',
            status: csvProperty['RERA ID'] && csvProperty['RERA ID'] !== 'Not Available' ? 'approved' : 'pending'
          }
        ]),
        
        registrationCosts: JSON.stringify({
          stampDuty: csvProperty['Stamp Duty '] || 'Contact for details',
          registrationCost: csvProperty['Registeration Cost'] || 'Contact for details',
          maintenanceCost: csvProperty['Maintainence Cost '] || 'Contact for details'
        }),
        
        propertyManagement: csvProperty['Post Property management'] ? JSON.stringify({
          description: csvProperty['Post Property management'],
          included: true
        }) : null,
        
        financialReturns: csvProperty['Financial Returns & Investment Benefits'] ? JSON.stringify({
          description: csvProperty['Financial Returns & Investment Benefits'],
          roi: csvProperty['Revenue Potential'] || 'Contact for details',
          occupancy: csvProperty['Occupancy'] || 'High demand area'
        }) : null,
        
        investmentBenefits: JSON.stringify([
          csvProperty['Why Invest 1'],
          csvProperty['Why Invest 2'], 
          csvProperty['Why Invest 3'],
          csvProperty['Why Invest 4']
        ].filter(benefit => benefit && benefit.trim() !== '')),
        
        nearbyInfrastructure: JSON.stringify({
          education: csvProperty['Educational Institutions'] || '',
          shopping: csvProperty['Malls Nearby'] || '',
          healthcare: csvProperty['Hospitals Nearby'] || '',
          transport: {
            airport: csvProperty['Airport'] || '',
            bus: csvProperty['Bus'] || '',
            train: csvProperty['Train'] || '',
            highway: csvProperty['Highway'] || ''
          },
          attractions: [
            {
              name: csvProperty['Nearby Attractions 1'] || '',
              description: csvProperty['Description 1'] || ''
            },
            {
              name: csvProperty['Nearby Attractions 2'] || '',
              description: csvProperty['Description 2'] || ''
            },
            {
              name: csvProperty['Nearby Attractions 3'] || '',
              description: csvProperty['Description 3'] || ''
            },
            {
              name: csvProperty['Nearby Attractions 4'] || '',
              description: csvProperty['Description 4'] || ''
            }
          ].filter(attraction => attraction.name && attraction.name.trim() !== '')
        }),
        
        plotSize: csvProperty['Project Land Size (Acres)'] ? `${csvProperty['Project Land Size (Acres)']} acres` : null,
        constructionStatus: csvProperty['Current Status'] || 'Under Construction',
        possessionDate: csvProperty['Possession Timeline'] ? new Date() : null, // You might want to parse this properly
        
        metaTitle: `${csvProperty['Project Name']} - Premium Property`,
        metaDescription: csvProperty['Project Headline'] || `Discover ${csvProperty['Project Name']} - a premium property development`,
        tags: JSON.stringify([
          csvProperty['Property Type'],
          csvProperty['Micromarket'],
          csvProperty['State'],
          'Investment',
          'Real Estate'
        ].filter(tag => tag && tag.trim() !== '')),
        
        views: 0
      };
      
      // Check if property already exists
      const existingProperty = await prisma.property.findUnique({
        where: { slug: propertySlug }
      });
      
      if (existingProperty) {
        console.log(`⚠️  Property with slug '${propertySlug}' already exists, updating...`);
        await prisma.property.update({
          where: { id: existingProperty.id },
          data: propertyData
        });
      } else {
        console.log(`✅ Creating new property: ${csvProperty['Project Name']}`);
        await prisma.property.create({
          data: propertyData
        });
      }
      
      successCount++;
      
    } catch (error) {
      console.error(`❌ Error processing property '${csvProperty['Project Name']}':`, error.message);
      errorCount++;
      
      // Continue with next property instead of stopping
      continue;
    }
  }
  
  // Update location property counts
  console.log('\n🔄 Updating location property counts...');
  await updateLocationCounts();
  
  console.log(`\n🎉 Import completed!`);
  console.log(`✅ Successfully imported: ${successCount} properties`);
  console.log(`❌ Errors encountered: ${errorCount} properties`);
  console.log(`📍 Total locations processed: ${locationMap.size}`);
}

// Update property counts for all locations
async function updateLocationCounts() {
  const locations = await prisma.location.findMany({
    select: { id: true, name: true }
  });

  for (const location of locations) {
    const propertyCount = await prisma.property.count({
      where: {
        locationId: location.id,
        active: true,
        status: 'AVAILABLE'
      }
    });

    await prisma.location.update({
      where: { id: location.id },
      data: { propertyCount }
    });
    
    console.log(`📊 Updated ${location.name}: ${propertyCount} properties`);
  }
}

// Main execution
async function main() {
  try {
    await importProperties();
    console.log('\n🎊 All properties are now LIVE on the website!');
  } catch (error) {
    console.error('💥 Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importProperties, main }; 