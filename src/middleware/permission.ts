// adminAuthMiddleware.ts

import { Request, Response, NextFunction } from "express";
import UserModel from "../models/userModel";

interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
  userEmail?: string;
}

export const adminAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - User not authenticated",
      });
    }

    const user = await UserModel.findById(req.user._id);

    if (user && user.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        message: "Forbidden - User does not have admin privileges",
      });
    }
  } catch (error:any) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error.message,
    });
  }
};
