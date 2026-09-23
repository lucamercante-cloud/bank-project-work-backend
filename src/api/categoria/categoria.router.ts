import { Router } from "express";
import { list } from "./categoria.controller";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";

const router = Router();

router.get("/", isAuthenticated, list);

export default router;
