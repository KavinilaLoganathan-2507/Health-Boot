"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m your Health Boot assistant. Ask me about food choices, nutrition labels, or what to scan next.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "Is this product healthy?",
    "What should I check on a label?",
    "Is this good for weight loss?",
    "What about sugar and sodium?",
    "Nutrition value of apple",
  ];

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const parseJsonOrText = (text: string) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const text = await response.text();
      const body = parseJsonOrText(text);

      if (!response.ok) {
        throw new Error(
          body?.error?.message ||
            body?.message ||
            body?.raw ||
            response.statusText ||
            "Chat request failed"
        );
      }

      const reply = body?.data?.reply || "I couldn’t generate a response right now.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : "Chat request failed";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I ran into an issue: ${fallback}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 border-slate-300 px-4 py-6">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-900/15 bg-[#F4F7FB] px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-[#f0ede4]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-base font-semibold text-slate-900">Health Boot Chat</h1>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-3xl flex-col rounded-3xl border border-slate-900/10 bg-[#F4F7FB] shadow-sm">
        <div className="border-b border-slate-900/10 p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-900/70">
            Nutrition coach
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Ask for label breakdowns, healthier swaps, sugar checks, sodium guidance, or weight-loss friendly choices.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-full border border-slate-900/15 bg-[#f8f7f4] px-3 py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-[#f0ede4]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4 p-4 sm:p-6">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-slate-900 text-white"
                    : "bg-[#f0ede4] text-[#1f2937] border-l-4 border-cyan-500 shadow-sm"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-[#f0ede4] px-4 py-3 text-sm text-slate-700 border-l-4 border-cyan-500 shadow-sm">
                Checking the nutrition details...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-900/10 p-4 sm:p-6">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about nutrition, ingredients, or what to eat..."
              rows={2}
              className="min-h-[56px] flex-1 resize-none rounded-2xl border border-slate-200/50 bg-white/40 backdrop-blur-sm px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-cyan-500 focus:bg-white/80 focus:shadow-sm focus:ring-1 focus:ring-cyan-500"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
