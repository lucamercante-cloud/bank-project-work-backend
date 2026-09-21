import { Router } from "express";
import { create } from "./ricarica.controller";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { CreateRicaricaDto } from "./ricarica.dto";

const router = Router();

router.post('/', isAuthenticated, validate(CreateRicaricaDto, 'body'), create);

export default router;
