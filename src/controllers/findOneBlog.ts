import { Request, Response } from "express";
import BlogModel from "../models/blogModel";

export const findBlogById = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.blogId;
    const blog = await BlogModel.findById(id);

    if (blog) {
      return res.status(200).json({
        message: "Blog post found",
        data: blog,
      });
    } else {
      return res.status(404).json({
        message: "Blog post not found",
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
