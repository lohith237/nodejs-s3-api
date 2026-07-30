import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { resolveDB } from "../utils/resolveDB";
import { getUserModel } from "../modals/getUserModel";
import { getManagerModel } from "../modals/tenantDb/Manager";
import { getEmployeeModel } from "../modals/tenantDb/Employee";
import { JwtUserPayload } from "../types";

declare global {
  namespace Express {
    interface Request {
      tenant?: any;
      login_user?: any;
      login_role?: string;
      user?: JwtUserPayload;
    }
  }
}

const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw_subdomain = req.headers.subdomain as string;
    const subdomain = raw_subdomain.split(",")[0].trim();
    if (!subdomain) return next({ statusCode: 400, message: "Subdomain header missing" });
    const master_db = await resolveDB("master");
    const User = getUserModel(master_db);
    const tenant = await User.findOne({ subdomain });
    if (!tenant) return next({ statusCode: 404, message: "Invalid tenant" });
    req.tenant = tenant;
    next();
  } catch (error) {
    next({ statusCode: 500, message: "Tenant resolution failed" });
  }
};

const findLoginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const tenant = req.tenant;
    if (tenant.email === email) {
      req.login_user = tenant;
      req.login_role = tenant.role;
      console.log("MATCHED CLIENT:", tenant.email);
      return next();
    }
    const tenant_db = await resolveDB(tenant._id.toString());
    const Manager = getManagerModel(tenant_db);
    const manager = await Manager.findOne({ email });
    if (manager) {
      req.login_user = manager;
      req.login_role = manager.role;
      return next();
    }
    const Employee = getEmployeeModel(tenant_db);
    const employee = await Employee.findOne({ email });
    if (employee) {
      req.login_user = employee;
      req.login_role = employee.role;
      return next();
    }
    return next({ statusCode: 401, message: "Invalid credentials" });
  } catch (error) {
    next({ statusCode: 500, message: "Login lookup failed" });
  }
};

const AuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const subdomain = req.headers.subdomain as string;
    if (!token) return next({ statusCode: 401, message: "No token provided" });
    if (!subdomain) return next({ statusCode: 400, message: "Subdomain header missing" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;
    if (subdomain !== decoded.subdomain) {
      return next({ statusCode: 403, message: "Unauthorized client domain" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    next({ statusCode: 401, message: "Invalid token" });
  }
};

export { resolveTenant, findLoginUser, AuthMiddleware };