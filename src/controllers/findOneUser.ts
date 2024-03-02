import { Request, Response } from "express";
import UserModel from "../models/userModel";

export const findUserById = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.userId;
    const user = await UserModel.findById(id);

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
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
