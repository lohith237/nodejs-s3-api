import { Router } from "express";
import { createUser,updateUser,deleteUser,getAllUsers, Login,getUserById,RefreshToken } from "../controllers";
import { createUploader } from "../../config/s3";
import { AuthMiddleware,refreshAuthMiddleware,resolveTenant,findLoginUser } from "../middlewares";
const UserRoute=Router()

UserRoute.post("/",createUploader("user").single("image"),createUser)
UserRoute.post("/login",resolveTenant,findLoginUser,Login)
UserRoute.get("/refresh-token", refreshAuthMiddleware, RefreshToken);
UserRoute.get("/",AuthMiddleware,getAllUsers)
UserRoute.get("/:id",AuthMiddleware,getUserById)
UserRoute.patch("/:id",createUploader("user").single("image"),updateUser)
UserRoute.delete("/:id",AuthMiddleware,deleteUser)

export {UserRoute}