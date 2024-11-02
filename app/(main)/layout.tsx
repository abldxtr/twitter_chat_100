import { auth } from "@/auth";
import Header from "@/components/header";
import Main from "@/components/main";

export default async function ConversationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await auth();
  // console.log("userrr", user);
  return (
    <div className="container isolate mx-auto flex h-screen  overflow-hidden">
      <div className=" overflow-auto  h-full scrl flex w-full  ">
        <Header />
        {children}
      </div>
    </div>
  );
}
