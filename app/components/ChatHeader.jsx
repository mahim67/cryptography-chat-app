import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatHeader = ({ user, socketConnected, socketError }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow border-b">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
          <AvatarFallback>{user?.name ? user?.name[0] : 'CN'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-sm font-semibold">{user?.name}</h2>
          <p className="text-xs text-gray-500">
            {socketConnected ? "online" : socketError ? "connection error" : "connecting..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
