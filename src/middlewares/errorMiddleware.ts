import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
}

function errorMiddleware(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;

  const response: { message: string; stack?: string } = {
    message: err.message || "Server Error",
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

export  {errorMiddleware};