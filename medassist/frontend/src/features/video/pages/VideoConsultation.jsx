import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import VideoContainer from "../components/VideoContainer";
import ControlsBar from "../components/ControlsBar";
import Loader from "../../../shared/components/Loader";
import api from "../../../shared/utils/api";
import toast from "react-hot-toast";
import { Video, Copy } from "lucide-react";

const BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api").replace("/api", "");
const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }] };

const VideoConsultation = () => {
  const [searchParams] = useSearchParams();
  const [roomInfo, setRoomInfo]           = useState(null);
  const [localStream, setLocalStream]     = useState(null);
  const [remoteStream, setRemoteStream]   = useState(null);
  const [muted, setMuted]                 = useState(false);
  const [videoOff, setVideoOff]           = useState(false);
  const [loading, setLoading]             = useState(true);
  const [peerConnected, setPeerConnected] = useState(false);
  const socketRef = useRef(null);
  const pcRef     = useRef(null);

  const createPeerConnection = useCallback((stream, socket) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.ontrack = e => { setRemoteStream(e.streams[0]); setPeerConnected(true); };
    pc.onicecandidate = e => { if (e.candidate && pc._targetPeerId) socket.emit("ice-candidate", { to: pc._targetPeerId, candidate: e.candidate }); };
    pc.onconnectionstatechange = () => { if (["disconnected", "failed"].includes(pc.connectionState)) { setPeerConnected(false); toast.error("Peer disconnected"); } };
    return pc;
  }, []);

  useEffect(() => {
    let capturedStream;
    const setup = async () => {
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); capturedStream = stream; setLocalStream(stream); }
      catch { toast.error("Camera/microphone access denied"); setLoading(false); return; }
      let room;
      try { const { data } = await api.post("/video/create-room"); room = data; setRoomInfo(data); }
      catch { toast.error("Could not create video room"); setLoading(false); return; }
      const socket = io(BACKEND_URL, { transports: ["websocket"] });
      socketRef.current = socket;
      socket.on("connect", () => socket.emit("join-room", room.roomId));
      socket.on("room-peers", async peers => {
        if (!peers.length) return;
        const peerId = peers[0];
        const pc = createPeerConnection(stream, socket);
        pc._targetPeerId = peerId; pcRef.current = pc;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: peerId, offer });
      });
      socket.on("peer-joined", () => toast("Participant joined", { icon: "👋" }));
      socket.on("offer", async ({ from, offer }) => {
        const pc = createPeerConnection(stream, socket);
        pc._targetPeerId = from; pcRef.current = pc;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, answer });
      });
      socket.on("answer", async ({ answer }) => { await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer)); });
      socket.on("ice-candidate", async ({ candidate }) => { try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch {} });
      socket.on("peer-left", () => { setPeerConnected(false); setRemoteStream(null); toast.error("The other participant left"); });
      setLoading(false);
    };
    setup();
    return () => { capturedStream?.getTracks().forEach(t => t.stop()); pcRef.current?.close(); socketRef.current?.disconnect(); };
  }, [createPeerConnection]);

  const handleToggleMute  = () => { if (!localStream) return; localStream.getAudioTracks().forEach(t => { t.enabled = muted; }); setMuted(m => !m); };
  const handleToggleVideo = () => { if (!localStream) return; localStream.getVideoTracks().forEach(t => { t.enabled = videoOff; }); setVideoOff(v => !v); };
  const handleHangUp = () => { localStream?.getTracks().forEach(t => t.stop()); pcRef.current?.close(); socketRef.current?.disconnect(); window.history.back(); };

  if (loading) return <Loader label="Connecting to video room…" />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Video size={18} color="#059669" />
        </div>
        <div>
          <h1 className="page-title">Video Consultation</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: peerConnected ? "#22c55e" : "#94a3b8", display: "inline-block" }} />
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{peerConnected ? "Connected" : "Waiting for participant…"}</span>
            {roomInfo && (
              <button onClick={() => { navigator.clipboard.writeText(roomInfo.roomId); toast.success("Room ID copied"); }}
                style={{ marginLeft: "6px", display: "flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "6px", background: "var(--surface)", border: "1px solid var(--border)", fontSize: "11px", color: "var(--text-muted)", cursor: "pointer" }}>
                <Copy size={11} /> {roomInfo.roomId}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", height: "calc(100vh - 20rem)" }}>
        <VideoContainer stream={localStream} label="You" muted />
        {remoteStream ? (
          <VideoContainer stream={remoteStream} label="Participant" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", borderRadius: "14px", background: "#0f172a", color: "rgba(255,255,255,0.4)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.15)", borderTopColor: "rgba(255,255,255,0.5)", animation: "spin 1s linear infinite" }} />
            <p style={{ margin: 0, fontSize: "13px" }}>Waiting for participant…</p>
          </div>
        )}
      </div>

      <ControlsBar muted={muted} videoOff={videoOff} onToggleMute={handleToggleMute} onToggleVideo={handleToggleVideo} onHangUp={handleHangUp} />
    </div>
  );
};

export default VideoConsultation;
