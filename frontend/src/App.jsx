import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("http://10.53.207.1:5000")
      .then(res => res.text())
      .then(data => setMsg(data))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>VeloShare</h1>
      <p>{msg}</p>
    </div>
  );
}

export default App;
