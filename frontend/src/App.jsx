import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const socketRef = useRef(null);
  const pcRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [status, setStatus] = useState("Not connected");

  useEffect(() => {
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    socket.on("room-created", (id) => {
      setJoinedRoom(id);
      setStatus("Room created. Waiting for peer...");
    });

    socket.on("room-joined", (id) => {
      setJoinedRoom(id);
      setStatus("Joined room. Connecting...");
      createPeerConnection();
      makeOffer(id);
    });

    socket.on("peer-joined", () => {
      setStatus("Peer joined. Connecting...");
      createPeerConnection();
    });

    socket.on("offer", async (offer) => {
      await pcRef.current.setRemoteDescription(offer);
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket.emit("answer", { roomId: joinedRoom, answer });
    });

    socket.on("answer", async (answer) => {
      await pcRef.current.setRemoteDescription(answer);
      setStatus("Connected");
    });

    socket.on("ice-candidate", async (candidate) => {
      await pcRef.current.addIceCandidate(candidate);
    });

    socket.on("peer-disconnected", () => {
      setStatus("Peer disconnected");
    });

    return () => socket.disconnect();
  }, []);

  const createPeerConnection = () => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId: joinedRoom,
          candidate: event.candidate,
        });
      }
    };

    pcRef.current = pc;
  };

  const makeOffer = async (roomId) => {
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socketRef.current.emit("offer", { roomId, offer });
  };

  const createRoom = () => {
    socketRef.current.emit("create-room");
  };

  const joinRoom = () => {
    socketRef.current.emit("join-room", roomId);
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>veloShare – Phase 1</h2>

      <button onClick={createRoom}>Create Room</button>

      <br /><br />

      <input
        placeholder="Enter room code"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>

      <h3>Status: {status}</h3>
      {joinedRoom && <p>Room: {joinedRoom}</p>}
    </div>
  );
}

export default App;
