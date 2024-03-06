import express, { Router } from "express";
import { createBlog } from "../controllers/createBlog";
import { findBlogById } from "../controllers/findOneBlog";
import { findAllBlogs } from "../controllers/findAllBlog";
import { deleteBlogById } from "../controllers/deleteBlog";
import { updateBlogById } from "../controllers/updateBlog";
import { uploaded } from "../utils/multer";
import { verifyingToken } from "../utils/token";
import multer from "multer";
import { likingBlogById } from "../controllers/likingblog";
import { createComment } from "../controllers/createComments";
import { findCommentsOnBlog } from "../controllers/FindCommentsOnOneBlog";
import { deleteCommentsOnBlog } from "../controllers/deleteCommentsOnBlog";
import { adminAuthMiddleware } from "../middleware/permission";

const blogRouter: Router = express.Router();

blogRouter.get("/get/:blogId", findBlogById);
blogRouter.get("/gets", findAllBlogs);
blogRouter.get("/:blogId/findCommentsOnBlog", findCommentsOnBlog);
blogRouter.use(verifyingToken);
blogRouter.post("/like/:blogId", likingBlogById);
blogRouter.post("/createCom/:blogId", createComment);
blogRouter.use(adminAuthMiddleware);
blogRouter.post("/post", uploaded, createBlog);
blogRouter.delete("/delete/:blogId", deleteBlogById);
blogRouter.patch("/update/:blogId", updateBlogById);
blogRouter.delete("/:blogId/deleteComments", deleteCommentsOnBlog);

export default blogRouter;
