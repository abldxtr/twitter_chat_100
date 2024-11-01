import { auth } from "@/auth";
import Main from "@/components/main";
import db from "@/lib/prisma";
// import db from "@/lib/prisma";
// import { getUser } from "@/lib/utils";
import { notFound } from "next/navigation";

interface IParams {
  conversationId: string;
}

const ConversationId = async (props: {
  params: Promise<{
    conversationId: string;
  }>;
}) => {
  const param = (await props.params).conversationId;

  return (
    // <div className="lg:pl-80 h-full">
    <div className="w-full h-full">
      {/* <EmptyState /> */}
      {/* {JSON.parse(user)} */}
      {/* {param} */}
      <Main param={param} />
    </div>
    // </div>
  );
};

export default ConversationId;

// let user;
// const user = await db.profile.create({
//   data: {
//     name: "ali",
//     email: "ali@gmail.com",
//     imageUrl:
//       "https://pbs.twimg.com/profile_images/1564361710554734593/jgWXrher_normal.jpg",
//   },
// });
// const user1 = await db.profile.findMany();

// const user = await getUser(param);
// console.log(user1);
