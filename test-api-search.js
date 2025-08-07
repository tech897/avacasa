// Test the API search endpoints directly
const fetch = require('node-fetch');

async function testAPI() {
  const baseUrl = 'http://localhost:3000/api';
  
  console.log('🧪 Testing API search endpoints...\n');
  
  try {
    // Test 1: Basic property search
    console.log('1. Testing basic property fetch:');
    const basicResponse = await fetch(`${baseUrl}/properties?limit=3`);
    const basicData = await basicResponse.json();
    console.log(`   Found ${basicData.data?.length || 0} properties`);
    if (basicData.data?.length > 0) {
      console.log(`   Sample: ${basicData.data[0].title} - ${basicData.data[0].bedrooms} bedrooms`);
    }
    
    // Test 2: Bedroom search
    console.log('\n2. Testing bedroom search (3+ bedrooms):');
    const bedroomResponse = await fetch(`${baseUrl}/properties?bedrooms=3&limit=5`);
    const bedroomData = await bedroomResponse.json();
    console.log(`   Found ${bedroomData.data?.length || 0} properties with 3+ bedrooms`);
    if (bedroomData.data?.length > 0) {
      bedroomData.data.forEach(p => console.log(`   - ${p.title}: ${p.bedrooms} bedrooms`));
    }
    
    // Test 3: Text search
    console.log('\n3. Testing text search ("villa"):');
    const searchResponse = await fetch(`${baseUrl}/properties?search=villa&limit=5`);
    const searchData = await searchResponse.json();
    console.log(`   Found ${searchData.data?.length || 0} properties matching "villa"`);
    if (searchData.data?.length > 0) {
      searchData.data.forEach(p => console.log(`   - ${p.title}`));
    }
    
    // Test 4: Property type search
    console.log('\n4. Testing property type search (VILLA):');
    const typeResponse = await fetch(`${baseUrl}/properties?propertyType=VILLA&limit=5`);
    const typeData = await typeResponse.json();
    console.log(`   Found ${typeData.data?.length || 0} VILLA properties`);
    if (typeData.data?.length > 0) {
      typeData.data.forEach(p => console.log(`   - ${p.title}`));
    }
    
    // Test 5: Price search
    console.log('\n5. Testing price search (5M - 50M):');
    const priceResponse = await fetch(`${baseUrl}/properties?minPrice=5000000&maxPrice=50000000&limit=5`);
    const priceData = await priceResponse.json();
    console.log(`   Found ${priceData.data?.length || 0} properties in price range`);
    if (priceData.data?.length > 0) {
      priceData.data.forEach(p => console.log(`   - ${p.title}: ₹${parseInt(p.price).toLocaleString()}`));
    }
    
    // Test 6: Location search
    console.log('\n6. Testing location search ("Goa"):');
    const locationResponse = await fetch(`${baseUrl}/properties?location=Goa&limit=5`);
    const locationData = await locationResponse.json();
    console.log(`   Found ${locationData.data?.length || 0} properties in Goa`);
    if (locationData.data?.length > 0) {
      locationData.data.forEach(p => console.log(`   - ${p.title} (${p.location.name})`));
    }
    
    // Test 7: Combined search
    console.log('\n7. Testing combined search (Villa in Goa, 3+ bedrooms):');
    const combinedResponse = await fetch(`${baseUrl}/properties?propertyType=VILLA&location=Goa&bedrooms=3&limit=3`);
    const combinedData = await combinedResponse.json();
    console.log(`   Found ${combinedData.data?.length || 0} villas in Goa with 3+ bedrooms`);
    if (combinedData.data?.length > 0) {
      combinedData.data.forEach(p => console.log(`   - ${p.title}: ${p.bedrooms} bedrooms in ${p.location.name}`));
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    console.log('\n💡 Make sure the development server is running with: npm run dev');
  }
}

testAPI();
