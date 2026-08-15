"use client";

import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type SupportMessage = {
  id: string;
  senderType: "customer" | "admin";
  body: string;
  createdAt: string;
};

export type SupportConversation = {
  id: string;
  name: string;
  email: string;
  status: "open" | "closed";
  adminUnread: boolean;
  messages: SupportMessage[];
};

type ConversationRow = {
  id: string;
  name: string;
  email: string;
  status: "open" | "closed";
  admin_unread: boolean;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_type: "customer" | "admin";
  body: string;
  created_at: string;
};

function mapMessage(row: MessageRow): SupportMessage {
  return { id: row.id, senderType: row.sender_type, body: row.body, createdAt: row.created_at };
}

async function loadConversation(conversationId: string): Promise<SupportConversation | null> {
  const supabase = createClient();
  const { data: convo, error: convoError } = await supabase
    .from("support_conversations")
    .select("id, name, email, status, admin_unread")
    .eq("id", conversationId)
    .single();
  if (convoError || !convo) return null;

  const { data: messages, error: messagesError } = await supabase
    .from("support_messages")
    .select("id, conversation_id, sender_type, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (messagesError) return null;

  const row = convo as ConversationRow;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    adminUnread: row.admin_unread,
    messages: (messages as MessageRow[]).map(mapMessage),
  };
}

export async function getConversationByEmail(email: string): Promise<SupportConversation | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("support_conversations")
    .select("id")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return loadConversation((data as { id: string }).id);
}

export async function getConversationById(id: string): Promise<SupportConversation | null> {
  return loadConversation(id);
}

/** Starts a conversation (or reuses the existing one for this email) and appends a customer message. */
export async function sendCustomerMessage(name: string, email: string, body: string): Promise<SupportConversation> {
  const supabase = createClient();
  const userId = await supabase.auth
    .getUser()
    .then(({ data }) => data.user?.id ?? null)
    .catch(() => null);

  const existing = await getConversationByEmail(email);
  let conversationId = existing?.id;

  if (!conversationId) {
    const { data: created, error: createError } = await supabase
      .from("support_conversations")
      .insert({ account_id: userId, name, email, status: "open", admin_unread: true })
      .select("id")
      .single();
    if (createError || !created) throw createError ?? new Error("Failed to start conversation");
    conversationId = (created as { id: string }).id;
  } else {
    await supabase.from("support_conversations").update({ status: "open", admin_unread: true }).eq("id", conversationId);
  }

  const { error: messageError } = await supabase
    .from("support_messages")
    .insert({ conversation_id: conversationId, sender_type: "customer", body });
  if (messageError) throw messageError;

  const conversation = await loadConversation(conversationId);
  if (!conversation) throw new Error("Failed to load conversation after send");
  return conversation;
}

/**
 * Subscribes to new messages in a conversation via Supabase Realtime so a
 * live chat reflects replies without polling. Returns an unsubscribe fn.
 */
export function subscribeToConversation(conversationId: string, onMessage: (message: SupportMessage) => void): () => void {
  const supabase = createClient();
  const channel: RealtimeChannel = supabase
    .channel(`support_messages:${conversationId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessage(mapMessage(payload.new as MessageRow))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
