import { Schema, Connection } from "mongoose";
import bcrypt from "bcrypt";
import { ManagerType } from "../../types";

const ManagerSchema = new Schema<ManagerType>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "manager", immutable: true },
    client_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    branch_id: { type: Schema.Types.ObjectId, ref: "Branch" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ManagerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

ManagerSchema.methods.compare_password = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const getManagerModel = (conn: Connection) => {
  return conn.models.Manager || conn.model("Manager", ManagerSchema);
};

export { ManagerSchema, getManagerModel };