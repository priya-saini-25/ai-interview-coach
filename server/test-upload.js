const fs = require('fs');
const path = require('path');

const url = 'http://localhost:5000/api/auth';
const email = `test_upload_${Date.now()}@test.com`;
const password = 'password123';

async function testUploads() {
  try {
    console.log('--- SETUP ---');
    // 1. Register
    await fetch(`${url}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Upload User', email, password })
    });
    
    // 2. Login
    const loginRes = await fetch(`${url}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Got token for testing');

    // Create dummy files for testing
    const validImage = path.join(__dirname, 'dummy.jpg');
    fs.writeFileSync(validImage, 'dummy content representing an image');
    
    const invalidImage = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(invalidImage, 'dummy content representing text');
    
    const largeImage = path.join(__dirname, 'large.jpg');
    // Create a file slightly larger than 2MB
    const largeBuffer = Buffer.alloc(2.1 * 1024 * 1024, 'a');
    fs.writeFileSync(largeImage, largeBuffer);

    console.log('\n--- UPLOAD TESTS ---');
    
    // Test 1: Neither file nor name provided
    const neitherForm = new FormData();
    const neitherRes = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: neitherForm
    });
    console.log('Neither name nor file status (expect 400):', neitherRes.status);
    console.log('Message:', (await neitherRes.json()).message);

    // Test 2: Invalid image type
    const invalidForm = new FormData();
    const invalidBlob = new Blob([fs.readFileSync(invalidImage)], { type: 'text/plain' });
    invalidForm.append('profilePicture', invalidBlob, 'dummy.txt');
    const invalidRes = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: invalidForm
    });
    console.log('Invalid image type status (expect 400):', invalidRes.status);
    console.log('Message:', (await invalidRes.json()).message);

    // Test 3: File larger than 2MB
    const largeForm = new FormData();
    const largeBlob = new Blob([fs.readFileSync(largeImage)], { type: 'image/jpeg' });
    largeForm.append('profilePicture', largeBlob, 'large.jpg');
    const largeRes = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: largeForm
    });
    console.log('Large file status (expect 400):', largeRes.status);
    console.log('Message:', (await largeRes.json()).message);

    // Test 4: Update ONLY name
    const onlyNameForm = new FormData();
    onlyNameForm.append('name', 'Only Name Update');
    const onlyNameRes = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: onlyNameForm
    });
    console.log('Only name update status (expect 200):', onlyNameRes.status);

    // Test 5: Update ONLY profile picture
    const onlyPicForm = new FormData();
    const onlyPicBlob = new Blob([fs.readFileSync(validImage)], { type: 'image/jpeg' });
    onlyPicForm.append('profilePicture', onlyPicBlob, 'dummy.jpg');
    const onlyPicRes = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: onlyPicForm
    });
    console.log('Only picture update status (expect 200/500 depending on env config):', onlyPicRes.status);

    // Test 6: Update BOTH name and profile picture
    const bothForm = new FormData();
    bothForm.append('name', 'Both Update');
    const bothBlob = new Blob([fs.readFileSync(validImage)], { type: 'image/jpeg' });
    bothForm.append('profilePicture', bothBlob, 'dummy.jpg');
    const bothRes = await fetch(`${url}/profile`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: bothForm
    });
    console.log('Both update status (expect 200/500 depending on env config):', bothRes.status);

    // Cleanup
    fs.unlinkSync(validImage);
    fs.unlinkSync(invalidImage);
    fs.unlinkSync(largeImage);
    console.log('\n--- CLEANUP DONE ---');

  } catch (error) {
    console.error('Test script error:', error);
  }
}

testUploads();
