// findCommentsOnBlog.ts
import { Request, Response } from "express";
import CommentModel from "../models/commentsModel";

export const findCommentsOnBlog = async (req: Request, res: Response) => {
  try {
    const { blogId } = req.params;

    const comments = await CommentModel.find({ blog: blogId })
      .populate("user")
      .populate("blog")
      .populate("comment");

    return res.status(200).json({
      message: "Comments on the blog retrieved successfully",
      data: comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
