import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import testRoutes from "./routes/route_test.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ruta -test
app.use("/api/test", testRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
