import { NextFunction, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { CreateBonificoDto } from "./bonifico.dto";
import bonificoSrv from "./bonifico.service";
import operationLogSrv from "../operation-log/operation-log.service";

export const create = async (
  req: TypedRequest<CreateBonificoDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const movimento = await bonificoSrv.esegui(req.user!, req.body);
    await operationLogSrv.log(
      "bonifico",
      req.ip ?? "unknown",
      true,
      req.user!.id,
    );
    res.status(201);
    res.json(movimento);
  } catch (err) {
    await operationLogSrv.log(
      "bonifico",
      req.ip ?? "unknown",
      false,
      req.user?.id,
    );
    next(err);
  }
};
