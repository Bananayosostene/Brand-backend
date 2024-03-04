import mongoose, { Document, Model, Schema } from "mongoose";

interface UserAttributes {
  username: string;
  email: string;
  password: string;
  role: String;
}


interface UserDocument extends Document, UserAttributes {}

const userSchema: Schema<UserDocument> = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
});

const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User",userSchema);

export default UserModel;
