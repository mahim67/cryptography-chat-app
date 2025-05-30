"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { decryptPrivateKeyWithPassword } from "@/lib/cryptoFunctions";
import Cookies from "js-cookie";

export function LoginForm({ className, ...props }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
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
            const { message, status, data } = await login(formData);

            if (status === 200) {
                data.privateKey = decryptPrivateKeyWithPassword(data.privateKey, formData.password);
                // Store only the required structure for AuthContext
                const userData = {
                  user: data.user,
                  token: data.token,
                  privateKey: data.privateKey
                };
                localStorage.setItem("userData", JSON.stringify(userData));
                
                // Set cookie with proper settings for production HTTPS
                const cookieOptions = {
                    path: "/",
                    expires: 2,
                    secure: window.location.protocol === 'https:',
                    sameSite: 'Lax'
                };
                
                Cookies.set("userData", JSON.stringify({ token: data.token, privateKey: data.privateKey }), cookieOptions);
                toast.success("Login successfully...");
                
                // Add a small delay to ensure cookie is set before navigation
                setTimeout(() => {
                    router.push("/");
                }, 100);
            } else {
                console.log('error', message);
                toast.error(message || "Invalid credentials. Please try again.");
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
                        Log In
                    </Button>
                </div>
            </form>
        </div>
    );
}
