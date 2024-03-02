import jwt from "jsonwebtoken";

import { Request, Response, NextFunction } from "express";

// Extend the Request interface to include the new properties
interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
  userEmail?: string;
}
let secret = "mysecret";
let duration = "10m";
export const tokengenerating = (payload: any): string => {
  console.log("-----the process.env.JWT_EXP is ", duration);
  let token = jwt.sign(payload, secret, {
    expiresIn: duration,
  });
  return token;
};

export const verifyingtoken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // console.log("in----------------------------------- verify token");
    let auth = req.headers.authorization;
    let token = auth?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "no access token provided",
      });
    }

    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        return res.status(401).json({
          message: `the from verify token error: ${(error as Error).message}`,
        });
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    return res.status(500).json({
      message: `Internal server from verify token error: ${
        (err as Error).message
      }`,
    });
  }
};
