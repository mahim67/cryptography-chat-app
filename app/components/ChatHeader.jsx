import React, { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DoorOpen } from 'lucide-react';
import { useConversationContext } from '@/contexts/ConversationContext';

const ChatHeader = ({ user, socketConnected, socketError }) => {
  const { isUserOnline, onlineUsers } = useConversationContext();
  
  // Debug the issue with online status
  useEffect(() => {
    console.log('ChatHeader - user:', user);
    console.log('ChatHeader - onlineUsers:', onlineUsers);
    console.log('ChatHeader - isOnline check:', isUserOnline(user?.id));
  }, [user, onlineUsers, isUserOnline]);
  
  // User ID could be in different formats depending on the component
  const isOnline = isUserOnline(user?.id) || isUserOnline(user?.user_id);
  
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow border-b">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar>
            <AvatarImage src={user?.avatar || "https://github.com/shadcn.png"} />
            <AvatarFallback>{user?.name ? user?.name[0] : 'CN'}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold">{user?.name}</h2>
          <p className="text-xs text-gray-500">
            {isOnline ? "online" : "offline"}
          </p>
        </div>
      </div>
      <div>
        <Link href={"/"}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className='cursor-pointer'>
                <DoorOpen className="h-12 w-12" />
                <span className="sr-only">Leave Chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Leave Chat</TooltipContent>
          </Tooltip>
        </Link>
      </div>
    </div>
  );
};

export default ChatHeader;
