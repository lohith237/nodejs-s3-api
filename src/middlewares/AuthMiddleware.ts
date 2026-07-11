import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: { user_id: string; role: string; tenant_id: string };
    }
  }
}

const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: "No token Provided" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user_id: string, role: string, tenant_id: string }
        req.user = decoded
        next()
    }
    catch (error) {
        res.status(401).json({ message: "Invalid token" })
    }
}

export { AuthMiddleware }