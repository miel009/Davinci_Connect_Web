import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import comentarioRoutes from "./routes/route_comentario.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/comentarios", comentarioRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
