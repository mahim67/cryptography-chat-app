"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Label } from "@/components/ui/label";
import { register } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';

export function RegisterForm({ className, ...props }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function onSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        try {
            const { message, status } = await register(formData);

            if (status === 201) {
                toast.success("You have successfully registered. Redirecting to login...");
                router.push("/login");
            } else {
                console.log('error', message);
                toast.error(message || "An error occurred. Please try again.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-2">
                    <div className="grid gap-1">
                        <Label htmlFor="name">
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="John"
                            type="text"
                            autoCapitalize="none"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="grid gap-1">
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            placeholder="Password"
                            type="password"
                            disabled={isLoading}
                            required
                            onChange={handleInputChange}
                        />
                    </div>
                    <Button disabled={isLoading}>
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign Up with Email
                    </Button>
                </div>
            </form>
            {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading}>
                {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Icons.gitHub className="mr-2 h-4 w-4" />
                )}{" "}
                GitHub
            </Button> */}
        </div>
    );
}
