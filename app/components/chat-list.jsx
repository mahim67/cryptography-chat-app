"use client";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllUsers } from "@/services/chat-list-service";

export default function ChatList({ onSelectUser }) {
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                if (response.status === 200) {
                    setAllUsers(response.data);
                } else {
                    console.error("Error fetching users:", response.message);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    const handleUserClick = (user) => {
        onSelectUser(user); // Pass the selected user to the parent
    };

    return (
        <>
            <Card className="w-100 h-screen rounded-none py-0 gap-0">
                <CardContent className="p-0">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Chats</h2>
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-2">
                            <form>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search" className="pl-8" />
                                </div>
                            </form>
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-96px)] bg-muted">
                        <ul>
                            {(allUsers.length > 0) && allUsers.map((user, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer my-1 mx-2 bg-white rounded-sm"
                                    onClick={() => handleUserClick(user)} // Handle user click
                                >
                                    <div className="flex items-center space-x-3">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-semibold">{user.name}</div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </ScrollArea>
                </CardContent>
            </Card>
        </>
    );
}
