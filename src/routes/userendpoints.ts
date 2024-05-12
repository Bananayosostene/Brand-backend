import express, { Router } from "express";
import { findAllUsers } from "../controllers/findAllUsers";
import { deleteUserById } from "../controllers/deleteuser";
import { createUser } from "../controllers/createuser";
import { login } from "../authentication/login";
import { verifyingToken } from "../utils/token";
import { updateUserById } from "../controllers/updateUser";
import { findUserById } from "../controllers/findOneUser";
import { adminAuthMiddleware } from "../middleware/permission";
import { uploaded } from "../utils/multer";
import { logout } from './../authentication/logout';

const userRouter: Router = express.Router();

userRouter.post("/login", login);
userRouter.post("/post", createUser);
userRouter.use(verifyingToken);
userRouter.post("/logout", logout);
userRouter.use(adminAuthMiddleware);
userRouter.get("/get/:userId", findUserById);
userRouter.get("/gets", findAllUsers);
userRouter.delete("/delete/:userId", deleteUserById);
userRouter.patch("/update/:userId", uploaded, updateUserById);

export default userRouter; 
