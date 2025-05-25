import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { clientAuth } from '@/lib/auth-utils';

export function useSocketConnection(userId, conversationId, onRefreshConversations) {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    
    const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!socketURL) {
      console.error("Socket URL is not defined in environment variables");
      setSocketError("Socket configuration error");
      return;
    }
    
    console.log(`Attempting to connect to socket at: ${socketURL}`);
    
    const newSocket = io(socketURL, {
      transports: ["websocket", "polling"],
      secure: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully with ID:", newSocket.id);
      setSocketConnected(true);
      setSocketError(null);
      
      // Get user data and join personal room for notifications
      const userData = clientAuth.getUser();
      if (userData?.user?.id) {
        console.log(`Joining personal user room for user ID: ${userData.user.id}`);
        newSocket.emit("joinUserRoom", userData.user.id);
      }
      
      // Join chat room if conversation ID is available
      if (conversationId) {
        console.log(`Joining chat with conversation ID: ${conversationId}`);
        newSocket.emit("joinChat", { conversationId });
      }
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setSocketError(`Connection failed: ${err.message}`);
      setSocketConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setSocketConnected(false);
      
      if (reason === "io server disconnect") {
        console.log("Attempting to reconnect...");
        newSocket.connect();
      }
    });

    // Listen for conversation refresh notifications
    newSocket.on("refreshConversations", (data) => {
      console.log("Received refresh conversations notification:", data);
      
      // Refresh the conversation list
      if (onRefreshConversations) {
        onRefreshConversations();
      }
      
      // Log notification details for debugging
      switch (data.type) {
        case "conversation_created":
          console.log(`New conversation ${data.conversationId} created by user ${data.by}`);
          break;
        case "message_sent":
          console.log(`Message sent in conversation ${data.conversationId}`);
          break;
        case "message_received":
          console.log(`Message received in conversation ${data.conversationId}`);
          break;
        default:
          console.log("Unknown refresh type:", data.type);
      }
    });

    // Listen for real-time messages
    newSocket.on("ReceiveMessage", (message) => {
      console.log("Received real-time message:", message);
      // You can add message handling logic here if needed
    });

    // Listen for chat sidebar sync
    newSocket.on("syncChatSidebar", (data) => {
      console.log("Chat sidebar sync:", data);
      // Additional sidebar sync handling can be added here
    });

    setSocket(newSocket);

    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, [userId, conversationId]);

  // Function to join a chat room
  const joinChatRoom = (conversationId) => {
    if (socket && socketConnected && conversationId) {
      console.log(`Joining chat with conversation ID: ${conversationId}`);
      socket.emit("joinChat", { conversationId });
    }
  };

  // Function to send a message
  const sendSocketMessage = (messageData) => {
    if (socket && socketConnected) {
      socket.emit("SendMessage", messageData);
      return true;
    }
    console.warn("Socket not connected, message not sent via socket");
    return false;
  };

  // Function to notify conversation creation
  const notifyConversationCreated = (conversationData) => {
    if (socket && socketConnected) {
      console.log("Emitting conversation created notification:", conversationData);
      socket.emit("conversationCreated", conversationData);
      return true;
    }
    console.warn("Socket not connected, conversation created notification not sent");
    return false;
  };

  return { 
    socket, 
    socketConnected, 
    socketError, 
    joinChatRoom,
    sendSocketMessage,
    notifyConversationCreated
  };
}
