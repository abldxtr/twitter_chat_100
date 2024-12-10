import Header from "@/components/header";
import Main from "@/components/main";
import Image from "next/image";
import { faker } from "@faker-js/faker";
import db from "@/lib/prisma";

export default async function Home() {
  // update user picture by call db.user.update
  // const users = await db.user.findMany();

  // const updatedUsers = await Promise.all(
  //   users.map(async (user) => {
  //     const newAvatar = faker.image.avatar();
  //     return db.user.update({
  //       where: { id: user.id },
  //       data: { image: newAvatar },
  //     });
  //   })
  // );

  // const avatar = faker.image.avatar(); cm3z541yl000010g5hdk746pu
  return (
    <div className="w-full isolate mx-auto flex h-dvh  overflow-hidden">
      <Main param="" />
    </div>
  );
}

// const queryClient = useQueryClient();

// useEffect(() => {
//   queryClient.prefetchQuery({
//     queryKey: ['messages', user.id],
//     queryFn: () => fetchMessages(user.id),
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// }, [user.id, queryClient]);
