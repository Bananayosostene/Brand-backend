import { Request, Response } from "express";
import BlogModel from "../models/blogModel";
import { verifyingToken } from "../utils/token";

interface AuthenticatedRequest extends Request {
  user?: {
    _id:any ;
  };
}

export const likingBlogById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    verifyingToken(req, res, async () => {
      const blogId = req.params.blogId;
        const userId = req.user?._id; 
        
      if (!userId) {
        return res.status(401).json({
          message: "User information not found in the token",
        });
      }

      const blog = await BlogModel.findById(blogId);

      if (blog) {
        // Check if the user has already liked the blog
        if (blog.likedBy.includes(userId)) {
          return res.status(400).json({
            message: "You have already liked this blog",
            data: blog,
          });
        }

        blog.likes += 1;
        blog.likedBy.push(userId);
        await blog.save();
        return res.status(200).json({
          message: "Blog liked successfully",
          data: blog,
        });
      } else {
        return res.status(404).json({
          message: "Blog not found",
          data: null,
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
