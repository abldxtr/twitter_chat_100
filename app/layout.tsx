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
import { fetchChat } from "@/lib/data";
import Message_list from "@/components/message.list";
import { redirect } from "next/navigation";
// export const dynamic = "force-dynamic";

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
  const current = await auth();
  if (!current || !current.user || !current.user.id) {
    return redirect("/login");
  }

  const userId = current.user.id;

  const [users] = await Promise.all([fetchChat(userId)]);

  return (
    <html lang="en" suppressHydrationWarning>
      <GlobalProvider>
        <MessageProvider>
          <EmojiProvider>
            <body className={`${geistSans.variable} ${geistMono.variable}`}>
              <SocketProvider>
                <SessionProvider session={current}>
                  <QueryProvider>
                    <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden">
                      <div className=" overflow-auto  h-full scrl flex w-full  ">
                        <main className="flex h-full items-start w-full ">
                          <div className="flex shrink grow flex-1 items-start min-w-full isolate ">
                            {/* <!-- messages list --> */}
                            <Message_list chatlist={users} first={userId} />

                            {children}
                          </div>
                        </main>
                      </div>
                    </div>
                  </QueryProvider>
                </SessionProvider>
              </SocketProvider>
            </body>
          </EmojiProvider>
        </MessageProvider>
      </GlobalProvider>
    </html>
  );
}
