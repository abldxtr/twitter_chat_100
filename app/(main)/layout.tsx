import { auth } from "@/auth";
import Header from "@/components/header";
import Main from "@/components/main";
export const dynamic = "force-dynamic";

export default async function ConversationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await auth();
  // console.log("userrr", user);
  return (
    <div className="w-full max-w-[2400px] isolate mx-auto flex h-dvh  overflow-hidden">
      <div className=" overflow-auto  h-full scrl flex w-full  ">
        {/* <Header /> */}
        {children}
      </div>
    </div>
  );
}
