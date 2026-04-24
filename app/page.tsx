"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        role: "ai",
        content: "Hi, I am Dhruvik's assistant. How can I help you today?",
      },
    ]);
  }, []);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🧠 Typing animation function
  const typeMessage = async (text: string) => {
    let current = "";
    for (let i = 0; i < text.length; i++) {
      current += text[i];

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: current,
        };
        return updated;
      });

      await new Promise((res) => setTimeout(res, 15)); // speed
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: userMsg }),
    });

    const data = await res.json();

    // add empty AI message first
    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    setLoading(false);

    // animate typing
    await typeMessage(data.reply || "Error");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dhruvik AI Assistant</h1>

      {/* CHAT */}
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
              background:
                msg.role === "user"
                  ? "#2563eb"
                  : "rgba(255,255,255,0.1)",
            }}
          >
            {msg.content}
          </div>
        ))}

        {/* 🔵 Loading indicator */}
        {loading && (
          <div style={styles.loading}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles: any = {

  container: {
  height: "100dvh",
  width: "100%",   
  maxWidth: "600px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  padding: "12px",
  boxSizing: "border-box",
  color: "white",
},


  title: {
    marginBottom: "10px",
  },

  chatBox: {
    flex: 1,
    width: "100%",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
  },

  message: {
    maxWidth: "80%", 
    wordBreak: "break-word", 
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
  },

  inputArea: {
  display: "flex",
  gap: "8px",
  marginTop: "10px",
  width: "100%",
  },

  input: {
    flex: 1,
    minWidth: 0,
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },

  button: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },

  // 🔵 typing dots
  loading: {
    display: "flex",
    gap: "4px",
    padding: "10px",
  },
};
