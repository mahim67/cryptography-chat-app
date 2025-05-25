'use client';

import { useState, useEffect } from "react";
import { getMessagesByConversationId, getConversationByUserId, sendMessageToServer } from "@/services/chat-list-service";
import { encryptMessage } from "@/lib/cryptoFunctions";
import { useMessageHandling } from "@/hooks/useMessageHandling";
import { useConversationContext } from "@/contexts/ConversationContext";
import ChatHeader from "./ChatHeader";
import MessageDisplay from "./MessageDisplay";
import MessageInput from "./MessageInput";

const ChatInbox = ({ selectedUserId }) => {
    const [messages, setMessages] = useState([]);
    const [recipientInfo, setRecipientInfo] = useState(null);
    const [conversionInfo, setConversionInfo] = useState(null);
    const [user, setUser] = useState({});
    const [privateKey, setPrivateKey] = useState(null);
    const [selectedUser, setSelectedUser] = useState({});
    const { refreshConversations, socket, socketConnected, socketError } = useConversationContext();

    // Get user data from localStorage
    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            try {
                const parsedData = JSON.parse(userData);
                const userParseData = parsedData?.user;
                setUser(userParseData);

                // Set private key
                if (parsedData.privateKey) {
                    setPrivateKey(parsedData.privateKey);
                } else {
                    console.error("Private key not found in user data");
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    // Use global socket connection from context instead of creating new one
    const joinChatRoom = (conversationId) => {
        if (socket && socketConnected && conversationId) {
            console.log(`Joining chat with conversation ID: ${conversationId}`);
            socket.emit("joinChat", { conversationId });
        }
    };

    const sendSocketMessage = (messageData) => {
        if (socket && socketConnected) {
            socket.emit("SendMessage", messageData);
            return true;
        }
        console.warn("Socket not connected, message not sent via socket");
        return false;
    };

    const notifyConversationCreated = (conversationData) => {
        if (socket && socketConnected) {
            console.log("Emitting conversation created notification:", conversationData);
            socket.emit("conversationCreated", conversationData);
            return true;
        }
        console.warn("Socket not connected, conversation created notification not sent");
        return false;
    };

    // Listen for incoming messages on the global socket
    useEffect(() => {
        if (socket && socketConnected) {
            console.log('Setting up message listener for conversation:', conversionInfo?.id);
            
            const handleReceiveMessage = (newMessage) => {
                console.log('Received real-time message:', newMessage);
                // Only update if this message is for the current conversation
                if (newMessage.conversationId === conversionInfo?.id) {
                    // Ensure the message has a timestamp
                    const messageWithTimestamp = {
                        ...newMessage,
                        created_at: newMessage.created_at || new Date().toISOString()
                    };
                    
                    // Check if this is a message we've already shown (from our own local state)
                    // We avoid duplicating messages that we already have in state
                    setMessages(prevMessages => {
                        // Check if this message already exists in our messages array
                        // It could be a temporary message with status or a message with the same ID
                        const messageExists = prevMessages.some(msg => 
                            // Check if it's the same message ID (for messages from the server)
                            (msg.id && msg.id === messageWithTimestamp.id) ||
                            // Check if it matches a pending message by sender+content+timestamp (for temporary messages)
                            (msg.status && msg.sender_id === messageWithTimestamp.sender_id && 
                             (msg.message === messageWithTimestamp.message || 
                              msg.decryptedMessage === messageWithTimestamp.decryptedMessage) &&
                             Math.abs(new Date(msg.created_at) - new Date(messageWithTimestamp.created_at)) < 5000)
                        );
                        
                        if (messageExists) {
                            console.log('Message already exists in state, not adding duplicate');
                            // If we have a failed message and receive a successful one from server, replace it
                            return prevMessages.map(msg => {
                                if (msg.status === 'failed' && 
                                    msg.sender_id === messageWithTimestamp.sender_id && 
                                    Math.abs(new Date(msg.created_at) - new Date(messageWithTimestamp.created_at)) < 5000) {
                                    // Replace the failed message with the successful one from server
                                    console.log('Replacing failed message with server message');
                                    return messageWithTimestamp;
                                }
                                return msg;
                            });
                        }
                        
                        return [...prevMessages, messageWithTimestamp];
                    });
                }
            };

            socket.on("ReceiveMessage", handleReceiveMessage);

            return () => {
                socket.off("ReceiveMessage", handleReceiveMessage);
            };
        }
    }, [socket, socketConnected, conversionInfo?.id]);

    // Fetch conversation and messages when user is selected
    useEffect(() => {
        if (selectedUserId) {
            const fetchConversationAndMessages = async () => {
                try {
                    const conversationResponse = await getConversationByUserId(selectedUserId);
                    if (conversationResponse.status === 200) {
                        setConversionInfo(conversationResponse.data);
                        const conversationId = conversationResponse.data.id;

                        // Notify about conversation creation/access via socket
                        if (socket && socketConnected && notifyConversationCreated) {
                            notifyConversationCreated({
                                conversationId: conversationId,
                                creatorId: user?.id,
                                recipientId: selectedUserId
                            });
                        }

                        // Only refresh conversations list for truly new conversations
                        // Don't refresh for existing conversations to prevent loading loops

                        // Join the chat room if socket is connected
                        if (socket && socketConnected && conversationId) {
                            joinChatRoom(conversationId);
                        }

                        const messagesResponse = await getMessagesByConversationId(conversationId);
                        if (messagesResponse.status === 200) {
                            const recipient = messagesResponse.data.recipient;
                            
                            // Ensure we have both id and user_id for consistent online status checks
                            if (recipient && recipient.id && !recipient.user_id) {
                                recipient.user_id = recipient.id;
                            }
                            
                            setRecipientInfo(recipient);
                            setSelectedUser(recipient);
                            console.log('Setting recipient info:', recipient);
                            setMessages(messagesResponse.data.messages || []);
                        } else {
                            console.error("Failed to fetch messages:", messagesResponse.message);
                        }
                    } else {
                        console.error("Failed to fetch conversation:", conversationResponse.message);
                    }
                } catch (error) {
                    console.error("Error fetching conversation or messages:", error);
                }
            };

            fetchConversationAndMessages();
        }
    }, [selectedUserId, socket, socketConnected]);

    // Handle message decryption
    const { decryptedMessages } = useMessageHandling(messages, privateKey, user?.id);

    // Handle sending messages
    const handleSendMessage = async (message) => {
        try {
            const { user } = JSON.parse(localStorage.getItem("userData"));
            const senderPublicKey = user?.public_key;
            const recipientPublicKey = recipientInfo?.public_key;
            
            // Generate temporary message ID to track this message
            const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            // Add message to UI immediately with "sending" status
            const tempMessage = {
                id: tempMessageId,
                decryptedMessage: message,
                sender_id: user?.id,
                created_at: new Date().toISOString(),
                status: 'sending'
            };
            
            // Add to messages state to display immediately
            setMessages(prevMessages => [...prevMessages, tempMessage]);
            
            // Start encryption and sending process
            const encryptedData = await encryptMessage(message, senderPublicKey, recipientPublicKey);

            // Create message data for API
            const messageData = {
                message: encryptedData.encryptedMessage,
                senderDecryptKey: encryptedData.encryptedKeyForSender,
                receiverDecryptKey: encryptedData.encryptedKeyForRecipient,
                iv: encryptedData.iv,
                recipientId: selectedUserId,
                conversationId: conversionInfo?.id,
                authTag: encryptedData.authTag,
            };

            // Send via HTTP
            const apiResponse = await sendMessageToServer(messageData);
            
            // If API call successful, update message status and send via socket
            if (apiResponse && apiResponse.status === 200) {
                // Update message status in UI
                setMessages(prevMessages => prevMessages.map(msg => 
                    msg.id === tempMessageId 
                        ? {...msg, status: 'sent', id: apiResponse.data.id || msg.id} 
                        : msg
                ));
                
                // Send via socket if connected
                const serverMessage = {
                    id: apiResponse.data.id, // Use the real ID from server
                    message: encryptedData.encryptedMessage,
                    sender_decrypt_key: encryptedData.encryptedKeyForSender,
                    receiver_decrypt_key: encryptedData.encryptedKeyForRecipient,
                    iv: encryptedData.iv,
                    recipientId: selectedUserId,
                    conversationId: conversionInfo?.id,
                    auth_tag: encryptedData.authTag,
                    sender_id: user?.id,
                    created_at: new Date().toISOString(),
                };
                
                sendSocketMessage(serverMessage);
            } else {
                // Update UI to show error status if API call failed
                setMessages(prevMessages => prevMessages.map(msg => 
                    msg.id === tempMessageId 
                        ? {...msg, status: 'failed'} 
                        : msg
                ));
                console.error("API call failed when sending message:", apiResponse);
            }
        } catch (error) {
            console.error("Error encrypting or sending message:", error);
            // Update any sending messages to failed status
            setMessages(prevMessages => prevMessages.map(msg => 
                msg.status === 'sending' 
                    ? {...msg, status: 'failed'} 
                    : msg
            ));
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Select a user to start chatting
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <ChatHeader
                user={selectedUser}
                socketConnected={socketConnected}
                socketError={socketError}
            />

            <MessageDisplay
                messages={decryptedMessages}
                userId={user?.id}
            />

            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!socketConnected || !recipientInfo}
            />
        </div>
    );
};

export default ChatInbox;
