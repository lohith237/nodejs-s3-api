import { Schema, Connection } from "mongoose";
import bcrypt from "bcrypt";
import { EmployeeType } from "../../types";

const EmployeeSchema = new Schema<EmployeeType>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: "employee", immutable: true },
        manager_id: { type: Schema.Types.ObjectId, ref: "Manager", required: true },
        branch_id: { type: Schema.Types.ObjectId, ref: "Branch" },
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

EmployeeSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

EmployeeSchema.methods.compare_password = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};
const getEmployeeModel = (conn: Connection) => {
    return conn.models.Employee || conn.model("Employee", EmployeeSchema);
};

export { EmployeeSchema, getEmployeeModel };