import { NextFunction, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { CreateRicaricaDto } from "./ricarica.dto";
import ricaricaSrv from "./ricarica.service";
import operationLogSrv from "../operation-log/operation-log.service";

export const create = async (
  req: TypedRequest<CreateRicaricaDto>,
  res: Response,
  next: NextFunction) => {
  try {
    const movimento = await ricaricaSrv.esegui(
      req.user!.id,
      req.body.numeroTelefono,
      req.body.operatore,
      req.body.taglio
    );
    await operationLogSrv.log('ricarica', req.ip ?? 'unknown', true, req.user!.id);
    res.status(201);
    res.json(movimento);
  } catch (err) {
    await operationLogSrv.log('ricarica', req.ip ?? 'unknown', false, req.user?.id);
    next(err);
  }
};
