import { Request, Response } from "express";
import UserModel from "../models/userModel";

export const deleteUserById = async (req: Request, res: Response) => {
    const id: string = req.params.userId;

    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        data: null,
      });
    }

    const deletedUser = await UserModel.findByIdAndDelete(id).select("-password");

    if (deletedUser) {
      return res.status(200).json({
        message: "User deleted successfully",
        data: deletedUser,
      });
    } else {
      return res.status(500).json({
        message: "Failed to delete user",
        data: null,
      });
    }
};
