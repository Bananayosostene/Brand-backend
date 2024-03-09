import { Request, Response } from "express";
import BlogModel from "../models/blogModel";

export const findAllBlogs = async (req: Request, res: Response) => {
  try {
    const arrayOfBlogs = await BlogModel.find()
      .populate("comments", "comment")
      .populate("commentedBy", "username")
      .populate("likedBy", "username");

    if (arrayOfBlogs.length > 0) {
      return res.status(200).json({
        message: "Blog posts found",
        data: arrayOfBlogs,
      });
    } else {
      return res.status(404).json({
        message: "No blog posts found",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
    });
  }
};
