import { validationResult } from "express-validator";

export const handleValidation = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 400;
    return next(error);
  }

  next();
};
