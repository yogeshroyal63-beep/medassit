import { useEffect, useRef } from "react";

const VideoContainer = ({ stream, label, muted = false }) => {
  const videoRef = useRef(null);
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "14px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}>
      <video ref={videoRef} autoPlay playsInline muted={muted} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      {!stream && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>No video</p>
        </div>
      )}
      {label && (
        <span style={{ position: "absolute", bottom: "10px", left: "10px", padding: "3px 10px", borderRadius: "8px", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "11.5px", fontWeight: 600 }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default VideoContainer;
