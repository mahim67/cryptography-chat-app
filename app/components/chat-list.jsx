"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllUsers } from "@/services/chat-list-service";
import { NewUser } from "./new-user";
import { decryptMessage } from "@/lib/cryptoFunctions";
import { formatDistanceToNow } from "date-fns";

export default function ChatList({ onSelectUser }) {
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const [loginUser, setLoginUser] = useState(null);
    const [privatekey, setPrivatekey] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem("userData");
        if (userData) {
            setLoginUser(JSON.parse(userData).user);
            setPrivatekey(JSON.parse(userData).privateKey);
        }
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                if (response.status === 200) {
                    setAllUsers(response.data);
                    setFilteredUsers(response.data);
                } else {
                    console.error("Error fetching users:", response.message);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        if (privatekey) {
            fetchUsers();
        }

    }, [privatekey]);

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredUsers(
            allUsers.filter((user) =>
                user.name.toLowerCase().includes(query)
            )
        );
    };

    const handleUserClick = (user) => {
        onSelectUser(user);
        router.push(`/user/${user?.user_id}`);
    };

    return (
        <>
            <Card className="w-100 h-screen rounded-none py-0 gap-0">
                <CardContent className="p-0">
                    <div className="border-b p-4">
                        <div className="flex">
                            <h2 className="text-lg font-semibold">Chats</h2>
                            <NewUser />
                        </div>
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-2">
                            <form>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search"
                                        className="pl-8"
                                        defaultValue={searchQuery}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-96px)] bg-muted">
                        <ul>
                            {(filteredUsers.length > 0) && filteredUsers.map((user, index) => (
                                <li
                                    key={index}
                                    className="flex items-center p-2 hover:bg-gray-200 cursor-pointer my-1 mx-2 bg-white rounded-sm"
                                    onClick={() => handleUserClick(user?.participants)}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        <div className="w-full">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="font-semibold">{user?.participants?.name}</div>
                                                <div className="text-xs">
                                                    {user?.lastMessage?.created_at ? formatDistanceToNow(new Date(user?.lastMessage?.created_at), {
                                                        addSuffix: true,
                                                    }) : ''}
                                                </div>
                                            </div>
                                            <ChatUserMessageDecrypt
                                                lastMessage={user?.lastMessage}
                                                privateKey={privatekey}
                                                loginUser={loginUser}
                                            />
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

const ChatUserMessageDecrypt = ({ lastMessage, privateKey, loginUser }) => {
    const [message, setMessage] = useState('');
    const textLimit = 50;

    useEffect(() => {
        const decryptedMessage = async () => {
            const decryptKey = lastMessage.sender_id === loginUser.id ? lastMessage.sender_decrypt_key : lastMessage.receiver_decrypt_key;

            const decrypted = await decryptMessage(
                lastMessage?.message,
                decryptKey,
                lastMessage?.iv,
                privateKey,
                lastMessage?.auth_tag
            );
            setMessage(decrypted);
        };

        if (lastMessage) {
            decryptedMessage();
        }
    }, [lastMessage, privateKey]);

    const truncatedMessage = message.length > textLimit ? `${message.slice(0, textLimit)}...` : message;

    return (
        <div className="text-xs text-gray-500">
            {truncatedMessage}
        </div>
    );
};