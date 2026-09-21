import { validationHandler } from './validation-error';
import { genericErrorHandler } from "./generic";
import { notFoundHandler } from "./not-found.error";
import { emailExistsHandler } from "./email-exists.error";
import { passwordMismatchHandler } from "./password-mismatch.error";
import { ibanNotFoundHandler } from "./iban-not-found.error";
import { insufficientBalanceHandler } from "./insufficient-balance.error";

export const errorHandlers = [
  validationHandler,
  notFoundHandler,
  emailExistsHandler,
  passwordMismatchHandler,
  ibanNotFoundHandler,
  insufficientBalanceHandler,
  genericErrorHandler
];
