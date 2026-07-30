import { Types } from "mongoose";

export type ManagerType = {
  name: string;
  email: string;
  password: string;
  role: "manager";
  client_id: Types.ObjectId;
  branch_id?: Types.ObjectId;
  is_active: boolean;
  compare_password: (password: string) => Promise<boolean>;
};