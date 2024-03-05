import { Request, Response } from "express";
import BlogModel from "../models/blogModel";
import {commentSchema} from "../models/commentsModel";

import mongoose from "mongoose";
mongoose.model("CommentModel", commentSchema);
export const findBlogById = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.blogId;
    const blog = await BlogModel.findById(id)
      .populate("comments");

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
  } catch (error:any) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      error:error.message
    });
  }
};
