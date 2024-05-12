import { Request, Response } from "express";
import BlogModel from "../models/blogModel";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

export const updateBlogById = async (req: Request, res: Response) => {
    const id: string = req.params.blogId;

    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found",
        data: null,
      });
    }

    // Check if req.files and req.files.image exist
    const imageFile = (req.files as any)?.image?.[0] as any;
    if (!imageFile) {
      return res.status(400).json({
        message: "Image file is required",
        data: null,
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.path);
    if (!result || !result.secure_url) {
      return res.status(500).json({
        message: "Failed to upload image to Cloudinary",
        data: null,
      });
    }

    const { title, description } = req.body;
    const updateFields = { title, description, image: result.secure_url };

    // Update the blog post
    const updatedBlog = await BlogModel.findByIdAndUpdate(id, updateFields, {
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
};
