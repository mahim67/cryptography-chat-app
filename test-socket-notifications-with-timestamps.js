// Test final socket notification system with timestamps
const axios = require('axios');
const { io } = require("socket.io-client");

const BACKEND_URL = 'http://localhost:8000';
const SOCKET_URL = 'http://localhost:8000/chat-socket';

// Test user credentials
const user1 = { id: 1, email: 'test1@example.com', password: 'Password123!' };
const user2 = { id: 2, email: 'test2@example.com', password: 'Password123!' };

// Login and get token
async function login(email, password) {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
            email,
            password
        });
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return null;
    }
}

// Create socket connection
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
            if (conversationId) {
                socket.emit("joinChat", { conversationId });
                console.log(`🏠 User ${userId} joined rooms: user_${userId} and conversation_${conversationId}`);
            } else {
                console.log(`🏠 User ${userId} joined room: user_${userId}`);
            }
            
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
                message: data.message?.substring(0, 20) + '...',
                timestamp: data.created_at,
                hasTimestamp: !!data.created_at
            });
            eventLog.push({ type: 'RceiveMessage', data, timestamp: Date.now() });
        });

        // Listen for conversation refresh notifications
        socket.on("refreshConversations", (data) => {
            console.log(`🔄 User ${userId} received refresh notification:`, data);
            eventLog.push({ type: 'refreshConversations', data, timestamp: Date.now() });
        });
    });
}

// Send a message
async function sendMessage(fromUserId, toUserId, token) {
    try {
        const message = `Test message from user ${fromUserId} to user ${toUserId} at ${new Date().toISOString()}`;
        const response = await axios.post(`${BACKEND_URL}/api/messages`, {
            recipientId: toUserId,
            message
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return { success: true, message, response: response.data };
    } catch (error) {
        console.error('Failed to send message:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// Main test function
async function testSocketNotificationsWithTimestamps() {
    console.log('🧪 TESTING SOCKET NOTIFICATIONS WITH TIMESTAMPS 🧪');
    console.log('=================================================');
    
    try {
        // Login as both users
        console.log('\n1️⃣ Logging in test users...');
        const user1Token = await login(user1.email, user1.password);
        const user2Token = await login(user2.email, user2.password);
        
        if (!user1Token || !user2Token) {
            throw new Error('Login failed for one or both users');
        }
        
        console.log('✅ Both users logged in successfully');
        
        // Connect sockets
        console.log('\n2️⃣ Connecting to socket server...');
        const user1Socket = await createSocketConnection(user1.id);
        const user2Socket = await createSocketConnection(user2.id);
        console.log('✅ Both users connected to socket server');
        
        // Send a message from user 1 to user 2
        console.log('\n3️⃣ Sending message from User 1 to User 2...');
        const sendResult = await sendMessage(user1.id, user2.id, user1Token);
        
        if (!sendResult.success) {
            throw new Error('Failed to send message');
        }
        
        console.log('✅ Message sent successfully');
        
        // Wait for notifications
        console.log('\n4️⃣ Waiting for socket notifications...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for timestamps
        const receivedMessage = user2Socket.eventLog.find(event => event.type === 'RceiveMessage');
        
        console.log('\n5️⃣ Checking message timestamp...');
        if (receivedMessage) {
            const hasTimestamp = !!receivedMessage.data.created_at;
            console.log(`Message timestamp: ${receivedMessage.data.created_at}`);
            console.log(`✅ Message has timestamp: ${hasTimestamp ? 'YES' : 'NO'}`);
        } else {
            console.log('❌ No message received');
        }
        
        // Clean up
        user1Socket.socket.disconnect();
        user2Socket.socket.disconnect();
        
        console.log('\n✅ Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testSocketNotificationsWithTimestamps();
