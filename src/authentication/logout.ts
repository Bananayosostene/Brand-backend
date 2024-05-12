import BlacklistModel from "../models/blacklist";
import { Request, Response } from "express";

export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Token not found in request" });
    }

    // Check if the token is already blacklisted
    const blacklistedToken = await BlacklistModel.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token is already blacklisted" });
    }
    
    // Blacklist the token
    await BlacklistModel.create({ token });

    return res.status(201).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default logout;
