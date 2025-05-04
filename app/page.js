'use client'
import Layout from "./layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./components/sidebar";
import ChatList from "./components/chat-list";
import ChatInbox from "./components/chat-inbox";

export default function Home() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (!userData) {
      router.push("/login");
    }
  }, [router]);

  return (
    <Layout>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1">
          <div className="border-r">
            <ChatList onSelectUser={setSelectedUser} />
          </div>
          <div className="flex-1">
            {selectedUser ? (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                  <ChatInbox selectedUser={selectedUser} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Select a user to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
