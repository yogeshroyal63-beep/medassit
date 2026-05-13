import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { messagingService } from "../messaging.service";
import { useAuth } from "../../../shared/hooks/useAuth";
import Loader from "../../../shared/components/Loader";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

const ChatWindow = ({ conversationId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState("");
  const bottomRef               = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    messagingService.messages(conversationId).then(setMessages).catch(() => toast.error("Failed to load messages")).finally(() => setLoading(false));
  }, [conversationId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim(); if (!trimmed) return;
    setText("");
    try { const msg = await messagingService.send(conversationId, trimmed); setMessages(prev => [...prev, msg]); }
    catch { toast.error("Failed to send message"); }
  };

  if (!conversationId) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-subtle)", gap: "0.5rem" }}>
      <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Send size={20} color="var(--text-subtle)" />
      </div>
      <p style={{ margin: 0, fontSize: "13px" }}>Select a conversation to start messaging</p>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "4px" }}>
        {messages.map(m => <MessageBubble key={m._id} message={m} isMine={m.senderId === user?.id} />)}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: "flex", gap: "0.5rem", padding: "0.85rem 1rem", borderTop: "1px solid var(--border)", background: "var(--surface-elevated)" }}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message…" className="input-ui" maxLength={2000} style={{ flex: 1 }} />
        <button type="submit" disabled={!text.trim()} className="btn-primary" style={{ padding: "0 1rem", flexShrink: 0 }}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
