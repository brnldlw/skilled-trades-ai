"use client";

import React, { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AiChatBotProps = {
  equipmentType?: string;
  manufacturer?: string;
  model?: string;
  refrigerantType?: string;
  symptom?: string;
  propertyType?: string;
  observations?: { label: string; value: string; unit: string; note?: string }[];
};

// ─── helpers ─────────────────────────────────────────────────
function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Markdown-lite renderer ───────────────────────────────────
// Handles **bold**, *italic*, bullet lists, numbered lists, code.
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];
  let listOrdered = false;

  function flushList() {
    if (listItems.length) {
      const Tag = listOrdered ? "ol" : "ul";
      elements.push(
        <Tag key={`list-${elements.length}`}
          style={{ paddingLeft: 18, margin: "6px 0", display: "flex", flexDirection: "column", gap: 2 }}>
          {listItems}
        </Tag>
      );
      listItems = [];
      inList = false;
    }
  }

  function renderInline(s: string): React.ReactNode {
    // code
    const parts = s.split(/(`[^`]+`)/g);
    return parts.map((p, i) => {
      if (p.startsWith("`") && p.endsWith("`")) {
        return <code key={i} style={{ background: "#f1f5f9", borderRadius: 4, padding: "1px 5px", fontSize: 12, fontFamily: "monospace" }}>{p.slice(1, -1)}</code>;
      }
      // bold
      const boldParts = p.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, j) => {
        if (bp.startsWith("**") && bp.endsWith("**")) {
          return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
        }
        // italic
        const italParts = bp.split(/(\*[^*]+\*)/g);
        return italParts.map((ip, k) => {
          if (ip.startsWith("*") && ip.endsWith("*")) {
            return <em key={`${i}-${j}-${k}`}>{ip.slice(1, -1)}</em>;
          }
          return ip;
        });
      });
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) {
      flushList();
      elements.push(<div key={`br-${i}`} style={{ height: 6 }} />);
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^(\s*)[•\-\*]\s+(.+)/);
    if (bulletMatch) {
      if (!inList || listOrdered) { flushList(); inList = true; listOrdered = false; }
      listItems.push(<li key={i} style={{ fontSize: 13, lineHeight: 1.55 }}>{renderInline(bulletMatch[2])}</li>);
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (numMatch) {
      if (!inList || !listOrdered) { flushList(); inList = true; listOrdered = true; }
      listItems.push(<li key={i} style={{ fontSize: 13, lineHeight: 1.55 }}>{renderInline(numMatch[2])}</li>);
      continue;
    }

    // Heading (##)
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      flushList();
      elements.push(<div key={i} style={{ fontWeight: 800, fontSize: 14, marginTop: 10, marginBottom: 2, color: "#1a1a2e" }}>{renderInline(h2Match[1])}</div>);
      continue;
    }

    // Normal line
    flushList();
    elements.push(
      <div key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 1 }}>
        {renderInline(line)}
      </div>
    );
  }
  flushList();
  return <>{elements}</>;
}

// ─── Message Bubble ───────────────────────────────────────────
function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
      gap: 8,
      marginBottom: 12,
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 900,
        background: isUser ? "#e0f2fe" : "#1e3a5f",
        color: isUser ? "#0369a1" : "#fff",
      }}>
        {isUser ? "T" : "AI"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: "82%",
        background: isUser ? "#dbeafe" : "#1e3a5f",
        color: isUser ? "#1e3a5f" : "#f0f6ff",
        borderRadius: isUser ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
        padding: "10px 13px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}>
        {isUser
          ? <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{msg.content}</div>
          : <div style={{ color: "#f0f6ff" }}>{renderMarkdown(msg.content)}</div>
        }
        <div style={{
          fontSize: 10, marginTop: 6, opacity: 0.55, textAlign: "right",
          fontFamily: "monospace", letterSpacing: "0.5px",
        }}>
          {formatTime(msg.timestamp)}
        </div>
      </div>
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 900, background: "#1e3a5f", color: "#fff",
      }}>AI</div>
      <div style={{
        background: "#1e3a5f", borderRadius: "4px 14px 14px 14px",
        padding: "12px 16px", display: "flex", gap: 4, alignItems: "center",
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%", background: "#93c5fd",
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Quick Starters ───────────────────────────────────────────
const QUICK_STARTS = [
  "Not cooling, high suction pressure, what should I check first?",
  "Walk me through checking a TXV vs fixed orifice system",
  "Compressor not starting, capacitor tests good, what's next?",
  "How do I verify refrigerant charge on this system?",
  "What are the A2L safety precautions I need to follow?",
  "High head pressure, normal suction — top causes?",
];

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════
export function AiChatBot({
  equipmentType, manufacturer, model,
  refrigerantType, symptom, propertyType, observations,
}: AiChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showQuickStarts, setShowQuickStarts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [input]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError("");
    setShowQuickStarts(false);

    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          equipmentType,
          manufacturer,
          model,
          refrigerantType,
          symptom,
          propertyType,
          observations,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || `Server error (${res.status})`);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: data.reply || "No response received.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setError("Network error: " + (err?.message || "Could not reach server."));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
    setShowQuickStarts(true);
  }

  // Build context summary for display
  const contextParts = [
    equipmentType && `${equipmentType}`,
    manufacturer && model && `${manufacturer} ${model}`,
    refrigerantType && refrigerantType !== "Unknown" && refrigerantType,
    symptom && `"${symptom}"`,
  ].filter(Boolean);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: 540,
      background: "#f8fbff",
      border: "1px solid #dde4f0",
      borderRadius: 12,
      overflow: "hidden",
      fontFamily: "inherit",
    }}>

      {/* Header */}
      <div style={{
        background: "#1e3a5f",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>🤖</span> AI Diagnosis Assistant
          </div>
          {contextParts.length > 0 && (
            <div style={{ fontSize: 11, color: "#93c5fd", marginTop: 2 }}>
              Context: {contextParts.join(" · ")}
            </div>
          )}
          {contextParts.length === 0 && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              Fill in equipment info above for smarter answers
            </div>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#cbd5e1", fontWeight: 700,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} style={{
        flex: 1,
        overflowY: "auto",
        padding: "14px 14px 4px",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Empty state */}
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 8px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔧</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#1e3a5f", marginBottom: 4 }}>
              Ask me anything about this system
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
              I think like a 25-year master tech. Describe symptoms, share readings, or ask me to walk you through a test.
            </div>
          </div>
        )}

        {/* Quick starts */}
        {showQuickStarts && messages.length === 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Quick questions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {QUICK_STARTS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{
                  textAlign: "left", padding: "8px 12px", borderRadius: 8,
                  background: "#fff", border: "1px solid #e2e8f0",
                  fontSize: 12, color: "#334155", cursor: "pointer",
                  fontFamily: "inherit", lineHeight: 1.4,
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f9ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}

        {/* Loading */}
        {loading && <TypingIndicator />}

        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: "10px 12px", fontSize: 12,
            color: "#dc2626", marginBottom: 8,
          }}>
            ⚠️ {error}
            {error.includes("ANTHROPIC_API_KEY") && (
              <div style={{ marginTop: 6, color: "#7f1d1d" }}>
                Add <code style={{ background: "#fee2e2", padding: "1px 4px", borderRadius: 3 }}>ANTHROPIC_API_KEY</code> to your Vercel environment variables and redeploy.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Observations count badge */}
      {Array.isArray(observations) && observations.length > 0 && (
        <div style={{
          padding: "4px 14px",
          background: "#eff6ff",
          borderTop: "1px solid #dbeafe",
          fontSize: 11,
          color: "#3b82f6",
          flexShrink: 0,
        }}>
          📊 {observations.length} field reading{observations.length !== 1 ? "s" : ""} auto-included in context
        </div>
      )}

      {/* Input area */}
      <div style={{
        padding: "10px 12px",
        background: "#fff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
        flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe symptoms or ask a question… (Enter to send, Shift+Enter for new line)"
          rows={1}
          disabled={loading}
          style={{
            flex: 1,
            resize: "none" as const,
            border: "1px solid #cbd5e1",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            lineHeight: 1.5,
            outline: "none",
            background: loading ? "#f8fafc" : "#fff",
            overflowY: "hidden" as const,
            minHeight: 38,
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: loading || !input.trim() ? "#e2e8f0" : "#1e3a5f",
            color: loading || !input.trim() ? "#94a3b8" : "#fff",
            fontWeight: 900,
            fontSize: 13,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "background 0.15s",
            height: 38,
          }}
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}