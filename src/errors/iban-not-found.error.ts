import { NextFunction, Request, Response } from 'express';

export class IbanNotFoundError extends Error {
  constructor() {
    super();
    this.name = 'IbanNotFound';
    this.message = 'IBAN destinatario non trovato';
  }
}

export const ibanNotFoundHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof IbanNotFoundError) {
    res.status(400);
    res.json({ error: err.name, message: err.message });
  } else {
    next(err);
  }
}
