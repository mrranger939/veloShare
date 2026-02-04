import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [socket, setSocket] = useState(null);
  const [deviceName, setDeviceName] = useState("");
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const s = io(BACKEND_URL);
    setSocket(s);

    s.on("device-list", (list) => {
      setDevices(list);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const registerDevice = () => {
    if (!deviceName) return;
    socket.emit("register-device", deviceName);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>VeloShare – Device Discovery</h2>

      <input
        placeholder="Enter device name"
        value={deviceName}
        onChange={(e) => setDeviceName(e.target.value)}
      />
      <button onClick={registerDevice}>Register</button>

      <h3>Available Devices:</h3>
      <ul>
        {devices.map((d, i) => (
          <li key={i}>{d}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
