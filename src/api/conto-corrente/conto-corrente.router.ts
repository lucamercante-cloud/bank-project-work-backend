import { Router } from "express";
import { me } from "./conto-corrente.controller";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";

const router = Router();

router.get('/me', isAuthenticated, me);

export default router;
