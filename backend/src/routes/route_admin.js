import express from "express";
import multer from "multer";
import os from "os";
import path from "path";
import { verifyAdminToken, setAdminClaim, deleteComentario, listUsers, deleteUser, listContents, uploadContent, deleteContent } from "../controllers/controller_admin.js";

const router = express.Router();

// POST /api/admin/verify
router.post("/verify", verifyAdminToken);

// POST /api/admin/set-admin  (body: { email } or { uid })
router.post("/set-admin", setAdminClaim);


// DELETE /api/admin/comments/:id
router.delete('/comments/:id', deleteComentario);

// GET /api/admin/users  -> listar usuarios (requiere token admin en Authorization Bearer)
router.get('/users', listUsers);

// DELETE /api/admin/users/:uid  -> eliminar usuario
router.delete('/users/:uid', deleteUser);

// Contenidos (Storage)
// Use disk storage for uploads (streaming to disk) to support large files.
const upload = multer({ 
	storage: multer.diskStorage({
		destination: (req, file, cb) => cb(null, os.tmpdir()),
		filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_')}`)
	}),
	limits: { fileSize: 1024 * 1024 * 1024 } // 1GB max (adjust if needed)
});
router.get('/contents', listContents);
router.post('/contents', upload.single('file'), uploadContent);
// name debe venir URL encoded si contiene slashes
router.delete('/contents/:name', deleteContent);

export default router;
