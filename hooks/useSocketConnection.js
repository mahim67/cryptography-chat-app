import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export function useSocketConnection(userId, conversationId) {
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

  return { 
    socket, 
    socketConnected, 
    socketError, 
    joinChatRoom,
    sendSocketMessage
  };
}
