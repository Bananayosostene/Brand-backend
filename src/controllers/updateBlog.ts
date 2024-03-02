import { Request, Response } from "express";
import BlogModel from "../models/blogModel";

export const updateBlogById = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.blogId;

    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found",
        data: null,
      });
    }

    const updatedBlog = await BlogModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (updatedBlog) {
      return res.status(200).json({
        message: "Blog post updated successfully",
        data: updatedBlog,
      });
    } else {
      return res.status(500).json({
        message: "Failed to update blog post",
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
