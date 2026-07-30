import { s3, deleteFromS3, replaceS3Image } from "../../config/s3";
import { getUserModel } from "../modals/getUserModel";
import { resolveDB, paginateAndSearch } from "../utils";
import { PaginateOptions } from "../types";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role, company_name, subdomain, tenant_id } = req.body;
        let final_tenant_id: string;
        if (role === "admin") {
            final_tenant_id = "master";
        } else if (role === "client") {
            final_tenant_id = `tenant_${Date.now()}`;
            await resolveDB(final_tenant_id);
        } else {
            final_tenant_id = tenant_id;
        }
        const db = await resolveDB("master");
        const User = getUserModel(db);
        const existUser = await User.findOne({ email });
        if (existUser) {
            await deleteFromS3(req.file);
            return next({ statusCode: 400, message: "User Already Exists" });
        }
        const user = await User.create({
            name,
            email,
            password,
            role,
            tenant_id: final_tenant_id,
            company_name,
            subdomain,
            image: req.file ? (req.file as any)?.location : null,
        });
        res.status(201).json({ message: "user Created", user });
    } catch (error: any) {
        await deleteFromS3(req.file);
        next({ statusCode: 500, message: error.message || "internal server" });
    }
};
export const Login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;
    const login_user = req.login_user;
    const login_role = req.login_role;
    if (!login_user.is_active) {
      return next({ statusCode: 403, message: "Account is inactive" });
    }
    const isMatch = await login_user.compare_password(password);
    if (!isMatch) {
      return next({ statusCode: 400, message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        user_id: login_user._id,
        role: login_role,
        tenant_id: req.tenant._id,
        subdomain: req.tenant.subdomain,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    res.status(200).json({ message: "Login success", user: login_user, token });
  } catch (error: any) {
    console.log(error)
    next({ statusCode: 500, message: error.message || "internal server" });
  }
};
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);
        const {
            page = "1",
            page_size = "20",
            search = "",
            role,
            is_active,
        } = req.query;
        const filter: Record<string, any> = {};
        if (role) filter.role = role;
        if (is_active !== undefined) filter.is_active = is_active === "true";
        const options: PaginateOptions = {
            page: Number(page),
            pageSize: Number(page_size),
            search: search as string,
            searchFields: ["name", "email", "company_name"],
            filter,
            sort: { _id: -1 },
            baseUrl: `${process.env.NODE_ENV === "production" ? "https" : req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`,
            originalQuery: req.query,
        };
        const result = await paginateAndSearch(User, options);
        res.status(200).json({
            count: result.total,
            next: result.next,
            prev: result.previous,
            results: result.results,
        });
    } catch (error: any) {
        next({ statusCode: 500, message: error.message || "internal Server issue" });
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);

        const user = await User.findById(req.params.id);

        if (!user) {
            return next({ statusCode: 404, message: "User Not found" });
        }

        res.status(200).json({ message: "", user });
    } catch (error) {
        next({ statusCode: 500, message: "internal Server issue" });
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);

        const { email, name, password } = req.body;

        const existUser = await User.findById(req.params.id);

        if (!existUser) {
            await deleteFromS3(req.file);
            return next({ statusCode: 404, message: "User Not Found" });
        }

        if (email !== existUser.email) {
            const emailTaken = await User.findOne({ email });

            if (emailTaken) {
                await deleteFromS3(req.file);
                return next({ statusCode: 400, message: "User Already Exists" });
            }
        }

        await replaceS3Image(existUser.image);

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    email,
                    name,
                    password,
                    image: req.file ? (req.file as any).location : existUser.image,
                },
            },
            {
                returnDocument: "after",
            }
        );

        res.status(200).json({
            message: "User Updated Successfully",
            user: updatedUser,
        });
    } catch (error) {
        next({ statusCode: 500, message: "internal Server issue" });
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);

        const existUser = await User.findById(req.params.id);

        if (!existUser) {
            return next({ statusCode: 404, message: "User Not Found" });
        }

        if (existUser.image) {
            const key = existUser.image.split(".com/")[1];

            await s3
                .deleteObject({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: key,
                })
                .promise();
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        next({ statusCode: 500, message: "internal Server issue" });
    }
};

export const RefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        if (!user) {
            return next({ statusCode: 401, message: user });
        }
        const newToken = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role,
                tenant_id: user.tenant_id,
                subdomain: user.subdomain,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "15m" }
        );
        res.status(200).json({
            message: "Token refreshed",
            token: newToken,
        });
    } catch (error: any) {
        next({ statusCode: 500, message: error.message || "internal server" });
    }
};