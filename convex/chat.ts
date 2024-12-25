import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const chatList = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    let query_1 = await ctx.db
      .query("chats")
      .withIndex("by_user_initiator", (q) => q.eq("initiatorId", args.id))
      .order("desc")
      .collect(); // مرتب‌سازی بر اساس جدیدترین پیام

    let query_2 = await ctx.db
      .query("chats")
      .withIndex("by_user_participant", (q) => q.eq("participantId", args.id))
      .order("desc")
      .collect(); // مرتب‌سازی بر اساس جدیدترین پیام
    const chats = [...query_1, ...query_2];

    // const result = await Promise.all(
    //   chats.map(async (chat) => {
    //     const unreadMessagesCount = await ctx.db
    //       .query("messages")
    //       .withIndex("by_chatId", (q) =>
    //         q.eq("chatId", chat._id).neq("status", "READ")
    //       )
    //       .count();

    //     return {
    //       ...chat,
    //       unreadMessagesCount,
    //     };
    //   })
    // );

    return [...query_1, ...query_2];
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
