import { NextFunction, Request, Response } from 'express';

export class EmailExistsError extends Error {
  constructor() {
    super();
    this.name = 'EmailExists';
    this.message = 'email already in use';
  }
}

export const emailExistsHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof EmailExistsError) {
    res.status(400);
    res.json({
      error: err.name,
      message: err.message
    });
  } else {
    next(err);
  }
}
