import { Request, Response } from "express";
import UserModel from "../models/userModel";
import BlogModel from "../models/blogModel";
import { verifyingToken } from "../utils/token";
import CommentModel from "../models/commentsModel";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: any;
  };
}

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    verifyingToken(req, res, async () => {
      const { comment } = req.body;
      const { blogId } = req.params;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({
          message: "User information not found in the token",
        });
      }

      const existingBlog = await BlogModel.findById(blogId);

      if (!existingBlog) {
        return res.status(404).json({
          message: "Blog not found",
          data: null,
        });
      }
    console.log('userId', userId);
   
    const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
          data: null,
        });
      }
  console.log("===================", user.username);
  
      const newComment = await CommentModel.create({
        user: user._id,
        username: user.username,
        blog: blogId,
        comment: comment,
      });

      // Automatic update of BlogModel arrays
      await BlogModel.findByIdAndUpdate(
        blogId,
        {
          $push: {
            commentedBy: user._id,
            comments: newComment._id, 
          },
        },
        { new: true }
      );

      return res.status(201).json({
        message: "Comment created successfully",
        data: {
          blogId: blogId,
          UserId: user._id,
          username: user.username,
          comId: newComment._id,
          comment: newComment.comment,
        },
      });
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
