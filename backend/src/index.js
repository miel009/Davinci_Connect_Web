import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import comentarioRoutes from "./routes/route_comentario.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    "https://davinci-connect-web.vercel.app", // dominio 
    "https://davinci-connect-jgbd3ffj0-melanys-projects-35f6ab41.vercel.app", //build actual
    "http://localhost:5173" // para pruebas locales
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use("/api/comentarios", comentarioRoutes);
app.get("/", (req, res) => {
  res.send("API de comentarios funcionando correctamente ");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));