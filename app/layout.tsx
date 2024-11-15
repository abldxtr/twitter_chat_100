import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalProvider } from "@/context/globalContext";
import { MessageProvider } from "@/context/MessageContext";
import { EmojiProvider } from "@/context/EmojiContext";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { QueryProvider } from "@/provider/query-provider";
import { SocketProvider } from "@/provider/socket-provider";
export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "chat room",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <GlobalProvider>
        <MessageProvider>
          <EmojiProvider>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
              <SocketProvider>
                <SessionProvider session={session}>
                  <QueryProvider>{children}</QueryProvider>
                </SessionProvider>
              </SocketProvider>
            </body>
          </EmojiProvider>
        </MessageProvider>
      </GlobalProvider>
    </html>
  );
}
