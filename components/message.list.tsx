// "use client";

// import { useRouter } from "next/navigation";
import MessageHeader from "./message/m-header";
import MessageRequest from "./message/m-request";
import UserList from "./message/m-list";
import { ChatList, user } from "@/lib/definitions";
// import { useParams } from "next/navigation";

export default function Message_list({
  param,
  chatlist,
  first,
}: {
  param: string;
  chatlist: ChatList;
  first: user | undefined;
}) {
  const currentUser = first ? first.id : "";
  return (
    <section className=" max-w-[400px] lg:flex hidden  relative flex-1 border-x-[1px] border-[#eff3f4]">
      <div className="flex  w-full flex-col">
        {/* <!-- head --> */}
        <MessageHeader />
        {/* <!-- body --> */}
        {/* <!-- 1 --> */}
        <MessageRequest />

        {/* <!-- 2 --> */}
        {chatlist.map((item, index: number) => {
          if (item.id === currentUser) {
            return;
          }
          const active = item.id === param;
          const href = `/${item.id}`;
          // const currentUser = kkk;

          const img =
            "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg";

          return (
            <UserList
              id={item.id}
              img={img}
              name={item.id}
              href={href}
              key={index}
              active={active}
            />
          );
        })}
      </div>
    </section>
  );
}

// const router = useRouter();
// const users = [
//   {
//     name: "GE Aerospace",
//     id: "@GE_Aerospace",
//     img: "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg",
//     href: "12345",
//   },
//   {
//     name: "Abldxtr",
//     id: "@Abldxtr",
//     img: "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg",
//     href: "12346",
//   },
// ];
