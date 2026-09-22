import { Router } from "express";
import { me, updatePassword } from "./conto-corrente.controller";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { UpdatePasswordDto } from "./conto-corrente.dto";

const router = Router();

router.get("/me", isAuthenticated, me);
router.patch(
  "/password",
  isAuthenticated,
  validate(UpdatePasswordDto, "body"),
  updatePassword,
);

export default router;
