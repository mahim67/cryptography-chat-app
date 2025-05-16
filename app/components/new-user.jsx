"use client"

import React, { useEffect, useState } from "react"
import { Check, Plus } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { getSearchingUsers } from "@/services/chat-list-service"
import { useRouter } from "next/navigation"

export function NewUser() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            const response = await getSearchingUsers(query);
            if (response.status === 200) {
                setUsers(response.data);
            } else {
                console.error("Error fetching users:", response.message);
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [open, query]);

    return (
        <>
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            variant="outline"
                            className="ml-auto rounded-full"
                            onClick={() => setOpen(true)}
                        >
                            <Plus />
                            <span className="sr-only">New message</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={10}>New message</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="gap-0 p-0 outline-none">
                    <DialogHeader className="px-4 pb-4 pt-5">
                        <DialogTitle>New message</DialogTitle>
                        <DialogDescription>
                            Invite a user to this thread. This will create a new group message.
                        </DialogDescription>
                    </DialogHeader>
                    <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
                        <CommandInput
                            placeholder="Search user..."
                            onValueChange={(value) => setQuery(value)}
                        />
                        <CommandList>
                            <CommandEmpty>No users found.</CommandEmpty>
                            <CommandGroup className="p-2">
                                {users.map((user) => (
                                    <CommandItem
                                        key={user.email}
                                        className="flex items-center px-2"
                                        onSelect={() => setSelectedUser(user)}
                                    >
                                        <Avatar>
                                            <AvatarImage src={user.avatar} alt="Image" />
                                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="ml-2">
                                            <p className="text-sm font-medium leading-none">
                                                {user.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                        {selectedUser?.id === user?.id && (
                                            <Check className="ml-auto flex h-5 w-5 text-primary" />
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                    <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
                        {selectedUser ? (
                            <div className="flex -space-x-2 overflow-hidden">
                                <Avatar
                                    key={selectedUser.email}
                                    className="inline-block border-2 border-background"
                                >
                                    <AvatarImage src={selectedUser.avatar} />
                                    <AvatarFallback>{selectedUser?.name[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Select users to add to this thread.
                            </p>
                        )}
                        <Button
                            disabled={selectedUser === null}
                            onClick={() => {
                                setOpen(false);
                                router.push(`/user/${selectedUser?.id}`);                                
                            }}
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
