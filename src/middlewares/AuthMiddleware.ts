import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {JwtUserPayload} from "../types"
declare global {
  namespace Express {
    interface Request {
      user?:JwtUserPayload;
    }
  }
}

const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const subdomain = req.headers.subdomain as string;
    if (!token) return next({ statusCode: 401, message: 'No token provided' });
    if (!subdomain) return next({ statusCode: 400, message: 'Subdomain header missing' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload
    if (subdomain !== decoded.subdomain) {
      return next({ statusCode: 403, message: 'Unauthorized client domain' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    next({ statusCode: 401, message: 'Invalid token' });
  }
};

export { AuthMiddleware }