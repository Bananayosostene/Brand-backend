import { Request, Response } from "express";
import UserModel from "../models/userModel";
import { passComparer } from "../utils/passencodingAnddecoding";
import { generateToken } from "../utils/token";
export const login = async (req: Request, res: Response) => {
    const userEmail = req.body.useremail;
    const userPassword = req.body.password;

    const user = await UserModel.findOne({ email: userEmail });
    

    if (user) {
      // console.log(user);
      let userInfos = { email: user.email, _id: user._id };

      let token = generateToken(userInfos);
      let isValidPass = await passComparer(userPassword, user.password);
      
      
      if (isValidPass) {
        return res.status(200).json({
          message: "Login successful",
          tokenisthe: `${token}`,
          data: user,
        });
      } 
    } else {
      return res.status(401).json({
        message: `user with ${userEmail} not found`,
        data: null,
      });
    }
};


