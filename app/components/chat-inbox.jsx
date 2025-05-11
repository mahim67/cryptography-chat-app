'use client';

import { useState, useEffect } from "react";
import { getMessagesByConversationId, getConversationByUserId, sendMessageToServer } from "@/services/chat-list-service";
import { encryptMessage } from "@/lib/cryptoFunctions";
import { useSocketConnection } from "@/hooks/useSocketConnection";
import { useMessageHandling } from "@/hooks/useMessageHandling";
import ChatHeader from "./ChatHeader";
import MessageDisplay from "./MessageDisplay";
import MessageInput from "./MessageInput";

const ChatInbox = ({ selectedUserId }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [recipientInfo, setRecipientInfo] = useState(null);
    const [conversionInfo, setConversionInfo] = useState(null);
    const [user, setUser] = useState({});
    const [privateKey, setPrivateKey] = useState(null);
    const [selectedUser, setSelectedUser] = useState({});

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

    // Initialize socket connection
    const { socket, socketConnected, socketError, joinChatRoom, sendSocketMessage } =
        useSocketConnection(user?.id, conversionInfo?.id);

    // Listen for incoming messages
    useEffect(() => {
        if (socket && socketConnected) {
            console.log('RceiveMessage on');
            socket.on("RceiveMessage", (newMessage) => {
                console.log("New message received:", newMessage);
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            });
        }

        return () => {
            if (socket) {
                console.log('RceiveMessage off');
                socket.off("RceiveMessage");
            }
        };
    }, [socket, socketConnected]);

    // Fetch conversation and messages when user is selected
    useEffect(() => {
        if (selectedUserId) {
            const fetchConversationAndMessages = async () => {
                setLoading(true);
                try {
                    const conversationResponse = await getConversationByUserId(selectedUserId);
                    if (conversationResponse.status === 200) {
                        setConversionInfo(conversationResponse.data);
                        const conversationId = conversationResponse.data.id;

                        // Join the chat room if socket is connected
                        if (socket && socketConnected && conversationId) {
                            joinChatRoom(conversationId);
                        }

                        const messagesResponse = await getMessagesByConversationId(conversationId);
                        if (messagesResponse.status === 200) {
                            setRecipientInfo(messagesResponse.data.recipient);
                            setSelectedUser(messagesResponse.data.recipient);
                            setMessages(messagesResponse.data.messages || []);
                        } else {
                            console.error("Failed to fetch messages:", messagesResponse.message);
                        }
                    } else {
                        console.error("Failed to fetch conversation:", conversationResponse.message);
                    }
                } catch (error) {
                    console.error("Error fetching conversation or messages:", error);
                } finally {
                    setLoading(false);
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
            const encryptedData = await encryptMessage(message, senderPublicKey, recipientPublicKey);

            // Create message data
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
            await sendMessageToServer(messageData);

            // Send via socket if connected
            sendSocketMessage({
                message             : encryptedData.encryptedMessage,
                sender_decrypt_key  : encryptedData.encryptedKeyForSender,
                receiver_decrypt_key: encryptedData.encryptedKeyForRecipient,
                iv                  : encryptedData.iv,
                recipientId         : selectedUserId,
                conversationId      : conversionInfo?.id,
                auth_tag            : encryptedData.authTag,
                sender_id           : user?.id,
            });
        } catch (error) {
            console.error("Error encrypting or sending message:", error);
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
                loading={loading}
            />

            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!socketConnected || !recipientInfo}
            />
        </div>
    );
};

export default ChatInbox;
