// deleteCommentsOnBlog.ts
import { Request, Response } from "express";
import CommentModel from "../models/commentsModel";
import BlogModel from "../models/blogModel";

export const deleteCommentsOnBlog = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    // Check if the blog exists
    const existingBlog = await BlogModel.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({
        message: "Blog not found",
        data: null,
      });
    }

    // Delete comments associated with the blog
    await CommentModel.deleteMany({ blog: blogId });

    return res.status(200).json({
      message: "Comments on the blog deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
