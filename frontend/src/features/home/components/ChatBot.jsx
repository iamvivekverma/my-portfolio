import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { portfolioApi } from "../../../services/api";

const REQUEST_TIMEOUT_MS = 15000;

const SUGGESTIONS = [
  "What's Vivek's tech stack?",
  "Is he open to freelance?",
  "Tell me about his background",
  "How can I contact him?",
];

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function getFriendlyErrorMessage(error) {
  if (error.name === "AbortError") {
    return "That took too long. Please try again in a moment.";
  }

  if (error.message.includes("Failed to fetch")) {
    return "I can't reach the server right now. Make sure the backend is running.";
  }

  if (error.message.includes("Failed to get response from AI")) {
    return "The AI service had an issue responding. Please try again.";
  }

  if (error.message.includes("temporarily overloaded")) {
    return "The AI service is busy right now. Please try again in a moment.";
  }

  return "Oops! Something went wrong. Please try again.";
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey! 👋 I'm Vivek's assistant. Ask me anything about his skills, projects, or how to work with him!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowStatus(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const sendMessage = async (text = input.trim()) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    const isRetry = userText === lastUserMessage && messages[messages.length - 1]?.role !== "user";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    setInput("");
    setShowSuggestions(false);
    setErrorMessage("");
    setLastUserMessage(userText);

    const newMessages = isRetry
      ? messages
      : [...messages, { role: "user", content: userText }];

    setMessages(newMessages);
    setLoading(true);

    try {
      const data = await portfolioApi.chatbot(
        userText,
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        {
          signal: controller.signal,
        },
      );

      const reply = data.response || "Sorry, I couldn't get a response. Try again!";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: getFriendlyErrorMessage(error) },
      ]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative">

      {/* ── CHAT WINDOW ── */}
      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute bottom-20 right-0 z-50"
            style={{
              width: "min(340px, calc(100vw - 48px))",
              height: "440px",
              borderRadius: "20px",
              background: "#fdf6ec",
              border: "1.5px solid #e8940a",
 
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* HEADER — mini jailed bot avatar */}
            <div
              style={{
                background: "#2a1a0a",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #e8940a",
                  position: "relative",
                  flexShrink: 0,
                  boxShadow: "0 0 10px rgba(232,148,10,0.4)",
                }}
              >
                {[...Array(4)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: `${12 + i * 22}%`,
                      width: "2px",
                      background: "rgba(30,20,10,0.55)",
                      zIndex: 2,
                    }}
                  />
                ))}
                <img
                  src="/assets/images/bot.png"
                  alt="Vivek's assistant"
                  style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#fdf6ec", lineHeight: 1.3 }}>
                  Vivek's Assistant
                </p>
                <p style={{ margin: 0, fontSize: "10px", color: "#b8956a" }}>
                  Ask me anything about Vivek
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#b8956a",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  lineHeight: 1,
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* MESSAGES */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px 12px 6px",
                display: "flex",
                flexDirection: "column",
                gap: "9px",
              }}
            >
              {messages.map((msg, i) => (
                <Motion.div
                  key={i}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "8px 12px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "#e8940a" : "#fff",
                      color: msg.role === "user" ? "#fff" : "#2a1a0a",
                      fontSize: "12.5px",
                      lineHeight: 1.55,
                      border: msg.role === "assistant" ? "1px solid #f0d9b5" : "none",
                      boxShadow: msg.role === "user" ? "0 0 10px rgba(232,148,10,0.3)" : "none",
                    }}
                  >
                    {msg.content}
                  </div>
                </Motion.div>
              ))}

              {/* TYPING DOTS */}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "16px 16px 16px 4px",
                      background: "#fff",
                      border: "1px solid #f0d9b5",
                      display: "flex",
                      gap: "5px",
                      alignItems: "center",
                    }}
                  >
                    {[0, 1, 2].map((dot) => (
                      <Motion.div
                        key={dot}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8940a" }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: dot * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SUGGESTION CHIPS */}
              {showSuggestions && messages.length === 1 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      style={{
                        fontSize: "11px",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        border: "1.5px solid #e8940a",
                        background: "transparent",
                        color: "#c47a1e",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all 0.18s",
                      }}
                      onMouseEnter={(e) => { e.target.style.background = "#e8940a"; e.target.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#c47a1e"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {errorMessage && !loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <button
                    onClick={() => sendMessage(lastUserMessage)}
                    style={{
                      fontSize: "11px",
                      padding: "5px 10px",
                      borderRadius: "999px",
                      border: "1.5px solid #e8940a",
                      background: "#fff7e7",
                      color: "#9b5a00",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Retry last message
                  </button>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT BAR */}
            <div
              style={{
                padding: "10px",
                borderTop: "1px solid #f0d9b5",
                display: "flex",
                gap: "8px",
                background: "#fff",
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about Vivek..."
                maxLength={280}
                style={{
                  flex: 1,
                  border: "1.5px solid #f0d9b5",
                  borderRadius: "999px",
                  padding: "7px 14px",
                  fontSize: "12.5px",
                  outline: "none",
                  background: "#fdf6ec",
                  color: "#2a1a0a",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e8940a")}
                onBlur={(e) => (e.target.style.borderColor = "#f0d9b5")}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: input.trim() && !loading ? "#e8940a" : "#f0d9b5",
                  border: "none",
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  boxShadow: input.trim() && !loading ? "0 0 10px rgba(232,148,10,0.4)" : "none",
                }}
              >
                <SendIcon />
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── STATUS BUBBLE (your original, hidden when chat is open) ── */}
      <div
        className={`absolute -top-12 -left-35 transition-all duration-1000 ${
          showStatus && !open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-green-200 lg:border-primary/80 whitespace-nowrap">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 lg:bg-primary rounded-full" />
            <div className="absolute inset-0 w-2 h-2 bg-green-500 lg:bg-primary/80 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-medium text-gray-700">Available for new projects</span>
          <button
            onClick={() => setShowStatus(false)}
            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Close status"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── JAILED BOT (your original design, now opens the chat) ── */}
      <Motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={() => { setOpen((prev) => !prev); setShowStatus(false); }}
        className="sm:w-17 sm:h-17 w-15 h-15 rounded-full backdrop-blur-md border-2 border-primary flex items-center justify-center overflow-hidden cursor-pointer relative"
        style={{
          boxShadow: open
            ? "0 0 20px rgba(232,148,10,0.6), 0 0 44px rgba(232,148,10,0.25)"
            : undefined,
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Prison bars — your original */}
        <div className="absolute inset-0 flex justify-around z-20 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="w-[3px] h-full bg-slate-800/40" />
          ))}
        </div>
        {/* Bot image — your original */}
        <img
          src="/assets/images/bot.png"
          alt="Chat with Vivek's assistant"
          className="w-full h-full z-10"
        />
      </Motion.div>

    </div>
  );
}
