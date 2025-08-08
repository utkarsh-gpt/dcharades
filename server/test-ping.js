const fetch = require('node-fetch');

async function testPing() {
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3001';
  
  try {
    console.log(`Testing ping to: ${serverUrl}/health`);
    const response = await fetch(`${serverUrl}/health`);
    const data = await response.json();
    
    console.log('✅ Ping successful!');
    console.log('Response:', data);
  } catch (error) {
    console.log('❌ Ping failed:', error.message);
  }
}

testPing(); 