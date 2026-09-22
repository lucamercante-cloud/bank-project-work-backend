import { NextFunction, Request, Response } from "express";

export class WrongPasswordError extends Error {
  constructor() {
    super();
    this.name = "WrongPassword";
    this.message = "password attuale non corretta";
  }
}

export const wrongPasswordHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof WrongPasswordError) {
    res.status(400);
    res.json({ error: err.name, message: err.message });
  } else {
    next(err);
  }
};
