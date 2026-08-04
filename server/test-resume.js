const fs = require('fs');
const path = require('path');

const url = 'http://localhost:5000/api/auth';
const email = `test_resume_${Date.now()}@test.com`;
const password = 'password123';

async function testResumeUploads() {
  try {
    console.log('--- SETUP ---');
    // 1. Register
    await fetch(`${url}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Resume User', email, password })
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
    const validPdf = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(validPdf, '%PDF-1.4 dummy pdf content');
    
    const invalidFile = path.join(__dirname, 'dummy.txt');
    fs.writeFileSync(invalidFile, 'dummy text content');
    
    const largePdf = path.join(__dirname, 'large.pdf');
    // Create a file slightly larger than 5MB
    const largeBuffer = Buffer.alloc(5.1 * 1024 * 1024, 'a');
    fs.writeFileSync(largePdf, largeBuffer);

    console.log('\n--- RESUME UPLOAD TESTS ---');
    
    // Test 1: Missing Token
    const missingTokenForm = new FormData();
    const missingTokenRes = await fetch(`${url}/resume`, {
      method: 'PUT',
      body: missingTokenForm
    });
    console.log('Missing Token status (expect 401):', missingTokenRes.status);
    console.log('Message:', (await missingTokenRes.json()).message);

    // Test 2: Invalid Token
    const invalidTokenForm = new FormData();
    const invalidTokenRes = await fetch(`${url}/resume`, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer invalid_token' },
      body: invalidTokenForm
    });
    console.log('Invalid Token status (expect 401):', invalidTokenRes.status);
    console.log('Message:', (await invalidTokenRes.json()).message);

    // Test 3: No file
    const noFileForm = new FormData();
    const noFileRes = await fetch(`${url}/resume`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: noFileForm
    });
    console.log('No file status (expect 400):', noFileRes.status);
    console.log('Message:', (await noFileRes.json()).message);

    // Test 4: Invalid file type
    const invalidForm = new FormData();
    const invalidBlob = new Blob([fs.readFileSync(invalidFile)], { type: 'text/plain' });
    invalidForm.append('resume', invalidBlob, 'dummy.txt');
    const invalidRes = await fetch(`${url}/resume`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: invalidForm
    });
    console.log('Invalid file type status (expect 400):', invalidRes.status);
    console.log('Message:', (await invalidRes.json()).message);

    // Test 5: File larger than 5MB
    const largeForm = new FormData();
    const largeBlob = new Blob([fs.readFileSync(largePdf)], { type: 'application/pdf' });
    largeForm.append('resume', largeBlob, 'large.pdf');
    const largeRes = await fetch(`${url}/resume`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: largeForm
    });
    console.log('Large file status (expect 400):', largeRes.status);
    console.log('Message:', (await largeRes.json()).message);

    // Test 6: Valid PDF upload
    console.log('\n(Assuming valid Cloudinary credentials in .env...)');
    const validForm = new FormData();
    const validBlob = new Blob([fs.readFileSync(validPdf)], { type: 'application/pdf' });
    validForm.append('resume', validBlob, 'dummy.pdf');
    const validRes = await fetch(`${url}/resume`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: validForm
    });
    console.log('Valid upload status (expect 200/500):', validRes.status);
    const validData = await validRes.json();
    console.log('Response:', validData);

    // Test 7: Replace existing resume
    if (validRes.status === 200) {
      console.log('\n--- REPLACING EXISTING RESUME ---');
      const replaceForm = new FormData();
      const replaceBlob = new Blob([fs.readFileSync(validPdf)], { type: 'application/pdf' });
      replaceForm.append('resume', replaceBlob, 'dummy2.pdf');
      const replaceRes = await fetch(`${url}/resume`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: replaceForm
      });
      console.log('Replace resume status (expect 200):', replaceRes.status);
      console.log('Response:', await replaceRes.json());
    }

    // Cleanup
    fs.unlinkSync(validPdf);
    fs.unlinkSync(invalidFile);
    fs.unlinkSync(largePdf);
    console.log('\n--- CLEANUP DONE ---');

  } catch (error) {
    console.error('Test script error:', error);
  }
}

testResumeUploads();
