import express, { Router } from "express";
import { findAllUsers } from "../controllers/findusers";
import { deleteUserById } from "../controllers/deleteuser";
import { createUser } from "../controllers/createuser";
import { login } from "../authentication/login";
import { verifyingtoken } from "../utils/token";
import {updateUserById} from "../controllers/updateUser"
import { findUserById } from "../controllers/findOneUser";

const userRouter: Router = express.Router();

userRouter.post("/post", createUser);
userRouter.get("/get/:userId", verifyingtoken, findUserById);
userRouter.post("/login", login);
userRouter.get("/gets", verifyingtoken, findAllUsers);
userRouter.patch("/update", verifyingtoken, updateUserById);
userRouter.delete("/delete/:userId",verifyingtoken, deleteUserById);

export default userRouter;
