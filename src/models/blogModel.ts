import mongoose, { Document, Model, Schema } from "mongoose";

interface BlogAttributes {
  image: string; 
  title: string;
  description: string;
  comments: string[]; 
  likes: number;
}

interface BlogDocument extends Document, BlogAttributes {}

const blogSchema: Schema<BlogDocument> = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  comments: {
    type: [String],
    default: [],
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const BlogModel: Model<BlogDocument> = mongoose.model<BlogDocument>(
  "Blog",
  blogSchema
);

export default BlogModel;
