import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getLocalMessages, addLocalMessage } from "../utils/localStore";
import { formatTimestampToTime } from "../utils/time";

export default function ChatBox({ groupId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!groupId) return;
    const load = () => setMessages(getLocalMessages(groupId));
    load();
    const onStorage = (e) => { if (!e.key || e.key === 'splitclone:messages') load(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [groupId]);

  async function send() {
    if (!text.trim()) return;
    addLocalMessage(groupId, { text, userId: user.uid });
    setText("");
  }

  return (
    <div className="flex-col" style={{ height: "400px" }}>
      {/* Messages Area */}
      <div style={{ 
        flex: 1,
        overflow: "auto", 
        padding: "var(--spacing-md)",
        background: "var(--bg-tertiary)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-color)",
        marginBottom: "var(--spacing-md)"
      }}>
        {messages.length === 0 ? (
          <div className="text-center" style={{ padding: "var(--spacing-2xl) 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "var(--spacing-md)" }}>💬</div>
            <p className="text-secondary">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="flex-col gap-md">
            {messages.map(m => {
              const isOwn = m.userId === user.uid;
              return (
                <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div style={{
                    maxWidth: "70%",
                    padding: "var(--spacing-md)",
                    borderRadius: isOwn ? "var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)",
                    background: isOwn ? "var(--primary-gradient)" : "var(--bg-primary)",
                    color: isOwn ? "white" : "var(--text-primary)",
                    boxShadow: "var(--shadow-sm)",
                    border: isOwn ? "none" : "1px solid var(--border-color)"
                  }}>
                    {!isOwn && (
                      <div style={{ 
                        fontSize: "11px", 
                        color: "var(--text-muted)",
                        marginBottom: "var(--spacing-xs)",
                        fontWeight: "600"
                      }}>
                        {m.userId}
                      </div>
                    )}
                    <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                      {m.text}
                    </div>
                    {m.createdAt && (
                      <div style={{ 
                        fontSize: "10px", 
                        opacity: 0.7,
                        marginTop: "var(--spacing-xs)",
                        textAlign: "right"
                      }}>
                        {formatTimestampToTime(m.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-sm">
        <input 
          value={text} 
          onChange={e => setText(e.target.value)} 
          placeholder="Type a message..." 
          onKeyPress={(e) => e.key === 'Enter' && send()}
          style={{ flex: 1 }}
        />
        <button 
          onClick={send}
          className="btn-primary"
          disabled={!text.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
