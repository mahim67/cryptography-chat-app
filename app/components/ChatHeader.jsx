import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { DoorOpen } from 'lucide-react';

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
