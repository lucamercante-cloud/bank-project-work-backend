import { Router } from "express";
import { create } from "./bonifico.controller";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { CreateBonificoDto } from "./bonifico.dto";

const router = Router();

router.post('/', isAuthenticated, validate(CreateBonificoDto, 'body'), create);

export default router;
