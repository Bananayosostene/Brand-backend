import { Request, Response, NextFunction } from "express";
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
    userId?: string;
    userEmail?: string;
    userRole?: string; // Add userRole property
  }
}

export const isAdmin: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole == "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Permission denied. User is not an admin.",
    });
  }
};
