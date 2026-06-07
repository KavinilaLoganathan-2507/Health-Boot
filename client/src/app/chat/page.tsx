"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./chat.module.css";

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
    <div className={styles.pageWrapper}>
      <div className={styles.headerContainer}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.backButton}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className={styles.chatHeader}>Health Boot Chat</h1>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.introSection}>
          <p className={styles.introSubtitle}>
            Nutrition coach
          </p>
          <p className={styles.introDescription}>
            Ask for label breakdowns, healthier swaps, sugar checks, sodium guidance, or weight-loss friendly choices.
          </p>
          <div className={styles.quickPrompts}>
            {quickPrompts.map((prompt) => (
               <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className={styles.promptButton}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`${styles.messageRow} ${message.role === "user" ? styles.messageRowUser : styles.messageRowAssistant}`}
            >
              <div
                className={`${styles.chatMessage} ${
                  message.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageRow} ${styles.messageRowAssistant}`}>
              <div className={`${styles.chatMessage} ${styles.assistantMessage}`}>
                Checking the nutrition details...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.formSection}>
          <div className={styles.formContainer}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about nutrition, ingredients, or what to eat..."
              rows={2}
              className={styles.chatInput}
            />
            <button
              type="submit"
              disabled={!canSend}
              className={styles.sendButton}
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
