import { s3, deleteFromS3, replaceS3Image } from "../../config/s3";
import { getUserModel } from "../modals/getUserModel";
import { resolveDB } from "../utils";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
export const createUser = async (req: Request, res: Response) => {
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
            return res.status(400).json({ message: "User Already Exists" });
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
        res.status(500).json({ message: error.message || "internal server" });
    }
};

export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const db = await resolveDB("master");
        const User = getUserModel(db);

        const existUser = await User.findOne({ email });

        if (!existUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await existUser.compare_password(password as string);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                user_id: existUser._id,
                role: existUser.role,
                tenant_id: existUser.tenant_id,
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "15m",
            }
        );

        res.status(200).json({
            message: "Login success",
            user: existUser,
            token,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message || "internal server" });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);

        const users = await User.find({});

        res.status(200).json({ message: "", users });
    } catch (error) {
        res.status(500).json({ message: "internal Server issue" });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User Not found" });
        }

        res.status(200).json({ message: "", user });
    } catch (error) {
        res.status(500).json({ message: "internal Server issue" });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);

        const { email, name, password } = req.body;

        const existUser = await User.findById(req.params.id);

        if (!existUser) {
            await deleteFromS3(req.file);
            return res.status(404).json({ message: "User Not Found" });
        }

        if (email !== existUser.email) {
            const emailTaken = await User.findOne({ email });

            if (emailTaken) {
                await deleteFromS3(req.file);
                return res.status(400).json({ message: "User Already Exists" });
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
        res.status(500).json({ message: "internal Server issue" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const db = await resolveDB("master");
        const User = getUserModel(db);

        const existUser = await User.findById(req.params.id);

        if (!existUser) {
            return res.status(404).json({ message: "User Not Found" });
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
        res.status(500).json({ message: "internal Server issue" });
    }
};