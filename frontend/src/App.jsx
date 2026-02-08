import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [joinedRoom, setJoinedRoom] = useState("");
  const [status, setStatus] = useState("Idle");
const fileRef = useRef(null);
const receivedBuffersRef = useRef([]);
const incomingFileRef = useRef(null);


const handleFileSelect = (e) => {
  fileRef.current = e.target.files[0];
};

const CHUNK_SIZE = 64 * 1024; // 64KB

const sendFile = async () => {
  const file = fileRef.current;
  const channel = dataChannelRef.current;

  if (!file || !channel) return;

  // send metadata
  channel.send(JSON.stringify({
    type: "file-info",
    name: file.name,
    size: file.size
  }));

  let offset = 0;

  while (offset < file.size) {
    const slice = file.slice(offset, offset + CHUNK_SIZE);
    const buffer = await slice.arrayBuffer();

    channel.send(buffer);
    offset += CHUNK_SIZE;
  }

  channel.send(JSON.stringify({ type: "file-end" }));

  console.log("File sent");
};




const handleIncomingData = (event) => {
  if (typeof event.data === "string") {
    const msg = JSON.parse(event.data);

    if (msg.type === "file-info") {
      receivedBuffersRef.current = [];
      incomingFileRef.current = msg;
    }

    if (msg.type === "file-end") {
      const blob = new Blob(receivedBuffersRef.current);
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = incomingFileRef.current.name;
      a.click();
    }

    return;
  }

  receivedBuffersRef.current.push(event.data);
};





  useEffect(() => {
    const socket = io(BACKEND_URL);
    socketRef.current = socket;

    /* ---------- ROOM EVENTS ---------- */

    socket.on("room-created", (id) => {
      setJoinedRoom(id);
      setStatus("Room created. Waiting for peer...");
    });

    socket.on("room-joined", async (id) => {
      setJoinedRoom(id);
      setStatus("Joining...");

      // Joiner creates peer connection
      createPeerConnection(true, id);

      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      socket.emit("offer", { roomId: id, offer });
    });

    socket.on("peer-joined", () => {
      setStatus("Peer joined...");
    });

    /* ---------- SIGNALING ---------- */

    socket.on("offer", async ({roomId, offer}) => {
      console.log("Offer received");

      // Creator creates peer connection here
      createPeerConnection(false, roomId);
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);

      socket.emit("answer", {
        roomId,
        answer,
      });
    });

    socket.on("answer", async ({answer}) => {
      console.log("Answer received");

      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({candidate}) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    });

    return () => socket.disconnect();
  }, []);

  /* ---------- WEBRTC ---------- */

  const createPeerConnection = (isOfferer, roomId) => {
    if (pcRef.current) return;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ]
    });



    // OFFERER creates data channel
if (isOfferer) {
  const channel = pc.createDataChannel("data");

  channel.onopen = () => {
    console.log("Data channel open");
    setStatus("Connected");
  };

  channel.onmessage = handleIncomingData;

  dataChannelRef.current = channel;
}


    // RECEIVER gets data channel
pc.ondatachannel = (event) => {
  const channel = event.channel;

  channel.onopen = () => {
    console.log("Data channel open");
    setStatus("Connected");
  };

  channel.onmessage = handleIncomingData;

  dataChannelRef.current = channel;
};

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection:", pc.connectionState);
    };

    pcRef.current = pc;
  };

  /* ---------- UI ---------- */

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
      <input type="file" onChange={handleFileSelect} />
      <button onClick={sendFile}>Send File</button>

    </div>
  );
}

export default App;
