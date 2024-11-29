import { auth } from "@/auth";
import Main from "@/components/main";
import db from "@/lib/prisma";
import { redirect } from "next/navigation";

interface IParams {
  conversationId: string;
}
// export const dynamic = "force-dynamic";
const ConversationId = async (props: {
  params: Promise<{
    conversationId: string;
  }>;
}) => {
  const param = (await props.params).conversationId;
  const current = await auth();
  console.log("param", param);

  if (!current) {
    return redirect("/login");
  }

  const userId = current.user!.id!;

  const chat = await db.chat.findFirst({
    where: {
      id: param,
    },
  });

  if (chat) {
    const ispart = chat.initiatorId === userId || chat.participantId === userId;
    if (!ispart) {
      return redirect("/");
    }
  }

  return (
    <div className="w-full h-full">
      <Main param={param} />
    </div>
  );
};

export default ConversationId;
