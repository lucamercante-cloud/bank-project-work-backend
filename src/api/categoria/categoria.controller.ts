import { NextFunction, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import categoriaSrv from "./categoria.service";

export const list = async (req: TypedRequest, res: Response, next: NextFunction) => {
  try {
    const categorie = await categoriaSrv.find();
    res.json(categorie);
  } catch (err) {
    next(err);
  }
};
