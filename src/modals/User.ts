// models/User.ts
import { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { userType } from "../types";
export const User = new Schema<userType>({
    name: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String,
        unique: true
    },
    image: {
        type: String
    },
    password: {
        required: true,
        type: String
    },
    role: {
        required: true,
        type: String,
        enum: ["admin", "client", "manager", "employee"],
        default: "employee"
    },
    tenant_id: {
        required: true,
        type: String
    },
    company_name: {
        type: String
    },
    subdomain: {
        type: String,
        lowercase: true,
        trim: true
    },
    database: {
        type: String
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

User.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

User.methods.compare_password = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};