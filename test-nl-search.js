const fetch = require('node-fetch');

async function testNaturalLanguageSearch() {
  try {
    const response = await fetch('http://localhost:3000/api/search/natural-language?q=2bhk villa goa under 2cr&limit=10');
    const data = await response.json();
    
    console.log('NL Search Response:');
    console.log('==================');
    console.log('Success:', data.success);
    console.log('Parsed Query:', data.data?.parsed);
    console.log('Properties Found:', data.data?.properties?.length || 0);
    console.log('Total:', data.pagination?.total);
    console.log('Summary:', data.data?.summary);
    
    if (data.data?.properties?.length > 0) {
      console.log('\nFirst Property:');
      console.log(data.data.properties[0].title);
      console.log('Price:', data.data.properties[0].price);
      console.log('Bedrooms:', data.data.properties[0].bedrooms);
      console.log('Type:', data.data.properties[0].propertyType);
      console.log('Location:', data.data.properties[0].location?.name);
    }
    
    console.log('\nFull Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testNaturalLanguageSearch(); 