import { Request, Response } from "express";
import UserModel from "../models/userModel";

export const updateUserById = async (req: Request, res: Response) => {
    const id: string = req.params.userId;

    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        data: null,
      });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (updatedUser) {
      return res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    } else {
      return res.status(500).json({
        message: "Failed to update user",
        data: null,
      });
    }
};
