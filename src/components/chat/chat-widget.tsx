"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
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
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendMessage("__init__", true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Clear the unread dot whenever the widget is opened
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

      // If the widget is closed when a reply arrives, flag it unread
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
        <div className="mb-4 flex h-[70vh] max-h-[500px] w-[calc(100vw-2rem)] max-w-[350px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3">
            <span className="text-sm font-semibold text-white sm:text-base">
              LeadFlow AI Assistant
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-3.5 py-2 text-sm text-gray-400 dark:bg-gray-800">
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-700"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 min-w-0 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50"
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

        {/* Unread notification dot */}
        {hasUnread && !isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500 dark:border-gray-900" />
          </span>
        )}
      </button>
    </div>
  );
        }
