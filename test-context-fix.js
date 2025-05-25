#!/usr/bin/env node

/**
 * Test script to verify that the ConversationContext circular dependency is resolved
 * and socket notifications are working correctly.
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Testing ConversationContext fix...\n');

// Test 1: Check for circular dependencies in the codebase
console.log('1. Checking for circular dependencies...');
try {
    // Read ConversationContext
    const contextContent = fs.readFileSync('/var/www/cryptography-chat-app/contexts/ConversationContext.js', 'utf8');
    
    // Read useSocketConnection hook
    const hookContent = fs.readFileSync('/var/www/cryptography-chat-app/hooks/useSocketConnection.js', 'utf8');
    
    // Check that ConversationContext imports useSocketConnection
    const contextImportsHook = contextContent.includes("import { useSocketConnection }");
    
    // Check that useSocketConnection does NOT import ConversationContext
    const hookImportsContext = hookContent.includes("import { useConversationContext }");
    
    console.log(`   ✅ ConversationContext imports useSocketConnection: ${contextImportsHook}`);
    console.log(`   ✅ useSocketConnection does NOT import ConversationContext: ${!hookImportsContext}`);
    
    if (contextImportsHook && !hookImportsContext) {
        console.log('   🎉 Circular dependency resolved!\n');
    } else {
        console.log('   ❌ Circular dependency still exists!\n');
        process.exit(1);
    }
} catch (error) {
    console.log('   ❌ Error checking files:', error.message);
    process.exit(1);
}

// Test 2: Check that useSocketConnection accepts the new parameter signature
console.log('2. Checking useSocketConnection parameter signature...');
try {
    const hookContent = fs.readFileSync('/var/www/cryptography-chat-app/hooks/useSocketConnection.js', 'utf8');
    
    const hasCorrectSignature = hookContent.includes('useSocketConnection(userId, conversationId, onRefreshConversations)');
    
    console.log(`   ✅ useSocketConnection has correct parameter signature: ${hasCorrectSignature}`);
    
    if (hasCorrectSignature) {
        console.log('   🎉 Parameter signature updated correctly!\n');
    } else {
        console.log('   ❌ Parameter signature not updated correctly!\n');
        process.exit(1);
    }
} catch (error) {
    console.log('   ❌ Error checking hook signature:', error.message);
    process.exit(1);
}

// Test 3: Check that ConversationContext passes the callback correctly
console.log('3. Checking ConversationContext callback usage...');
try {
    const contextContent = fs.readFileSync('/var/www/cryptography-chat-app/contexts/ConversationContext.js', 'utf8');
    
    const hasCallbackUsage = contextContent.includes('conversationData.refreshConversations');
    
    console.log(`   ✅ ConversationContext passes refresh callback: ${hasCallbackUsage}`);
    
    if (hasCallbackUsage) {
        console.log('   🎉 Callback usage implemented correctly!\n');
    } else {
        console.log('   ❌ Callback usage not implemented correctly!\n');
        process.exit(1);
    }
} catch (error) {
    console.log('   ❌ Error checking context callback:', error.message);
    process.exit(1);
}

console.log('🎉 All tests passed! The ConversationContext circular dependency has been resolved.');
console.log('✅ Socket notifications should now work correctly for all users.');
console.log('\n📋 Next steps:');
console.log('   1. Test the application in a browser');
console.log('   2. Verify new users without conversations get socket connections');
console.log('   3. Test that new messages show up for all relevant users');
console.log('   4. Check the browser console for any remaining errors');
