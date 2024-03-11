import { Schema, model, Document, Types } from "mongoose";

interface CommentAttributes {
  user: any;
  blog: Types.ObjectId;
  comment: string;
  username: string;
}

export interface CommentDocument extends Document, CommentAttributes {}

 export const commentSchema: Schema<CommentDocument> = new Schema({
   user: {
     type: Schema.Types.ObjectId,
     ref: "User",
     required: true,
   },
   blog: {
     type: Schema.Types.ObjectId,
     ref: "Blog",
     required: true,
   },
   comment: {
     type: String,
     required: true,
   },
   username: {
     type: String,
     required: true,
   },
 });

const CommentModel = model<CommentDocument>("Comment", commentSchema);

export default CommentModel;
