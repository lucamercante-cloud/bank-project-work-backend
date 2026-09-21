import { NextFunction, Request, Response } from 'express';

export class InsufficientBalanceError extends Error {
  constructor() {
    super();
    this.name = 'InsufficientBalance';
    this.message = "saldo insufficiente per completare l'operazione";
  }
}

export const insufficientBalanceHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InsufficientBalanceError) {
    res.status(400);
    res.json({ error: err.name, message: err.message });
  } else {
    next(err);
  }
}
