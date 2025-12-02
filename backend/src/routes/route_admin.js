import express from "express";
import { verifyAdminToken } from "../controllers/controller_admin.js";
import { setAdminClaim, deleteComentario } from "../controllers/controller_admin.js";

const router = express.Router();

// POST /api/admin/verify
router.post("/verify", verifyAdminToken);

// POST /api/admin/set-admin  (body: { email } or { uid })
router.post('/set-admin', setAdminClaim);

// DELETE /api/admin/comments/:id
router.delete('/comments/:id', deleteComentario);

export default router;
