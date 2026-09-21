import { NextFunction, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";

export const me = async (req: TypedRequest, res: Response, next: NextFunction) => {
  res.json(req.user);
};
