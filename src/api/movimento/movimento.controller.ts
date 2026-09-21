import { NextFunction, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { QueryMovimentoDto } from "./movimento.dto";
import { IdParams } from "../../lib/id-params";
import movimentoSrv from "./movimento.service";
import { NotFoundError } from "../../errors/not-found.error";

export const list = async (
  req: TypedRequest<unknown, QueryMovimentoDto>,
  res: Response,
  next: NextFunction) => {
  try {
    const { movimenti, saldoFinale } = await movimentoSrv.find(req.user!.id, req.query);
    res.json({ movimenti, saldoFinale });
  } catch (err) {
    next(err);
  }
};

export const detail = async (
  req: TypedRequest<unknown, unknown, IdParams>,
  res: Response,
  next: NextFunction) => {
  try {
    const movimento = await movimentoSrv.getById(req.user!.id, req.params.id);
    if (!movimento) {
      throw new NotFoundError();
    }
    res.json(movimento);
  } catch (err) {
    next(err);
  }
};
