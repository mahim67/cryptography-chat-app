import React from 'react';
import formatDistanceToNow from "date-fns/formatDistanceToNow"
import { ScrollArea } from "@/components/ui/scroll-area";

const MessageDisplay = ({ messages, userId, loading }) => {
  console.log(messages);

  return (
    <ScrollArea className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
      {loading ? (
        <div className="text-center text-gray-500">Loading messages...</div>
      ) : (
        messages.map((msg, key) => (
          <div
            key={key}
            className={`flex my-1 ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-4 py-2 text-sm max-w-xs shadow ${msg.sender_id === userId ? "bg-green-100 text-black" : "bg-white text-black border"
                }`}
            >
              <p>{msg.decryptedMessage}</p>
              <p className="text-xs text-gray-500 text-right mt-1">
                {msg.created_at ? formatDistanceToNow(new Date(msg.created_at), {
                  addSuffix: true,
                }) : ''}
              </p>
            </div>
          </div>
        ))
      )}
    </ScrollArea>
  );
};

export default MessageDisplay;
