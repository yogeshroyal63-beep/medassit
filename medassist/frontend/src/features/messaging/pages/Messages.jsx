import { useEffect, useState } from "react";
import ChatWindow from "../components/ChatWindow";
import { messagingService } from "../messaging.service";
import Loader from "../../../shared/components/Loader";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagingService.conversations()
      .then(data => { setConversations(data); if (data.length > 0) setActive(data[0]._id); })
      .catch(() => toast.error("Failed to load conversations"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MessageSquare size={18} color="#1d4ed8" />
        </div>
        <h1 className="page-title">Messages</h1>
      </div>
      <div style={{ display: "flex", height: "calc(100vh - 12rem)", borderRadius: "14px", border: "1px solid var(--border)", overflow: "hidden", background: "var(--card)", boxShadow: "var(--shadow-sm)" }}>
        {/* Sidebar */}
        <div style={{ width: "260px", flexShrink: 0, borderRight: "1px solid var(--border)", overflowY: "auto", background: "var(--surface-elevated)" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)" }}>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Conversations</p>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--text-subtle)" }}>{conversations.length} active</p>
          </div>
          {conversations.length === 0 ? (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-subtle)", fontSize: "13px" }}>No conversations yet.</div>
          ) : conversations.map(c => (
            <button key={c._id} onClick={() => setActive(c._id)}
              style={{
                width: "100%", textAlign: "left", padding: "0.85rem 1rem",
                background: active === c._id ? "var(--brand-50)" : "transparent",
                borderLeft: active === c._id ? "3px solid var(--brand-500)" : "3px solid transparent",
                border: "none", cursor: "pointer", transition: "all 0.15s",
                borderBottom: "1px solid var(--border)",
              }}>
              <p style={{ margin: 0, fontSize: "13px", fontWeight: active === c._id ? 700 : 500, color: active === c._id ? "var(--brand-700)" : "var(--text)" }}>
                {c.participantName || "Conversation"}
              </p>
              {c.lastMessage && <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.lastMessage}</p>}
            </button>
          ))}
        </div>
        {/* Chat */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <ChatWindow conversationId={active} />
        </div>
      </div>
    </div>
  );
};

export default Messages;
