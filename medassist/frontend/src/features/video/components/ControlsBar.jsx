import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const ControlsBar = ({ muted, videoOff, onToggleMute, onToggleVideo, onHangUp }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "0.85rem 1.5rem", borderRadius: "14px", background: "#0f172a", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
    <button onClick={onToggleMute} title={muted ? "Unmute" : "Mute"}
      style={{ width: "44px", height: "44px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: muted ? "#dc2626" : "rgba(255,255,255,0.12)", color: "#fff", transition: "all 0.15s" }}>
      {muted ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
    <button onClick={onToggleVideo} title={videoOff ? "Turn on camera" : "Turn off camera"}
      style={{ width: "44px", height: "44px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: videoOff ? "#dc2626" : "rgba(255,255,255,0.12)", color: "#fff", transition: "all 0.15s" }}>
      {videoOff ? <VideoOff size={18} /> : <Video size={18} />}
    </button>
    <button onClick={onHangUp} title="End call"
      style={{ padding: "0 1.5rem", height: "44px", borderRadius: "22px", border: "none", cursor: "pointer", background: "#dc2626", color: "#fff", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s" }}>
      <PhoneOff size={16} /> End Call
    </button>
  </div>
);

export default ControlsBar;
