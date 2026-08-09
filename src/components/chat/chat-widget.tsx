"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatWidget({ businessId }: { businessId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const visitorIdRef = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = sessionStorage.getItem("leadflow_visitor_id");
    if (!id) {
      id = "visitor_" + Math.random().toString(36).slice(2, 12);
      sessionStorage.setItem("leadflow_visitor_id", id);
    }
    visitorIdRef.current = id;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendMessage("__init__", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  async function sendMessage(text: string, isInit = false) {
    const timestamp = new Date().toISOString();
    let newMessages = messages;

    if (!isInit) {
      const userMsg: Message = { role: "user", content: text, timestamp };
      newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: isInit
            ? [{ role: "user", content: "Hello", timestamp }]
            : newMessages,
          visitor_id: visitorIdRef.current,
          business_id: businessId,
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => (isInit ? [assistantMsg] : [...prev, assistantMsg]));

      if (!isOpen) setHasUnread(true);
    } catch {
      const errorMsg: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again shortly.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => (isInit ? [errorMsg] : [...prev, errorMsg]));
      if (!isOpen) setHasUnread(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="mb-4 flex h-[70vh] max-h-[520px] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl animate-[fadeSlideUp_0.25s_ease-out] dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">LeadFlow AI Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                Online now
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 transition-colors hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-950/50">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 animate-[fadeSlideUp_0.2s_ease-out] ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="flex max-w-[78%] flex-col gap-1">
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-sm bg-gradient-to-br from-blue-600 to-cyan-500 text-white"
                        : "rounded-bl-sm bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {m.content}
                  </div>
                  <span
                    className={`px-1 text-[10px] text-gray-400 dark:text-gray-500 ${
                      m.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(m.timestamp)}
                  </span>
                </div>
                {m.role === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex animate-[fadeSlideUp_0.2s_ease-out] items-end gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s] dark:bg-gray-500" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] dark:bg-gray-500" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm shadow-inner transition-all focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:bg-gray-800"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg transition-transform hover:scale-105 sm:h-14 sm:w-14"
        aria-label="Open chat"
      >
        {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />}

        {hasUnread && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 dark:border-gray-900" />
          </span>
        )}
      </button>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
