import Main from "@/components/main";

interface IParams {
  conversationId: string;
}
export const dynamic = "force-dynamic";
const ConversationId = async (props: {
  params: Promise<{
    conversationId: string;
  }>;
}) => {
  const param = (await props.params).conversationId;

  return (
    <div className="w-full h-full">
      <Main param={param} />
    </div>
  );
};

export default ConversationId;
