
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth/register';

async function testRegister(username, password, role) {
  console.log(`Testing register for ${username} with password '${password}'...`);
  try {
    const response = await axios.post(API_URL, { username, password, role });
    console.log('Success:', response.status, response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error:', error.response.status, error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

async function run() {
  // 1. Test Valid User
  await testRegister('testuser_' + Date.now(), 'Test@1234', 'staff');

  // 2. Test Weak Password
  await testRegister('weakuser_' + Date.now(), 'weak', 'staff');
}

run();
