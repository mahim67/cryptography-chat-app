import React, { useEffect, useRef } from 'react';
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import { ScrollArea } from "@/components/ui/scroll-area";

const MessageDisplay = ({ messages, userId }) => {
  const scrollAreaRef = useRef(null);
  const isFirstRender = useRef(true);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    // Don't scroll on first render if there are existing messages
    if (isFirstRender.current && messages.length > 0) {
      isFirstRender.current = false;
      // Still scroll on first render after a short delay to ensure DOM is ready
      setTimeout(scrollToBottom, 100);
      return;
    }
    
    // For subsequent renders, scroll to bottom immediately
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
      {messages.map((msg, key) => (
        <div
          key={key}
          className={`flex my-1 ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`rounded-lg px-4 py-2 text-sm max-w-xs shadow ${
              msg.sender_id === userId ? "bg-green-100 text-black" : "bg-white text-black border"
            }`}
          >
            <p>{msg.decryptedMessage}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
              {msg.sender_id === userId && msg.status && (
                <span className={`mr-1 ${
                  msg.status === 'sending' ? 'text-yellow-500' : 
                  msg.status === 'sent' ? 'text-green-500' : 
                  msg.status === 'failed' ? 'text-red-500' : ''
                }`}>
                  {msg.status === 'sending' ? 'Sending...' : 
                   msg.status === 'sent' ? 'Sent' : 
                   msg.status === 'failed' ? 'Failed' : ''}
                </span>
              )}
              <span className={`${msg.sender_id === userId ? 'ml-auto' : ''}`}>
                {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), {
                  addSuffix: true,
                }) : ''}
              </span>
            </div>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
};

export default MessageDisplay;
