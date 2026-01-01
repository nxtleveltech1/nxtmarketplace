import { messages } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, or } from "drizzle-orm";

export async function getMessageById(id: string) {
  const [message] = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  return message;
}

export async function getMessagesBySaleId(saleId: string) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.saleId, saleId))
    .orderBy(messages.createdAt);
}

export async function getConversation(
  userId1: string,
  userId2: string,
  saleId?: string
) {
  const conditions = [
    or(
      and(
        eq(messages.senderId, userId1),
        eq(messages.recipientId, userId2)
      ),
      and(
        eq(messages.senderId, userId2),
        eq(messages.recipientId, userId1)
      )
    )!,
  ];

  if (saleId) {
    conditions.push(eq(messages.saleId, saleId));
  }

  return await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(messages.createdAt);
}

export async function getMessagesByUserId(userId: string) {
  return await db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt));
}

export async function getUnreadMessagesByUserId(userId: string) {
  return await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.recipientId, userId),
        eq(messages.read, false)
      )
    )
    .orderBy(desc(messages.createdAt));
}

export async function createMessage(data: {
  senderId: string;
  recipientId: string;
  content: string;
  saleId?: string;
}) {
  const [newMessage] = await db
    .insert(messages)
    .values({
      senderId: data.senderId,
      recipientId: data.recipientId,
      content: data.content,
      saleId: data.saleId,
      read: false,
      createdAt: new Date(),
    })
    .returning();
  return newMessage;
}

export async function markMessageAsRead(id: string) {
  const [updatedMessage] = await db
    .update(messages)
    .set({
      read: true,
    })
    .where(eq(messages.id, id))
    .returning();
  return updatedMessage;
}

export async function markConversationAsRead(
  userId: string,
  otherUserId: string,
  saleId?: string
) {
  const conditions = [
    eq(messages.recipientId, userId),
    eq(messages.senderId, otherUserId),
    eq(messages.read, false),
  ];

  if (saleId) {
    conditions.push(eq(messages.saleId, saleId));
  }

  await db
    .update(messages)
    .set({
      read: true,
    })
    .where(and(...conditions));
}

export async function getConversationsByUserId(userId: string) {
  const userMessages = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      saleId: messages.saleId,
      content: messages.content,
      read: messages.read,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt));

  const conversationMap = new Map<string, {
    otherUserId: string;
    saleId: string | null;
    lastMessage: typeof userMessages[0];
    unreadCount: number;
  }>();

  for (const msg of userMessages) {
    const otherUserId = msg.senderId === userId ? msg.recipientId : msg.senderId;
    const key = msg.saleId ? `${otherUserId}-${msg.saleId}` : otherUserId;

    if (!conversationMap.has(key)) {
      conversationMap.set(key, {
        otherUserId,
        saleId: msg.saleId,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    const conv = conversationMap.get(key)!;
    if (!msg.read && msg.recipientId === userId) {
      conv.unreadCount++;
    }
  }

  return Array.from(conversationMap.values());
}

