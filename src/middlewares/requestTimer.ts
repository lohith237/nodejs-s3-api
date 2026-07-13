import { Request, Response, NextFunction } from "express";

const requestTimer = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== "GET") return next();

  const start = process.hrtime();
  const originalJson = res.json;

  res.json = function (body: any) {
    const [sec, nano] = process.hrtime(start);
    const ms = sec * 1000 + nano / 1e6;
    return originalJson.call(this, { ...body, responseTime: `${ms.toFixed(2)}ms` });
  };

  next();
};

export { requestTimer };