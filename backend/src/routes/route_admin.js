import express from "express";
import multer from "multer";
import os from "os";

import {
  verifyAdminToken,
  setAdminClaim,
  deleteComentario,
  listUsers,
  deleteUser,
  listContents,
  uploadContent,
  deleteContent,
  listUsersWithPending,
  aceptarUser,
  rechazarUser
} from "../controllers/controller_admin.js";

import { db } from "../firebase.js";

const router = express.Router();

// RUTAS ADMIN
router.post("/verify", verifyAdminToken);
router.post("/set-admin", setAdminClaim);

// SOLICITUDES
router.get("/solicitudes", listUsersWithPending);
router.post("/aceptar-user", aceptarUser);      // ⬅ AGREGADO
router.delete("/rechazar-user/:uid", rechazarUser);

// USUARIOS
router.get("/users", listUsers);
router.delete("/users/:uid", deleteUser);

// COMENTARIOS
router.get("/comentarios", async (req, res) => {
  try {
    const snap = await db.collection("comentarios")
      .orderBy("fecha", "desc")
      .get();

    const lista = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(lista);

  } catch (err) {
    console.error("Error cargando comentarios:", err);
    res.status(500).json({ error: "No se pudieron cargar comentarios" });
  }
});

router.delete("/comments/:id", deleteComentario);

// SUBIDA DE ARCHIVOS
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, os.tmpdir()),
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`)
  }),
  limits: { fileSize: 1024 * 1024 * 1024 }
});

router.get("/contents", listContents);
router.post("/contents", upload.single("file"), uploadContent);
router.delete("/contents/:name", deleteContent);

export default router;
