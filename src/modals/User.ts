import { Schema, model } from "mongoose"
import { userType } from "../types"
import bcrypt from "bcrypt";
const Userschema = new Schema<userType>({
    name: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    image: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    }
}, { timestamps: true })
Userschema.pre("save", async function(){
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
})
Userschema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};
export const User = model<userType>("User", Userschema)