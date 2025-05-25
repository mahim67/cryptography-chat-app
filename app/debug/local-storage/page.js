// A component to show the localStorage contents
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LocalStorageViewer() {
  const [storageItems, setStorageItems] = useState([]);
  const [userDataParsed, setUserDataParsed] = useState(null);

  useEffect(() => {
    refreshStorage();
  }, []);

  const refreshStorage = () => {
    if (typeof window !== 'undefined') {
      // Get all items from localStorage
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        items.push({ key, value });

        // If this is userData, try to parse it
        if (key === 'userData') {
          try {
            const parsed = JSON.parse(value);
            setUserDataParsed(parsed);
          } catch (e) {
            console.error('Error parsing userData:', e);
          }
        }
      }
      setStorageItems(items);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">localStorage Contents</h1>
        <Button onClick={refreshStorage}>Refresh</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All localStorage Items</CardTitle>
        </CardHeader>
        <CardContent>
          {storageItems.length > 0 ? (
            <div className="space-y-4">
              {storageItems.map((item, index) => (
                <div key={index} className="p-3 bg-gray-100 rounded">
                  <div className="font-bold text-blue-600">{item.key}</div>
                  <div className="mt-1 text-sm break-all">{item.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-yellow-600">No items in localStorage</div>
          )}
        </CardContent>
      </Card>

      {userDataParsed && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">User Information</h3>
                {userDataParsed.user && (
                  <div className="ml-4 space-y-1">
                    <div><strong>ID:</strong> {userDataParsed.user.id}</div>
                    <div><strong>Name:</strong> {userDataParsed.user.name}</div>
                    <div><strong>Email:</strong> {userDataParsed.user.email}</div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Authentication</h3>
                <div className="ml-4">
                  <div><strong>Token:</strong> {userDataParsed.token ? `${userDataParsed.token.substring(0, 20)}...` : 'None'}</div>
                </div>
              </div>

              {userDataParsed.privateKey && (
                <div className="p-3 bg-gray-100 rounded">
                  <h3 className="font-bold mb-2">Encryption</h3>
                  <div className="ml-4">
                    <div><strong>Private Key:</strong> {`${userDataParsed.privateKey.substring(0, 20)}...`}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-gray-500 mt-4">
        <p>This page shows the contents of your browser's localStorage, which contains information about the logged-in user.</p>
        <p>The application uses this data to determine which user is currently logged in and to authenticate API requests.</p>
      </div>
    </div>
  );
}
