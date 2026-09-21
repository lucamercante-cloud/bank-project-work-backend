import { NextFunction, Request, Response } from "express";
import { TypedRequest } from "../../lib/typed-request.interface";
import { RegisterDto } from "./auth.dto";
import { omit } from "lodash";
import { PasswordMismatchError } from "../../errors/password-mismatch.error";
import passport from "passport";
import * as jwt from "jsonwebtoken";
import contoCorrenteSrv from "../conto-corrente/conto-corrente.service";

export const register = async (
  req: TypedRequest<RegisterDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.body.password !== req.body.confermaPassword) {
      throw new PasswordMismatchError();
    }

    // tolgo password/confermaPassword: al service serve solo il profilo
    // + la password in chiaro (che lui stesso hasherà)
    const data = omit(req.body, 'password', 'confermaPassword');

    const newAccount = await contoCorrenteSrv.register(data, req.body.password);
    res.status(201);
    res.json(newAccount);
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    passport.authenticate(
      "local",
      { session: false },
      (loginErr, account, info) => {
        if (loginErr) {
          next(loginErr);
          return;
        }

        if (!account) {
          res.status(401);
          res.json({
            error: "LoginError",
            message: info.message,
          });
          return;
        }

        const token = jwt.sign(account, "my_jwt_secret", { expiresIn: "7 days" });
        res.json({
          user: account,
          token,
        });
      },
    )(req, res, next);
  } catch (err) {
    next(err);
  }
};
