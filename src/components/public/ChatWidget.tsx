"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, User, Sparkles, Maximize2 } from "lucide-react";
import { useSiteContent } from "@/lib/site-content";

type Message = { role: "assistant" | "user"; text: string };

export function ChatWidget() {
  const AI_SUPPORT_CONTENT = useSiteContent("ai_support");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [{ role: "assistant", text: AI_SUPPORT_CONTENT.greeting }]);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function send(text: string) {
    if (!text.trim()) return;
    const nextMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) throw new Error(data.error ?? "Chat failed");
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      if (data.suggestHuman) {
        setOpen(false);
        router.push("/chat?mode=human");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong — try again, or reach us on WhatsApp." },
      ]);
    }
  }

  return (
    <>
      <motion.button
        ref={toggleRef}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-black shadow-[var(--shadow-glow-violet)] lg:bottom-24 lg:right-8"
        style={{ background: "var(--accent-gradient)" }}
        aria-label="Open chat support"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={22} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass-panel fixed bottom-36 right-5 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col rounded-[var(--radius-lg)] lg:bottom-40 lg:right-8"
            style={{ background: "var(--surface-solid)", boxShadow: "var(--shadow-soft)" }}
          >
            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "var(--accent-gradient)" }}>
                <Sparkles size={15} className="text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text)]">Nashemann Assistant</p>
                <p className="text-[0.7rem] text-[var(--text-faint)]">AI · escalates anytime</p>
              </div>
              <Link
                href="/chat"
                className="shrink-0 rounded-full p-1.5 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                aria-label="Open full chat page"
                title="Open full-page chat"
              >
                <Maximize2 size={14} />
              </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.role === "user" ? "text-black" : "bg-[var(--surface-hover)] text-[var(--text)]"
                    }`}
                    style={m.role === "user" ? { background: "var(--accent-gradient)" } : undefined}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {AI_SUPPORT_CONTENT.suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[0.7rem] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                >
                  {p}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-[var(--border)] p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="w-full rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent-violet)]"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black"
                style={{ background: "var(--accent-gradient)" }}
                aria-label="Send"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
    </>
  );
}

// Kept for parity with vendor-storefronts's pattern of a visible "you're talking to a person" cue.
export function HumanBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[0.7rem] text-[var(--text-faint)]">
      <User size={11} /> Human-backed support
    </span>
  );
}
