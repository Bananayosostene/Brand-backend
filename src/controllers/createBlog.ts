import { Request, Response } from "express";
import BlogModel from "../models/blogModel";
import { v2 as cloudinary } from "cloudinary";
import { Multer } from "multer";
import { uploaded } from "../utils/multer";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});


export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!req.files || !(req.files as any).image) {
      return res.status(400).json({
        message: "Image file is required",
        data: null,
      });
    }
    
    
    const imageFile = (req.files as any).image[0] as any;
    const result = await cloudinary.uploader.upload(imageFile.path);

    const newBlog = await BlogModel.create({
      image: result.secure_url,
      title,
      description,
      comments: [],
      likes: 0,
    });

    if (newBlog) {
      return res.status(201).json({
        message: "Blog post created successfully",
        data: newBlog,
      });
    } else {
      return res.status(500).json({
        message: "Failed to create a blog post",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};


