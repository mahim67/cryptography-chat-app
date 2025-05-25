#!/usr/bin/env node

const axios = require('axios');
const { io } = require('socket.io-client');

console.log('📨 Testing Real-Time Messaging Flow\n');

const BASE_URL = 'http://localhost:3033';
const SOCKET_URL = 'http://localhost:3033/chat-socket';

// Use existing test users
const testUsers = [
  { email: 'testuser1@example.com', password: 'password123' },
  { email: 'testuser2@example.com', password: 'password123' }
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

async function sendMessage(token, messageData) {
  try {
    const response = await axios.post(`${BASE_URL}/api/send`, messageData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log(`✅ Message sent successfully`);
      return response.data;
    }
  } catch (error) {
    console.log(`❌ Message sending failed:`, error.response?.data?.error || error.message);
    return null;
  }
}

function createSocketConnection(userId, conversationId) {
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
      
      // Join personal user room and chat room
      socket.emit("joinUserRoom", userId);
      socket.emit("joinChat", { conversationId });
      console.log(`🏠 User ${userId} joined rooms: user_${userId} and conversation_${conversationId}`);
      
      resolve({ socket, eventLog });
    });

    socket.on("connect_error", (err) => {
      console.error(`❌ Socket connection error for user ${userId}:`, err.message);
      reject(err);
    });

    // Listen for real-time messages
    socket.on("RceiveMessage", (data) => {
      console.log(`📥 User ${userId} received real-time message:`, {
        from: data.sender_id,
        to: data.recipientId,
        conversation: data.conversationId
      });
      eventLog.push({ type: 'RceiveMessage', data, timestamp: Date.now() });
    });

    // Listen for conversation refresh notifications
    socket.on("refreshConversations", (data) => {
      console.log(`🔄 User ${userId} received refresh notification:`, data);
      eventLog.push({ type: 'refreshConversations', data, timestamp: Date.now() });
    });

    // Listen for sidebar sync
    socket.on("syncChatSidebar", (data) => {
      console.log(`🔄 User ${userId} received sidebar sync`);
      eventLog.push({ type: 'syncChatSidebar', data, timestamp: Date.now() });
    });
  });
}

async function testMessagingFlow() {
  console.log('🔐 Step 1: Authenticating users...\n');
  
  // Login both users
  const user1Auth = await loginUser(testUsers[0].email, testUsers[0].password);
  const user2Auth = await loginUser(testUsers[1].email, testUsers[1].password);
  
  if (!user1Auth || !user2Auth) {
    console.error('❌ Authentication failed. Aborting test.');
    return;
  }
  
  // Use existing conversation (ID 2 from previous test)
  const conversationId = 2;
  console.log(`💬 Using conversation ID: ${conversationId}\n`);
  
  console.log('📡 Step 2: Setting up socket connections...\n');
  
  // Create socket connections for both users
  const user1Socket = await createSocketConnection(user1Auth.user.id, conversationId);
  const user2Socket = await createSocketConnection(user2Auth.user.id, conversationId);
  
  console.log('\n📨 Step 3: Testing real-time messaging...\n');
  
  // Wait for socket connections to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate encrypted message data (normally this would be encrypted)
  const testMessage = {
    message: "Hello from test - this is a simulated encrypted message",
    senderDecryptKey: "simulated_sender_key",
    receiverDecryptKey: "simulated_receiver_key",
    iv: "simulated_iv",
    recipientId: user2Auth.user.id,
    conversationId: conversationId,
    authTag: "simulated_auth_tag"
  };
  
  console.log(`📤 User ${user1Auth.user.id} sending message to User ${user2Auth.user.id}...`);
  
  // Send message via HTTP API
  const sentMessage = await sendMessage(user1Auth.token, testMessage);
  
  if (sentMessage) {
    // Also send via socket for real-time delivery
    console.log(`📡 Emitting real-time message via socket...`);
    user1Socket.socket.emit("SendMessage", {
      message: testMessage.message,
      sender_decrypt_key: testMessage.senderDecryptKey,
      receiver_decrypt_key: testMessage.receiverDecryptKey,
      iv: testMessage.iv,
      recipientId: user2Auth.user.id,
      conversationId: conversationId,
      auth_tag: testMessage.authTag,
      sender_id: user1Auth.user.id,
    });
  }
  
  console.log('\n⏳ Step 4: Waiting for real-time events...\n');
  
  // Wait for socket events to be received
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n📊 Step 5: Messaging Test Results...\n');
  
  console.log(`User ${user1Auth.user.id} events:`, user1Socket.eventLog.length);
  console.log(`User ${user2Auth.user.id} events:`, user2Socket.eventLog.length);
  
  // Check if user 2 received the real-time message
  const user2ReceivedMessage = user2Socket.eventLog.some(event => event.type === 'RceiveMessage');
  const user1ReceivedRefresh = user1Socket.eventLog.some(event => event.type === 'refreshConversations');
  const user2ReceivedRefresh = user2Socket.eventLog.some(event => event.type === 'refreshConversations');
  
  console.log('\n🎯 Real-Time Messaging Test Results:');
  console.log(`✅ Message sent via API: ${sentMessage ? 'YES' : 'NO'}`);
  console.log(`✅ User 2 received real-time message: ${user2ReceivedMessage ? 'YES' : 'NO'}`);
  console.log(`✅ User 1 received refresh notification: ${user1ReceivedRefresh ? 'YES' : 'NO'}`);
  console.log(`✅ User 2 received refresh notification: ${user2ReceivedRefresh ? 'YES' : 'NO'}`);
  
  if (sentMessage && user2ReceivedMessage && user1ReceivedRefresh && user2ReceivedRefresh) {
    console.log('\n🎉 SUCCESS: Real-time messaging flow is working correctly!');
  } else {
    console.log('\n⚠️ WARNING: Real-time messaging flow has issues.');
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
testMessagingFlow().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
