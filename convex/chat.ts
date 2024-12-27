import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const chatList = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    // دریافت چت‌ها به‌عنوان آغازکننده یا شرکت‌کننده
    let query_1 = await ctx.db
      .query("chats")
      .withIndex("by_user_initiator", (q) => q.eq("initiatorId", args.id))
      .order("desc")
      .collect();

    let query_2 = await ctx.db
      .query("chats")
      .withIndex("by_user_participant", (q) => q.eq("participantId", args.id))
      .order("desc")
      .collect();

    const chats = [...query_1, ...query_2];

    // پردازش برای هر چت
    const result = await Promise.all(
      chats.map(async (chat) => {
        // تعداد پیام‌های خوانده‌نشده
        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("receiverId"), args.id),
              q.eq(q.field("status"), "SENT")
            )
          )
          .collect();

        const unreadMessagesCount = unreadMessages.length;

        // آخرین پیام هر چت
        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_chatId", (q) => q.eq("chatId", chat._id))
          .order("desc")
          .first();

        return {
          ...chat,
          unreadMessagesCount,
          lastMessage,
        };
      })
    );

    return result;
  },
});

export const getChat = query({
  args: {
    id: v.id("chats"),
  },
  handler: async (ctx, args) => {
    let chatChannel = await ctx.db.get(args.id);

    return chatChannel;
  },
});

export const createChat = mutation({
  args: {
    first: v.string(),
    second: v.string(),
  },
  handler: async (ctx, args) => {
    const { first, second } = args;

    const messageId = await ctx.db.insert("chats", {
      initiatorId: first,
      participantId: second,
      unreadMessagesCountInitiator: 0,
      unreadMessagesCountParticipant: 0,
    });
  },
});
