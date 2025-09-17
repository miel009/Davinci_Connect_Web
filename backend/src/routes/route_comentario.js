import express from "express";
import { crearComentario, obtenerComentarios } from "../controllers/controller_comentario.js";

const router = express.Router();

router.post("/", crearComentario);
router.get("/", obtenerComentarios);


export default router;