import { Router } from "express";
import { getMessage } from "../controllers/controller_test.js";

const router = Router();

router.get("/", getMessage);

export default router;
