import Header from "@/components/header";
import Main from "@/components/main";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="container isolate mx-auto flex h-screen  overflow-hidden">
        {/* <div className=" overflow-auto  h-full scrl  ">
          <Header />
        </div> */}
        <Main param="" />
      </div>
    </div>
  );
}
