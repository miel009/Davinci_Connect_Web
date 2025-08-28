import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:4000/api/test")
      .then(res => setMessage(res.data.message))
//.catch(err => setMessage("Error al conectar con backend"));
  .catch(() => setMessage("Error al conectar con backend"));
}, []);

  return (
    <div style={{ 
  textAlign: "center", 
  marginTop: "50px", 
  marginLeft: "200px",
  color: "violet", 
  fontFamily: "'Comic Sans MS', cursive, sans-serif", 
  fontSize: "24px" 
}}>
      <h1>Frontend conectado con exito al backend</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
