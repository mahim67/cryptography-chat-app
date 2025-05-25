#!/usr/bin/env node

/**
 * Comprehensive test to verify socket notification functionality
 * Tests the complete flow: global socket connection, message notifications, and conversation updates
 */

const io = require('socket.io-client');
const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const SOCKET_URL = 'http://localhost:5000';

// Test users
const testUsers = [
    { id: 1, email: 'user1@example.com', password: 'password123' },
    { id: 2, email: 'user2@example.com', password: 'password123' }
];

let user1Token, user2Token;
let user1Socket, user2Socket;

async function authenticate(user) {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email: user.email,
            password: user.password
        });
        return response.data.token;
    } catch (error) {
        console.error(`Failed to authenticate ${user.email}:`, error.response?.data || error.message);
        return null;
    }
}

function createSocketConnection(userId, token) {
    return new Promise((resolve) => {
        const socket = io(SOCKET_URL, {
            auth: {
                token: token
            }
        });

        socket.on('connect', () => {
            console.log(`✅ User ${userId} socket connected`);
            resolve(socket);
        });

        socket.on('connect_error', (error) => {
            console.error(`❌ User ${userId} socket connection error:`, error);
            resolve(null);
        });
    });
}

async function sendMessage(fromUserId, toUserId, token, message) {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/messages`, {
            recipientId: toUserId,
            message: message
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to send message:', error.response?.data || error.message);
        return null;
    }
}

async function runSocketNotificationTest() {
    console.log('🚀 Starting comprehensive socket notification test...\n');

    // Step 1: Authenticate users
    console.log('1. Authenticating test users...');
    user1Token = await authenticate(testUsers[0]);
    user2Token = await authenticate(testUsers[1]);

    if (!user1Token || !user2Token) {
        console.log('❌ Authentication failed. Make sure test users exist and credentials are correct.');
        return;
    }
    console.log('✅ Both users authenticated successfully\n');

    // Step 2: Create socket connections
    console.log('2. Creating socket connections...');
    user1Socket = await createSocketConnection(testUsers[0].id, user1Token);
    user2Socket = await createSocketConnection(testUsers[1].id, user2Token);

    if (!user1Socket || !user2Socket) {
        console.log('❌ Socket connection failed');
        return;
    }
    console.log('✅ Both users connected to socket\n');

    // Step 3: Set up message listeners
    console.log('3. Setting up message listeners...');
    
    let user1ReceivedMessages = [];
    let user2ReceivedMessages = [];
    let user1ConversationRefresh = false;
    let user2ConversationRefresh = false;

    user1Socket.on('newMessage', (data) => {
        console.log('👂 User 1 received newMessage event:', data);
        user1ReceivedMessages.push(data);
    });

    user1Socket.on('RceiveMessage', (data) => {
        console.log('👂 User 1 received RceiveMessage event:', data);
        user1ReceivedMessages.push(data);
    });

    user1Socket.on('refreshConversations', (data) => {
        console.log('👂 User 1 received refreshConversations event:', data);
        user1ConversationRefresh = true;
    });

    user2Socket.on('newMessage', (data) => {
        console.log('👂 User 2 received newMessage event:', data);
        user2ReceivedMessages.push(data);
    });

    user2Socket.on('RceiveMessage', (data) => {
        console.log('👂 User 2 received RceiveMessage event:', data);
        user2ReceivedMessages.push(data);
    });

    user2Socket.on('refreshConversations', (data) => {
        console.log('👂 User 2 received refreshConversations event:', data);
        user2ConversationRefresh = true;
    });

    console.log('✅ Message listeners set up\n');

    // Step 4: Send a message from user 1 to user 2
    console.log('4. Sending message from User 1 to User 2...');
    const messageResult = await sendMessage(testUsers[0].id, testUsers[1].id, user1Token, 'Hello from User 1! This is a test message.');
    
    if (!messageResult) {
        console.log('❌ Failed to send message');
        return;
    }
    console.log('✅ Message sent successfully\n');

    // Step 5: Wait for notifications and verify
    console.log('5. Waiting for socket notifications (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n📊 Test Results:');
    console.log('================');
    
    console.log('\n🔍 User 1 (Sender) Results:');
    console.log(`   - Received ${user1ReceivedMessages.length} message notifications`);
    console.log(`   - Received conversation refresh: ${user1ConversationRefresh}`);
    
    console.log('\n🔍 User 2 (Recipient) Results:');
    console.log(`   - Received ${user2ReceivedMessages.length} message notifications`);
    console.log(`   - Received conversation refresh: ${user2ConversationRefresh}`);

    // Verify expected behavior
    let testsPassed = 0;
    let totalTests = 4;

    console.log('\n✅ Test Verification:');
    console.log('====================');

    // Test 1: User 1 should receive conversation refresh notification
    if (user1ConversationRefresh) {
        console.log('✅ Test 1 PASSED: User 1 received conversation refresh');
        testsPassed++;
    } else {
        console.log('❌ Test 1 FAILED: User 1 did not receive conversation refresh');
    }

    // Test 2: User 2 should receive conversation refresh notification
    if (user2ConversationRefresh) {
        console.log('✅ Test 2 PASSED: User 2 received conversation refresh');
        testsPassed++;
    } else {
        console.log('❌ Test 2 FAILED: User 2 did not receive conversation refresh');
    }

    // Test 3: User 2 should receive message notification
    if (user2ReceivedMessages.length > 0) {
        console.log('✅ Test 3 PASSED: User 2 received message notification');
        testsPassed++;
    } else {
        console.log('❌ Test 3 FAILED: User 2 did not receive message notification');
    }

    // Test 4: At least one socket notification should be received
    if (user1ReceivedMessages.length > 0 || user2ReceivedMessages.length > 0 || user1ConversationRefresh || user2ConversationRefresh) {
        console.log('✅ Test 4 PASSED: Socket notifications are working');
        testsPassed++;
    } else {
        console.log('❌ Test 4 FAILED: No socket notifications received');
    }

    console.log(`\n🎯 Final Result: ${testsPassed}/${totalTests} tests passed`);
    
    if (testsPassed === totalTests) {
        console.log('🎉 All tests passed! Socket notifications are working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Socket notifications may need further debugging.');
    }

    // Cleanup
    console.log('\n🧹 Cleaning up connections...');
    user1Socket.disconnect();
    user2Socket.disconnect();
    console.log('✅ Cleanup complete');
}

// Run the test
runSocketNotificationTest().catch(console.error);
