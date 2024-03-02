import express, { Router } from "express";
import { createBlog } from "../controllers/createBlog";
import { findBlogById } from "../controllers/findOneBlog";
import { findAllBlogs } from "../controllers/findAllBlog";
import { deleteBlogById } from "../controllers/deleteBlog";
import { updateBlogById } from "../controllers/updateBlog";
import { uploaded } from "../utils/multer";
import { verifyingtoken } from "../utils/token";
import multer from "multer";

const blogRouter: Router = express.Router();

blogRouter.post("/post", uploaded,createBlog);
blogRouter.get("/get/:blogId", findBlogById);
blogRouter.get("/gets", findAllBlogs);
blogRouter.delete("/delete/:blogId", deleteBlogById);
blogRouter.patch("/update/:blogId", updateBlogById);

export default blogRouter;

