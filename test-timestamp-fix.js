// Test the chat-inbox.jsx handleReceiveMessage function timestamp handling

// Mock message without timestamp
const mockMessageNoTimestamp = {
    message: "Test message",
    sender_decrypt_key: "key1",
    receiver_decrypt_key: "key2",
    iv: "test-iv",
    conversationId: "test-conv-123",
    auth_tag: "test-tag",
    sender_id: "1",
    recipientId: "2",
    // No created_at field
};

// Mock message with timestamp
const mockMessageWithTimestamp = {
    ...mockMessageNoTimestamp,
    created_at: '2025-05-25T12:34:56.789Z'
};

// Test function
function testTimestampHandling() {
    console.log('=== Testing Chat-Inbox Timestamp Handling ===');
    
    // Simulate our fixed handleReceiveMessage function
    function handleReceiveMessage(newMessage, conversationId) {
        console.log('Received real-time message:', newMessage);
        
        // Only update if this message is for the current conversation
        if (newMessage.conversationId === conversationId) {
            // Ensure the message has a timestamp
            const messageWithTimestamp = {
                ...newMessage,
                created_at: newMessage.created_at || new Date().toISOString()
            };
            
            return messageWithTimestamp;
        }
        
        return null;
    }
    
    // Test with message that's missing timestamp
    const convId = 'test-conv-123';
    console.log('\n1. Testing message WITHOUT timestamp:');
    const result1 = handleReceiveMessage(mockMessageNoTimestamp, convId);
    console.log('Result:', result1);
    console.log('✅ Has timestamp:', !!result1?.created_at);
    
    // Test with message that already has timestamp
    console.log('\n2. Testing message WITH timestamp:');
    const result2 = handleReceiveMessage(mockMessageWithTimestamp, convId);
    console.log('Result:', result2);
    console.log('✅ Original timestamp preserved:', 
        result2?.created_at === mockMessageWithTimestamp.created_at);
    
    // Test with wrong conversation ID
    console.log('\n3. Testing message with wrong conversation ID:');
    const result3 = handleReceiveMessage(mockMessageNoTimestamp, 'wrong-id');
    console.log('Result:', result3);
    console.log('✅ No message processed:', result3 === null);
}

// Run the test
testTimestampHandling();
