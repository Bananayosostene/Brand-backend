import express, { Router } from "express";
import { findAllUsers } from "../controllers/findusers";
import { deleteUserById } from "../controllers/deleteuser";
import { createUser } from "../controllers/createuser";
import { login } from "../authentication/login";
import { verifyingToken } from "../utils/token";
import {updateUserById} from "../controllers/updateUser"
import { findUserById } from "../controllers/findOneUser";
import { isAdmin } from "../midddleware/permission";

const userRouter: Router = express.Router();

userRouter.post("/login", login);
userRouter.post("/post", createUser);
userRouter.patch("/update/:userId", updateUserById);
userRouter.use(verifyingToken);
userRouter.use(isAdmin);
userRouter.get("/get/:userId", findUserById);
userRouter.get("/gets",  findAllUsers);
userRouter.delete("/delete/:userId", deleteUserById);

export default userRouter;
