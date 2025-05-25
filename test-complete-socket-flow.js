#!/usr/bin/env node

const axios = require('axios');
const { io } = require('socket.io-client');

console.log('🧪 Testing Complete Socket Notification Flow\n');

const BASE_URL = 'http://localhost:3033';
const SOCKET_URL = 'http://localhost:3033/chat-socket';

// Test credentials (newly created test users)
const testUsers = [
  { email: 'testuser1@example.com', password: 'password123', expectedId: 5 },
  { email: 'testuser2@example.com', password: 'password123', expectedId: 6 }
];

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

async function createConversation(token, recipientId) {
  try {
    const response = await axios.post(`${BASE_URL}/api/conversation`, 
      { recipientId: recipientId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200) {
      console.log(`✅ Conversation created successfully:`, response.data);
      return response.data;
    }
  } catch (error) {
    console.log(`❌ Conversation creation failed:`, error.response?.data?.error || error.message);
    return null;
  }
}

function createSocketConnection(userId, token) {
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      secure: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    const eventLog = [];

    socket.on("connect", () => {
      console.log(`📡 User ${userId} socket connected: ${socket.id}`);
      
      // Join personal user room
      socket.emit("joinUserRoom", userId);
      console.log(`🏠 User ${userId} joined personal room: user_${userId}`);
      
      resolve({ socket, eventLog });
    });

    socket.on("connect_error", (err) => {
      console.error(`❌ Socket connection error for user ${userId}:`, err.message);
      reject(err);
    });

    // Listen for conversation refresh notifications
    socket.on("refreshConversations", (data) => {
      console.log(`🔄 User ${userId} received refresh notification:`, data);
      eventLog.push({ type: 'refreshConversations', data, timestamp: Date.now() });
    });

    // Listen for other socket events
    socket.on("syncChatSidebar", (data) => {
      console.log(`🔄 User ${userId} received sidebar sync:`, data);
      eventLog.push({ type: 'syncChatSidebar', data, timestamp: Date.now() });
    });

    socket.on("RceiveMessage", (data) => {
      console.log(`📥 User ${userId} received message:`, data);
      eventLog.push({ type: 'RceiveMessage', data, timestamp: Date.now() });
    });
  });
}

async function testCompleteFlow() {
  console.log('🔐 Step 1: Authenticating test users...\n');
  
  // Login both users
  const user1Auth = await loginUser(testUsers[0].email, testUsers[0].password);
  const user2Auth = await loginUser(testUsers[1].email, testUsers[1].password);
  
  if (!user1Auth || !user2Auth) {
    console.error('❌ Authentication failed. Aborting test.');
    return;
  }
  
  console.log('\n📡 Step 2: Setting up socket connections...\n');
  
  // Create socket connections for both users
  const user1Socket = await createSocketConnection(user1Auth.user.id, user1Auth.token);
  const user2Socket = await createSocketConnection(user2Auth.user.id, user2Auth.token);
  
  console.log('\n💬 Step 3: Testing conversation creation...\n');
  
  // Wait a moment for socket connections to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // User 1 creates conversation with User 2
  const conversation = await createConversation(user1Auth.token, user2Auth.user.id);
  
  if (conversation) {
    console.log('\n🔔 Step 4: Testing socket notification emission...\n');
    
    // Emit conversation created event from user 1's socket
    user1Socket.socket.emit("conversationCreated", {
      conversationId: conversation.id,
      creatorId: user1Auth.user.id,
      recipientId: user2Auth.user.id
    });
    
    console.log(`📤 User ${user1Auth.user.id} emitted conversationCreated event`);
  }
  
  console.log('\n⏳ Step 5: Waiting for socket events...\n');
  
  // Wait for socket events to be received
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n📊 Step 6: Test Results Summary...\n');
  
  console.log(`User ${user1Auth.user.id} (${user1Auth.user.name}) events:`, user1Socket.eventLog);
  console.log(`User ${user2Auth.user.id} (${user2Auth.user.name}) events:`, user2Socket.eventLog);
  
  // Check if both users received the refresh notification
  const user1ReceivedRefresh = user1Socket.eventLog.some(event => event.type === 'refreshConversations');
  const user2ReceivedRefresh = user2Socket.eventLog.some(event => event.type === 'refreshConversations');
  
  console.log('\n🎯 Socket Notification Flow Test Results:');
  console.log(`✅ User 1 received refresh notification: ${user1ReceivedRefresh ? 'YES' : 'NO'}`);
  console.log(`✅ User 2 received refresh notification: ${user2ReceivedRefresh ? 'YES' : 'NO'}`);
  console.log(`✅ Conversation created successfully: ${conversation ? 'YES' : 'NO'}`);
  
  if (user1ReceivedRefresh && user2ReceivedRefresh && conversation) {
    console.log('\n🎉 SUCCESS: Complete socket notification flow is working correctly!');
  } else {
    console.log('\n⚠️ WARNING: Socket notification flow has issues that need to be addressed.');
  }
  
  // Cleanup
  console.log('\n🧹 Cleaning up connections...');
  user1Socket.socket.disconnect();
  user2Socket.socket.disconnect();
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// Run the test
testCompleteFlow().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
