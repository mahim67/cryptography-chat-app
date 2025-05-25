"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NewUser } from "./new-user";
import { decryptMessage } from "@/lib/cryptoFunctions";
import { formatDistanceToNow } from "date-fns";
import { useConversationContext } from "@/contexts/ConversationContext";

export default function ChatList({ onSelectUser }) {
    const {
        conversations,
        loading,
        error,
        searchQuery,
        handleSearch,
        refreshConversations,
        socketConnected,
        socketError,
        isUserOnline
    } = useConversationContext();
    
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

    const handleUserClick = (user) => {
        onSelectUser(user);
        router.push(`/user/${user?.user_id}`);
    };

    // Socket Configuration 
    

    return (
        <>
            <Card className="w-100 h-screen rounded-none py-0 gap-0">
                <CardContent className="p-0">
                    <div className="border-b p-4">
                        <div className="flex">
                            <h2 className="text-lg font-semibold">Chats</h2>
                            {/* Socket Status Indicator */}
                            <div className="ml-2 flex items-center">
                                <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="ml-1 text-xs text-gray-500">
                                    {socketConnected ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="rounded-full"
                                                onClick={refreshConversations}
                                                disabled={loading}
                                            >
                                                <RotateCcw className={loading ? "animate-spin" : ""} />
                                                <span className="sr-only">Refresh conversations</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent sideOffset={10}>Refresh conversations</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <NewUser />
                            </div>
                        </div>
                        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-2">
                            <form>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search"
                                        className="pl-8"
                                        defaultValue={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-96px)] bg-muted">
                        {error ? (
                            <div className="flex items-center justify-center p-4">
                                <div className="text-sm text-red-500">Error: {error}</div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex items-center justify-center p-4">
                                <div className="text-sm text-muted-foreground">No conversations yet</div>
                            </div>
                        ) : (
                            <ul>
                                {conversations.map((user, index) => (
                                <li
                                    key={index}
                                    className="flex items-center p-2 hover:bg-gray-200 cursor-pointer my-1 mx-2 bg-white rounded-sm"
                                    onClick={() => handleUserClick(user?.participants)}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            {isUserOnline(user?.participants?.user_id) && (
                                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center">
                                                    <div className="font-semibold">{user?.participants?.name}</div>
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        {isUserOnline(user?.participants?.user_id) ? "(online)" : ""}
                                                    </span>
                                                </div>
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
                        )}
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