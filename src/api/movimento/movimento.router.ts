import { Router } from "express";
import { detail, exportCsv, list } from "./movimento.controller";
import { isAuthenticated } from "../../lib/auth/authenticated.middleware";
import { validate } from "../../lib/validation-middleware";
import { QueryMovimentoDto } from "./movimento.dto";
import { IdParams } from "../../lib/id-params";

const router = Router();

router.use(isAuthenticated);

router.get("/", validate(QueryMovimentoDto, "query"), list);
router.get("/export", validate(QueryMovimentoDto, "query"), exportCsv);
router.get("/:id", validate(IdParams, "params"), detail);

export default router;
