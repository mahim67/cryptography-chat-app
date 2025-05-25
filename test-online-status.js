// Test script for online/offline status detection
const io = require('socket.io-client');
const axios = require('axios');
const readline = require('readline');

// Configuration
const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';
const TEST_USERS = [
  { email: 'user1@example.com', password: 'password123' },
  { email: 'user2@example.com', password: 'password123' }
];

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to prompt for user input
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

// Store authenticated users and their sockets
const authenticatedUsers = [];
let currentUserIndex = 0;

// Login function
async function login(credentials) {
  try {
    console.log(`Logging in as ${credentials.email}...`);
    const response = await axios.post(`${API_URL}/login`, credentials);
    
    if (response.data && response.data.token) {
      console.log(`✅ Login successful for ${credentials.email}`);
      return {
        token: response.data.token,
        user: response.data.user,
        privateKey: response.data.privateKey
      };
    } else {
      console.error('❌ Login failed: No token received');
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data?.error || error.message);
    return null;
  }
}

// Connect to socket
function connectSocket(userData) {
  const socket = io(SOCKET_URL, {
    extraHeaders: {
      Authorization: `Bearer ${userData.token}`
    },
    transports: ['websocket'],
    reconnection: true
  });
  
  console.log(`Connecting socket for user ${userData.user.email}...`);
  
  // Event handlers
  socket.on('connect', () => {
    console.log(`✅ Socket connected for ${userData.user.email} (ID: ${socket.id})`);
    // Join user room to receive notifications
    socket.emit('joinUserRoom', userData.user.id);
    console.log(`✅ Joined personal room for user ${userData.user.id}`);
  });
  
  socket.on('connect_error', (error) => {
    console.error(`❌ Socket connection error for ${userData.user.email}:`, error.message);
  });
  
  socket.on('userStatus', (data) => {
    console.log(`👤 User status update received:`, data);
  });
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Socket disconnected for ${userData.user.email}: ${reason}`);
  });
  
  return socket;
}

// Get online users
async function getOnlineUsers(token) {
  try {
    const response = await axios.get(`${API_URL}/online-users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching online users:', error.response?.data?.error || error.message);
    return { online: [] };
  }
}

// Main test function
async function runTest() {
  console.log('🔍 Starting online status detection test...');
  
  // Login both test users
  for (const credentials of TEST_USERS) {
    const userData = await login(credentials);
    
    if (userData) {
      const socket = connectSocket(userData);
      authenticatedUsers.push({ ...userData, socket });
    }
  }
  
  if (authenticatedUsers.length < 2) {
    console.error('❌ Test requires at least 2 authenticated users');
    cleanup();
    return;
  }
  
  // Wait a moment for socket connections to establish
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check online users for the first user
  const onlineUsers = await getOnlineUsers(authenticatedUsers[0].token);
  console.log('📊 Online users:', onlineUsers);
  
  // Enter interactive mode
  console.log('\n🎮 Interactive test mode:');
  console.log('1. Test both users online (current state)');
  console.log('2. Disconnect one user to test offline status');
  console.log('3. Reconnect user to test coming back online');
  console.log('4. Exit test');
  
  let running = true;
  while (running) {
    const choice = await prompt('\nEnter your choice (1-4): ');
    
    switch (choice) {
      case '1':
        // Both users should already be online
        const onlineUsersCheck = await getOnlineUsers(authenticatedUsers[0].token);
        console.log('📊 Current online users:', onlineUsersCheck);
        break;
        
      case '2':
        // Disconnect one user
        currentUserIndex = 1; // Use the second user
        console.log(`🔌 Disconnecting ${authenticatedUsers[currentUserIndex].user.email}...`);
        authenticatedUsers[currentUserIndex].socket.disconnect();
        
        // Wait a moment for status to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check online users again
        const afterDisconnectUsers = await getOnlineUsers(authenticatedUsers[0].token);
        console.log('📊 Online users after disconnect:', afterDisconnectUsers);
        break;
        
      case '3':
        // Reconnect the user
        console.log(`🔌 Reconnecting ${authenticatedUsers[currentUserIndex].user.email}...`);
        authenticatedUsers[currentUserIndex].socket.connect();
        
        // Wait a moment for connection and status to propagate
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Socket will automatically join user room on reconnect due to socket event handlers
        
        // Check online users again
        const afterReconnectUsers = await getOnlineUsers(authenticatedUsers[0].token);
        console.log('📊 Online users after reconnect:', afterReconnectUsers);
        break;
        
      case '4':
        running = false;
        break;
        
      default:
        console.log('❓ Invalid choice. Please enter a number between 1 and 4.');
    }
  }
  
  cleanup();
}

// Cleanup function
function cleanup() {
  console.log('🧹 Cleaning up...');
  
  // Disconnect all sockets
  for (const user of authenticatedUsers) {
    if (user.socket && user.socket.connected) {
      user.socket.disconnect();
    }
  }
  
  rl.close();
  console.log('✅ Test completed');
}

// Run the test
runTest().catch(error => {
  console.error('❌ Unexpected error:', error);
  cleanup();
});
