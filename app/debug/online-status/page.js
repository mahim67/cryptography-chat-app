"use client";

// Test online status functionality
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useConversationContext } from '@/contexts/ConversationContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TestOnlineStatus() {
  const { onlineUsers, socketConnected, isUserOnline } = useConversationContext();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Just a component to monitor online users
    console.log('Current online users:', onlineUsers);
  }, [onlineUsers]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Online Status Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Socket Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{socketConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Online Users Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{onlineUsers.length} users online</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Online Users</CardTitle>
        </CardHeader>
        <CardContent>
          {onlineUsers.length === 0 ? (
            <p>No users online</p>
          ) : (
            <ul className="space-y-2">
              {onlineUsers.map((user, index) => (
                <li key={index} className="flex items-center p-2 bg-gray-100 rounded">
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                      <span>{user.userId.charAt(0)}</span>
                    </div>
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">User ID: {user.userId}</p>
                    <p className="text-xs text-gray-500">
                      Online since: {new Date(user.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Open this page in multiple browser windows to test the online status functionality.
          When you close a window, that user should go offline.
        </p>
      </div>
    </div>
  );
}
