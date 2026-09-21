import { plainToClass } from "class-transformer";
import { NextFunction, Response } from "express";
import { validate as classValidate } from "class-validator";
import { TypedRequest } from "./typed-request.interface";
import { ValidationError } from "../errors/validation-error";

function validateFn<T extends object>(dtoClass: new() => T, origin: 'body')
  : (req: TypedRequest<T, unknown, any>, res: Response, next: NextFunction) => Promise<void>;
function validateFn<T extends object>(dtoClass: new() => T, origin: 'query')
  : (req: TypedRequest<unknown, T, any>, res: Response, next: NextFunction) => Promise<void>;
function validateFn<T extends object>(dtoClass: new() => T, origin: 'params')
  : (req: TypedRequest<unknown, unknown, any>, res: Response, next: NextFunction) => Promise<void>;
function validateFn<T extends object>(dtoClass: new() => T, origin: 'body' | 'query' | 'params') {
  return async function(req: TypedRequest<any, any, any>, res: Response, next: NextFunction) {
    if (!req[origin]) {
      throw new Error(`Missing ${origin}`);
    }
    const data = plainToClass(dtoClass, req[origin]);
    const errors = await classValidate(data);
    if (errors.length === 0) {
      // fix per express 5: rende req.query scrivibile
      if (origin === 'query') {
        Object.defineProperty(
          req,
          'query',
          { ...Object.getOwnPropertyDescriptor(req, 'query'),
            value: req.query,
            writable: true
          });
      }
      req[origin] = data;
      next();
    } else {
      next(new ValidationError(errors));
    }
  }
}

export const validate = validateFn;
