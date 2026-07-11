import { Connection } from "mongoose";
import { User } from "./User";

export const getUserModel = (db: Connection) => {
    return db.models.User || db.model("User", User);
};