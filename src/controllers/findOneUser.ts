import { Request, Response } from "express";
import UserModel from "../models/userModel";

export const findUserById = async (req: Request, res: Response) => {
    const id: string = req.params.userId;
    const user = await UserModel.findById(id).select("-password");

    if (user) {
      return res.status(200).json({
        message: "User found",
        data: user,
      });
    } else {
      return res.status(404).json({
        message: "User not found",
        data: null,
      });
    }

};
