import React from "react";
import ChatInbox from "@/app/components/chat-inbox";

const UserPage =  async({ params }) => {
    const { id } = await params;    
    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto">
                    <ChatInbox selectedUserId={id} />
                </div>
            </div>
        </>
    );
};

export default UserPage;