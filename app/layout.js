'use client'

import { AuthProvider } from "../contexts/AuthContext";
import { ConversationProvider } from "../contexts/ConversationContext";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import AppLayout from "./_app";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConversationProvider>
            <Toaster position="top-right" />
            <AppLayout>{children}</AppLayout>
          </ConversationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
