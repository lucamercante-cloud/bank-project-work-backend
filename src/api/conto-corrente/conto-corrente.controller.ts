import { NextFunction, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { UpdatePasswordDto } from "./conto-corrente.dto";
import { PasswordMismatchError } from "../../errors/password-mismatch.error";
import contoCorrenteSrv from "./conto-corrente.service";
import operationLogSrv from "../operation-log/operation-log.service";

export const me = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction,
) => {
  res.json(req.user);
};

export const updatePassword = async (
  req: TypedRequest<UpdatePasswordDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.body.nuovaPassword !== req.body.confermaNuovaPassword) {
      throw new PasswordMismatchError();
    }

    await contoCorrenteSrv.updatePassword(
      req.user!.id,
      req.body.vecchiaPassword,
      req.body.nuovaPassword,
    );

    await operationLogSrv.log(
      "modifica-password",
      req.ip ?? "unknown",
      true,
      req.user!.id,
    );
    res.status(204).send();
  } catch (err) {
    await operationLogSrv.log(
      "modifica-password",
      req.ip ?? "unknown",
      false,
      req.user?.id,
    );
    next(err);
  }
};
