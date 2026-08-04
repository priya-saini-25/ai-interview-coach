const url = 'http://localhost:5000/api/auth';
const email = `test${Date.now()}@test.com`;
const password = 'password123';

async function test() {
  try {
    // 1. Register
    const regRes = await fetch(`${url}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email, password })
    });
    console.log('Register status:', regRes.status);
    
    // 2. Login
    const loginRes = await fetch(`${url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    console.log('Login status:', loginRes.status);
    const loginData = await loginRes.json();
    const token = loginData.token;

    // --- GET PROFILE TESTS ---
    console.log('\n--- GET PROFILE TESTS ---');
    const missingGet = await fetch(`${url}/profile`, { method: 'GET' });
    console.log('Missing Token status:', missingGet.status);

    const invalidGet = await fetch(`${url}/profile`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid_token_123' }
    });
    console.log('Invalid Token status:', invalidGet.status);

    const validGet = await fetch(`${url}/profile`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Valid Token status:', validGet.status);

    // --- PUT PROFILE TESTS ---
    console.log('\n--- PUT PROFILE TESTS ---');
    const missingPut = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' })
    });
    console.log('Missing Token PUT status:', missingPut.status);

    const invalidPut = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer invalid_token' },
      body: JSON.stringify({ name: 'New Name' })
    });
    console.log('Invalid Token PUT status:', invalidPut.status);

    const emptyNamePut = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: '   ' })
    });
    console.log('Empty Name PUT status:', emptyNamePut.status);
    console.log('Empty Name PUT message:', (await emptyNamePut.json()).message);

    const validPut = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name: 'Updated Name', profilePicture: 'http://example.com/pic.jpg', role: 'admin' })
    });
    console.log('Valid PUT status:', validPut.status);
    const validPutData = await validPut.json();
    console.log('Valid PUT response data:', JSON.stringify(validPutData, null, 2));

  } catch (error) {
    console.error('Test script error:', error);
  }
}

test();
