import { s3, deleteFromS3, replaceS3Image } from "../../config/s3";
import { User } from "../modals";
import { Request, Response } from "express";
import jwt from "jsonwebtoken"
import { sendEmail } from "../utils/sendEmail";
export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body
        const existUser = await User.findOne({ email })
        if (existUser) {
            await deleteFromS3(req.file);
            return res.status(400).json({ message: "User Alredy Exists" })
        }
        const user = await User.create({
            name, email, password, image: req.file ? (req.file as any)?.location : null
        })
        res.status(201).json({ message: "user Created", user })
    }
    catch (error) {
        await deleteFromS3(req.file);
        res.status(500).json({ message: "internal server" })
    }
}
export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const existUser = await User.findOne({ email })
        if (!existUser) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        const isMatch = existUser.comparePassword(password as string)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        await sendEmail(
            existUser.email,
            'Login Successful',
            `Hi ${existUser.name}, you have successfully logged in to your account.`
        )
        const token = await jwt.sign({ user_id: existUser?._id, role: existUser.role }, process.env.JWT_SECRET as string, { expiresIn: "15m" })
        res.status(200).json({ message: "Login success", user: existUser, token: token })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "internal server" })
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({})
        res.status(200).json({ message: "", users })
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" })
    }
}
export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User Not found" })
        }
        res.status(200).json({ message: "", user })
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" })
    }
}
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { email, name, password } = req.body
        const existUser = await User.findById(req.params.id)
        if (!existUser) {
            await deleteFromS3(req.file);
            return res.status(404).json({ message: "User Not Found" })
        }
        if (email !== existUser.email) {
            const emailTaken = await User.findOne({ email })
            if (emailTaken) {
                await deleteFromS3(req.file);
                return res.status(400).json({ message: "user Already Exists" })
            }
        }
        await replaceS3Image(existUser?.image)
        const updateUser = await User.findByIdAndUpdate(req.params.id, { $set: { email, name, password, image: req.file ? (req.file as any).location : existUser.image } }, { returnDocument: 'after' })
        res.status(200).json({ message: "user Updated SuccessFully", user: updateUser })
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const existUser = await User.findById(req.params.id)
        if (!existUser) {
            return res.status(404).json({ message: "User Not Found" })
        }
        if (existUser.image) {
            const key = existUser.image.split('.com/')[1];
            await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME!, Key: key }).promise();
        }
        await replaceS3Image(existUser?.image)
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "Deleted successfully" })
    }
    catch (error) {
        res.status(500).json({ message: "internal Server issue" })
    }
}