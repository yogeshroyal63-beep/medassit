import { formatDateTime } from "../../../shared/utils/helpers";

const MessageBubble = ({ message, isMine }) => (
  <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", marginBottom: "6px" }}>
    <div style={{
      maxWidth: "72%", padding: "0.6rem 0.9rem", borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
      background: isMine ? "var(--brand-700)" : "var(--card)",
      color: isMine ? "#fff" : "var(--text)",
      border: isMine ? "none" : "1px solid var(--border)",
      boxShadow: "var(--shadow-sm)",
      fontSize: "13.5px", lineHeight: 1.5,
    }}>
      <p style={{ margin: 0 }}>{message.text}</p>
      <p style={{ margin: "4px 0 0", fontSize: "10.5px", color: isMine ? "rgba(255,255,255,0.6)" : "var(--text-subtle)" }}>
        {formatDateTime(message.createdAt)}
      </p>
    </div>
  </div>
);

export default MessageBubble;
