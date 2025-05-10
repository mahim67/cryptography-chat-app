import React, { useState } from 'react'
import Sidebar from './components/sidebar';
import ChatList from './components/chat-list';
import { usePathname } from "next/navigation";

const AppLayout = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    console.log(selectedUser);
    const pathname = usePathname();

    const noLayoutRoutes = ["/login", "/register"];
    const isNoLayoutRoute = noLayoutRoutes.includes(pathname);
    
    if (isNoLayoutRoute) {
        return (
            <div>{children}</div>
        )
    }
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-1">
                <div className="border-r">
                    <ChatList onSelectUser={setSelectedUser} />
                </div>
                <div className="flex-1">
                    {/* {selectedUser ? (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-auto">
                                <ChatInbox selectedUser={selectedUser} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a user to start chatting</p>
                        </div>
                    )} */}
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AppLayout