import { Types } from "mongoose";
export type EmployeeType = {
  name: string;
  email: string;
  password: string;
  role: "employee";
  manager_id: Types.ObjectId;
  branch_id?:Types.ObjectId;
  is_active: boolean;
};