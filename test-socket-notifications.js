#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('Testing Socket Notification Flow...\n');

// Test socket connection to backend
const socketURL = 'http://localhost:3033/chat-socket';
console.log(`Connecting to: ${socketURL}`);

const socket = io(socketURL, {
  transports: ["websocket", "polling"],
  secure: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("✅ Socket connected successfully with ID:", socket.id);
  
  // Test joining user room
  const testUserId = 1;
  console.log(`📡 Joining user room for user ID: ${testUserId}`);
  socket.emit("joinUserRoom", testUserId);
  
  // Test conversation creation notification
  setTimeout(() => {
    console.log("🔔 Testing conversation creation notification...");
    socket.emit("conversationCreated", {
      conversationId: 123,
      creatorId: 1,
      recipientId: 2
    });
  }, 2000);
  
  // Clean up after test
  setTimeout(() => {
    console.log("🧹 Cleaning up test...");
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
  process.exit(1);
});

socket.on("disconnect", (reason) => {
  console.log("📴 Socket disconnected:", reason);
});

// Listen for conversation refresh notifications
socket.on("refreshConversations", (data) => {
  console.log("🔄 Received refresh conversations notification:", data);
});

// Listen for sync events
socket.on("syncChatSidebar", (data) => {
  console.log("🔄 Received chat sidebar sync:", data);
});

console.log("⏳ Waiting for connection...");
