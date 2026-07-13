import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const refreshAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next({ statusCode: 401, message: "Token required" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!, {
      ignoreExpiration: true,
    }) as any;
    next();
  } catch (err:any) {
    return res.status(401).json({ message: JSON.stringify(err) || "Invalid token",token });
  }
};

export { refreshAuthMiddleware };