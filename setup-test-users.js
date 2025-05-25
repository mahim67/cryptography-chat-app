#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3033';

async function createTestUser(name, email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/register`, {
      name: name,
      email: email,
      password: password,
      confirmPassword: password
    });
    
    if (response.status === 201) {
      console.log(`✅ Test user created: ${email}`);
      return response.data;
    }
  } catch (error) {
    console.log(`⚠️ User creation failed for ${email}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function loginUser(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/api/login`, {
      email: email,
      password: password
    });
    
    if (response.status === 200) {
      console.log(`✅ User ${email} logged in successfully`);
      return response.data;
    }
  } catch (error) {
    console.log(`⚠️ Login failed for ${email}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function setupTestUsers() {
  console.log('🔧 Setting up test users...\n');
  
  // Create test users
  const testUser1 = await createTestUser('Test User 1', 'testuser1@example.com', 'password123');
  const testUser2 = await createTestUser('Test User 2', 'testuser2@example.com', 'password123');
  
  if (testUser1 && testUser2) {
    console.log('\n🔐 Testing login for created users...\n');
    
    // Test login
    const login1 = await loginUser('testuser1@example.com', 'password123');
    const login2 = await loginUser('testuser2@example.com', 'password123');
    
    if (login1 && login2) {
      console.log('\n🎉 Test users are ready for socket testing!');
      console.log(`User 1 ID: ${login1.user.id}`);
      console.log(`User 2 ID: ${login2.user.id}`);
    }
  }
}

setupTestUsers().catch(error => {
  console.error('Setup failed:', error);
});
