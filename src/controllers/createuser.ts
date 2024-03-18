import { Request, Response } from "express";
import UserModel from "../models/userModel";
import { passwordHashing } from "../utils/passencodingAnddecoding";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, gender, role } = req.body;

    const existingUser = await UserModel.findOne({ email }).select("-password");
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
        data: null,
      });
    }

    let hashedPass = await passwordHashing(req.body.password);
    let newUserDetails = { ...req.body, password: hashedPass };
    const newUser = await UserModel.create(newUserDetails);

    if (newUser) {
      return res.status(201).json({
        message: "Signup successful",
        data: newUser,
      });
    } else {
      return res.status(500).json({
        message: "Failed to signup",
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
