import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const MessageInput = ({ onSendMessage, disabled }) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-1 p-4 border-t bg-white">
      <Input
        placeholder="Type a message"
        className="flex-1 rounded-full border-gray-300"
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      <Button
        size="icon"
        className="bg-green-500 text-white hover:bg-green-600"
        onClick={handleSend}
        disabled={!inputMessage.trim() || disabled}
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default MessageInput;
