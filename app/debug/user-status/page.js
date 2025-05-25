// Debug component to show user login and online status information
'use client';

import { useEffect } from 'react';
import { useConversationContext } from '@/contexts/ConversationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UserStatusDebug() {
  const { currentUser, onlineUsers, socketConnected } = useConversationContext();

  useEffect(() => {
    console.log('Debug Component - Current User:', currentUser);
    console.log('Debug Component - Online Users:', onlineUsers);
  }, [currentUser, onlineUsers]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">User Login & Online Status Information</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{socketConnected ? 'Connected to server' : 'Disconnected from server'}</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Logged-in User</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-2">
              <div><strong>User ID:</strong> {currentUser.id}</div>
              <div><strong>Name:</strong> {currentUser.name}</div>
              <div><strong>Email:</strong> {currentUser.email}</div>
            </div>
          ) : (
            <div className="text-yellow-600">No user is currently logged in</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Online Users ({onlineUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {onlineUsers.length > 0 ? (
            <div className="space-y-4">
              {onlineUsers.map((user, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded">
                  <div><strong>User ID:</strong> {user.userId}</div>
                  <div><strong>Status:</strong> {user.status}</div>
                  <div><strong>Since:</strong> {new Date(user.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-yellow-600">No users are currently online</div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-sm text-gray-500 mt-4">
        <p>Note: This debug page shows real-time information about which user is logged in and which users are online.</p>
        <p>When users connect or disconnect, this information will be updated automatically.</p>
      </div>
    </div>
  );
}
