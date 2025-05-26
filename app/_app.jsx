import React, { useState } from 'react'
import Sidebar from './components/sidebar';
import ChatList from './components/chat-list';
import { usePathname } from "next/navigation";
import AuthGate from "./AuthGate";

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
        <AuthGate>
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex flex-1">
                    <div className="border-r">
                        <ChatList onSelectUser={setSelectedUser} />
                    </div>
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </AuthGate>
    );
}

export default AppLayout