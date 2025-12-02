import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import comentarioRoutes from "./routes/route_comentario.js";
import adminRoutes from "./routes/route_admin.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Permitir dominios de Vercel y entorno local
    if (
      origin.includes("vercel.app") ||   // cualquier subdominio de Vercel
      origin.includes("localhost") ||    // entorno local
      origin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    }
    return callback(new Error("No permitido por CORS"));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use("/api/comentarios", comentarioRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("API de comentarios funcionando correctamente con CORS dinámico");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
