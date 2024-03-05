import { Request, Response } from "express";
import UserModel from "../models/userModel";

export const findAllUsers = async (req: Request, res: Response) => {
  try {
    const arrayOfUsers = await UserModel.find().select("-password");

    if (arrayOfUsers.length > 0) {
      // Users found
      return res.status(200).json({
        message: "Users found",
        data: arrayOfUsers,
      });
    } else {
      // No users found
      return res.status(404).json({
        message: "No users found",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
