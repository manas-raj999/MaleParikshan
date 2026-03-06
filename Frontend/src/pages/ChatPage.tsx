import React, { useState, useRef, useEffect } from "react";
import { useMode } from "../context/ModeContext";
import { chatService } from "../services/chatService";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  edited?: boolean;
}

const ChatPage = () => {
  const { isAdultMode } = useMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("chatTheme");
    return saved ? JSON.parse(saved) : false;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Mode-specific configuration
  const modeConfig = isAdultMode
    ? {
        name: "MasterGogo",
        emoji: "🧘",
        accent: "#ef4444",
        gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
        lightAccent: "rgba(239, 68, 68, 0.1)",
        description: "Your adult wellness guide. Here to discuss challenges, boundaries, and personal growth with maturity and respect.",
        suggestedQuestions: [
          "How to manage impulses and urges?",
          "Building healthy boundaries",
          "Understanding consent",
          "Tips for self-regulation?",
        ],
      }
    : {
        name: "BaalVeer",
        emoji: "💪",
        accent: "#3b82f6",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        lightAccent: "rgba(59, 130, 246, 0.1)",
        description: "Your wellness companion. Ask me about fitness, nutrition, mental health, sleep, and building positive habits.",
        suggestedQuestions: [
          "How to improve sleep quality?",
          "Tips for managing stress?",
          "Building a morning routine",
          "Healthy eating habits?",
        ],
      };

  // Theme colors
  const theme = {
    bg: isDarkMode ? "#0f1419" : "#ffffff",
    headerBg: isDarkMode ? "#1a1f26" : "#f7f7f7",
    border: isDarkMode ? "rgba(255,255,255,0.1)" : "#d1d5db",
    text: isDarkMode ? "#ececf1" : "#1f2937",
    textSecondary: isDarkMode ? "rgba(236, 237, 241, 0.6)" : "#6b7280",
    inputBg: isDarkMode ? "rgba(255,255,255,0.05)" : "#ffffff",
    inputBorder: isDarkMode ? "rgba(255,255,255,0.12)" : "#d1d5db",
    buttonBg: isDarkMode ? "#f3f4f6" : "#f3f4f6",
    buttonBgHover: isDarkMode ? "rgba(100, 116, 139, 0.4)" : "#e5e7eb",
    aiMessageBg: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "#f3f4f6",
    userMessageBg: modeConfig.accent,
    accentColor: modeConfig.accent,
  };

  // Save theme preference
  useEffect(() => {
    localStorage.setItem("chatTheme", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const messageId = Date.now().toString();
    setInput("");
    setLoading(true);
    setSelectedFile(null);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        role: "user",
        content: messageText,
        timestamp: new Date(),
      },
    ]);

    try {
      // Use chat service to send message
      const response = await chatService.send(
        messageText,
        isAdultMode ? "adult" : "normal"
      );

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: response.response,
          timestamp: new Date(response.timestamp),
        },
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Sorry, I encountered an error. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "ai",
          content: errorMsg,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT MESSAGE ================= */
  const editMessage = (id: string, content: string) => {
    setEditingId(id);
    setEditInput(content);
  };

  const saveEdit = async (id: string) => {
    if (!editInput.trim()) return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? { ...msg, content: editInput, edited: true }
          : msg
      )
    );

    // Remove AI response that followed this message
    setMessages((prev) => {
      const index = prev.findIndex((m) => m.id === id);
      return prev.filter(
        (_, idx) => !(idx > index && prev[idx].role === "ai")
      );
    });

    setEditingId(null);
    setEditInput("");
    await sendMessage(editInput);
  };

  /* ================= VOICE INPUT ================= */
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /* ================= TEXT TO SPEECH ================= */
  const speak = (text: string) => {
    const cleaned = text.replace(/[*#_`\[\]()]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  /* ================= FORMAT TEXT ================= */
  const formatText = (text: string) => {
    const paragraphs = text.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, pIdx) => (
      <div key={pIdx} style={{ marginBottom: "12px", lineHeight: "1.7" }}>
        {paragraph.split("\n").map((line, lineIdx) => (
          <div key={lineIdx} style={{ marginBottom: "6px" }}>
            {line
              .split("**")
              .map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i}>{part}</strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
          </div>
        ))}
      </div>
    ));
  };

  /* ================= CHATGPT-LIKE UI ================= */
  return (
    <div
      style={{
        background: theme.bg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif",
        color: theme.text,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: theme.headerBg,
          borderBottom: `2px solid ${modeConfig.accent}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: modeConfig.gradient,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: `0 4px 12px ${modeConfig.accent}40`,
            }}
          >
            {modeConfig.emoji}
          </div>
          <div>
            <h1 style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: theme.text }}>
              {modeConfig.name}
            </h1>
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: "12px",
                color: theme.textSecondary,
              }}
            >
              {isAdultMode ? "Wellness Coach" : "Your Health Guide"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            background: theme.buttonBg,
            border: `1px solid ${theme.border}`,
            padding: "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "18px",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = theme.buttonBgHover;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = theme.buttonBg;
          }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </div>

      {/* MESSAGES */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.bg,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                background: modeConfig.gradient,
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "48px",
                marginBottom: "24px",
                boxShadow: `0 8px 24px ${modeConfig.accent}40`,
                animation: "bounce 2s infinite",
              }}
            >
              {modeConfig.emoji}
            </div>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "24px", fontWeight: "600", color: theme.text }}>
              {modeConfig.name}
            </h2>
            <p style={{ color: theme.textSecondary, fontSize: "14px", marginBottom: "32px", maxWidth: "450px" }}>
              {modeConfig.description}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                maxWidth: "500px",
                width: "100%",
              }}
            >
              {modeConfig.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: isDarkMode ? "rgba(255,255,255,0.05)" : modeConfig.lightAccent,
                    border: `1px solid ${modeConfig.accent}40`,
                    color: theme.text,
                    padding: "12px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "500",
                    textAlign: "left",
                    lineHeight: "1.4",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.1)" : modeConfig.lightAccent;
                    e.currentTarget.style.borderColor = modeConfig.accent;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.05)" : modeConfig.lightAccent;
                    e.currentTarget.style.borderColor = `${modeConfig.accent}40`;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              style={{
                marginBottom: "16px",
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              {msg.role === "ai" && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: modeConfig.gradient,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {modeConfig.emoji}
                </div>
              )}
              <div
                style={{
                  maxWidth: "70%",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {editingId === msg.id && msg.role === "user" ? (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      autoFocus
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: `1px solid ${theme.inputBorder}`,
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: theme.inputBg,
                        color: theme.text,
                      }}
                    />
                    <button
                      onClick={() => saveEdit(msg.id)}
                      style={{
                        background: theme.accentColor,
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        background: theme.buttonBg,
                        color: theme.text,
                        border: `1px solid ${theme.inputBorder}`,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      background:
                        msg.role === "user" ? modeConfig.accent : (isDarkMode ? "rgba(255, 255, 255, 0.08)" : modeConfig.lightAccent),
                      color: msg.role === "user" ? "white" : theme.text,
                      padding: "12px 16px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      borderLeft: msg.role === "ai" ? `3px solid ${modeConfig.accent}` : "none",
                      boxShadow:
                        msg.role === "user"
                          ? `0 2px 8px ${modeConfig.accent}30`
                          : "none",
                    }}
                  >
                    {msg.role === "ai" ? formatText(msg.content) : msg.content}

                    {msg.edited && msg.role === "user" && (
                      <span style={{ fontSize: "11px", opacity: 0.6, marginTop: "4px", display: "block" }}>
                        (edited)
                      </span>
                    )}
                  </div>
                )}

                {msg.role === "ai" && msg.content && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={() => speak(msg.content)}
                      title="Listen to response"
                      style={{
                        background: "transparent",
                        color: modeConfig.accent,
                        border: `1px solid ${modeConfig.accent}60`,
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = modeConfig.lightAccent;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      🔊
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content);
                        alert("Copied!");
                      }}
                      title="Copy response"
                      style={{
                        background: "transparent",
                        color: modeConfig.accent,
                        border: `1px solid ${modeConfig.accent}60`,
                        padding: "6px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        transition: "all 0.2s",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = modeConfig.lightAccent;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      📋
                    </button>
                  </div>
                )}

                {msg.role === "user" && !editingId && (
                  <button
                    onClick={() => editMessage(msg.id, msg.content)}
                    title="Edit message"
                    style={{
                      background: "transparent",
                      color: modeConfig.accent,
                      border: "none",
                      padding: "4px 0",
                      cursor: "pointer",
                      fontSize: "12px",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.opacity = "0.7";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    ✏️ Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div style={{ display: "flex", gap: "6px", marginTop: "16px", alignItems: "flex-end" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: modeConfig.gradient,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              {modeConfig.emoji}
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: modeConfig.accent,
                  animation: "pulse 1.5s infinite",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: modeConfig.accent,
                  animation: "pulse 1.5s infinite 0.2s",
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: modeConfig.accent,
                  animation: "pulse 1.5s infinite 0.4s",
                }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div
        style={{
          borderTop: `1px solid ${theme.border}`,
          padding: "16px 24px 24px",
          background: theme.bg,
        }}
      >
        {selectedFile && (
          <div
            style={{
              background: modeConfig.lightAccent,
              padding: "8px 12px",
              borderRadius: "8px",
              marginBottom: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
              color: theme.text,
              border: `1px solid ${modeConfig.accent}40`,
            }}
          >
            📎 {selectedFile.name}
            <button
              onClick={() => setSelectedFile(null)}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              ❌
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
          <input
            type="text"
            placeholder={`Ask ${modeConfig.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 14px",
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: "12px",
              fontSize: "14px",
              outline: "none",
              background: theme.inputBg,
              color: theme.text,
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = modeConfig.accent;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.inputBorder;
            }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach file"
            style={{
              background: theme.buttonBg,
              border: `1px solid ${theme.inputBorder}`,
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = theme.buttonBgHover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = theme.buttonBg;
            }}
          >
            📎
          </button>

          <button
            onClick={toggleVoiceInput}
            title={isListening ? "Stop recording" : "Start recording"}
            style={{
              background: isListening ? modeConfig.accent : theme.buttonBg,
              border: isListening ? "none" : `1px solid ${theme.inputBorder}`,
              color: isListening ? "white" : theme.text,
              padding: "10px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "all 0.2s",
              boxShadow: isListening ? `0 4px 12px ${modeConfig.accent}40` : "none",
            }}
            onMouseOver={(e) => {
              if (!isListening) {
                e.currentTarget.style.background = theme.buttonBgHover;
              }
            }}
            onMouseOut={(e) => {
              if (!isListening) {
                e.currentTarget.style.background = theme.buttonBg;
              }
            }}
          >
            🎙️
          </button>

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              background:
                input.trim() && !loading ? modeConfig.accent : theme.inputBorder,
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s",
              boxShadow:
                input.trim() && !loading
                  ? `0 4px 12px ${modeConfig.accent}40`
                  : "none",
            }}
            onMouseOver={(e) => {
              if (input.trim() && !loading) {
                e.currentTarget.style.opacity = "0.9";
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
          }
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
