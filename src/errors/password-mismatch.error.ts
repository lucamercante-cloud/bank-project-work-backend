import { NextFunction, Request, Response } from 'express';

export class PasswordMismatchError extends Error {
  constructor() {
    super();
    this.name = 'PasswordMismatch';
    this.message = 'password and confermaPassword do not match';
  }
}

export const passwordMismatchHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof PasswordMismatchError) {
    res.status(400);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
