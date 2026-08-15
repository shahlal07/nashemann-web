"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSiteContent } from "@/lib/site-content";
import { sendCustomerMessage, getConversationByEmail, subscribeToConversation, type SupportConversation } from "@/lib/support-store";
import { createClient } from "@/lib/supabase/client";

type AiMessage = { role: "user" | "assistant"; content: string };
type Identity = { name: string; email: string };

// Falls back to a demo identity when nobody's logged in, so the chat is
// still explorable without forcing a signup first -- but a real logged-in
// account's own name/email (and their own conversation) takes priority.
const FALLBACK_IDENTITY: Identity = { name: "Zainab Raza", email: "zainab@northernnuts.pk" };

export default function ChatPage() {
  const aiSupportContent = useSiteContent("ai_support");
  const [mode, setMode] = useState<"ai" | "human">("ai");
  const [aiMessages, setAiMessages] = useState<AiMessage[]>(() => [{ role: "assistant", content: aiSupportContent.greeting }]);
  const [aiInput, setAiInput] = useState("");
  const [aiPending, setAiPending] = useState(false);

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [humanInput, setHumanInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!active) return;
      if (!user) {
        setIdentity(null);
        setConversation(await getConversationByEmail(FALLBACK_IDENTITY.email));
        return;
      }
      const { data: acc } = await supabase.from("platform_accounts").select("name, email").eq("id", user.id).single();
      if (!active) return;
      const resolved = acc ? { name: acc.name, email: acc.email } : null;
      setIdentity(resolved);
      setConversation(await getConversationByEmail((resolved ?? FALLBACK_IDENTITY).email));
    });
    return () => {
      active = false;
    };
  }, []);

  const conversationId = conversation?.id;
  useEffect(() => {
    if (!conversationId) return;
    return subscribeToConversation(conversationId, (message) => {
      setConversation((prev) => (prev && prev.id === conversationId ? { ...prev, messages: [...prev.messages, message] } : prev));
    });
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [aiMessages, conversation, mode]);

  function sendAi(text: string) {
    if (!text.trim() || aiPending) return;
    setAiMessages((prev) => [...prev, { role: "user", content: text }]);
    setAiInput("");
    setAiPending(true);
    setTimeout(() => {
      const suggestHuman = /human|person|agent|talk to someone/i.test(text);
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: suggestHuman
            ? "I can connect you with a real person for that — tap \"Talk to a human\" above whenever you're ready."
            : "Got it — happy to help with pricing, applying, or how the platform works. Ask away.",
        },
      ]);
      setAiPending(false);
    }, 700);
  }

  async function talkToHuman() {
    setMode("human");
    if (!conversation) {
      const identityToUse = identity ?? FALLBACK_IDENTITY;
      const convo = await sendCustomerMessage(identityToUse.name, identityToUse.email, "Hi — I'd like to talk to a real person.");
      setConversation(convo);
    }
  }

  async function sendHuman(text: string) {
    if (!text.trim()) return;
    const identityToUse = identity ?? FALLBACK_IDENTITY;
    setHumanInput("");
    const convo = await sendCustomerMessage(identityToUse.name, identityToUse.email, text);
    setConversation(convo);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-5 py-6">
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-[var(--radius-lg)]" style={{ background: "var(--surface-solid)" }}>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "var(--accent-gradient)" }}>
              {mode === "ai" ? <Sparkles size={16} className="text-black" /> : <Users size={16} className="text-black" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                {mode === "ai" ? "Nashemann Support" : "Nashemann Support Team"}
              </p>
              <p className="text-xs text-[var(--text-faint)]">{mode === "ai" ? "Usually replies instantly" : "A real person will reply here"}</p>
            </div>
          </div>
          {mode === "ai" ? (
            identity ? (
              <button
                onClick={talkToHuman}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-hover)]"
              >
                <Users size={13} /> Talk to a human
              </button>
            ) : (
              <Link
                href="/login?returnTo=/chat"
                className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] px-3.5 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-hover)]"
              >
                <Users size={13} /> Talk to a human
              </Link>
            )
          ) : (
            <button
              onClick={() => setMode("ai")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-violet)] hover:underline"
            >
              <ArrowLeft size={13} /> Back to AI Assistant
            </button>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
          <AnimatePresence mode="popLayout">
            {mode === "human" && (
              <motion.div
                key="banner"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-sm rounded-full bg-[var(--surface-hover)] px-4 py-2 text-center text-xs text-[var(--text-muted)]"
              >
                You&apos;re connected with our support team. Send a message and we&apos;ll reply here as soon as we can.
              </motion.div>
            )}
          </AnimatePresence>

          {mode === "ai"
            ? aiMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                      m.role === "user" ? "text-black" : "bg-[var(--surface-hover)] text-[var(--text)]"
                    }`}
                    style={m.role === "user" ? { background: "var(--accent-gradient)" } : undefined}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            : conversation?.messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderType === "customer" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                      m.senderType === "customer" ? "text-black" : "bg-[var(--surface-hover)] text-[var(--text)]"
                    }`}
                    style={m.senderType === "customer" ? { background: "var(--accent-gradient)" } : undefined}
                  >
                    {m.body}
                  </div>
                </div>
              ))}

          {mode === "ai" && aiMessages.length === 1 && (
            <div className="flex flex-wrap gap-1.5">
              {aiSupportContent.suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => sendAi(p)}
                  className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {aiPending && mode === "ai" && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[var(--surface-hover)] px-4 py-2.5 text-sm text-[var(--text-faint)]">Thinking…</div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "ai") sendAi(aiInput);
            else sendHuman(humanInput);
          }}
          className="flex items-center gap-2 border-t border-[var(--border)] p-4"
        >
          <input
            value={mode === "ai" ? aiInput : humanInput}
            onChange={(e) => (mode === "ai" ? setAiInput(e.target.value) : setHumanInput(e.target.value))}
            placeholder="Type a message…"
            className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent-violet)]"
          />
          <button
            type="submit"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black"
            style={{ background: "var(--accent-gradient)" }}
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
