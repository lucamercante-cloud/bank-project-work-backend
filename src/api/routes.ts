import { Router } from "express";
import authRouter from "./auth/auth.router";
import contoCorrenteRouter from "./conto-corrente/conto-corrente.router";
import categoriaRouter from "./categoria/categoria.router";
import movimentoRouter from "./movimento/movimento.router";
import bonificoRouter from "./bonifico/bonifico.router";
import ricaricaRouter from "./ricarica/ricarica.router";

const router = Router();

router.use('/conto-corrente', contoCorrenteRouter);
router.use('/categorie', categoriaRouter);
router.use('/movimenti', movimentoRouter);
router.use('/bonifici', bonificoRouter);
router.use('/ricariche', ricaricaRouter);
router.use(authRouter);

export default router;
