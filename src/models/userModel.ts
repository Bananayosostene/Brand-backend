import mongoose, { Document, Model, Schema } from "mongoose";

interface UserAttributes {
  username: string;
  email: string;
  password: string;
  gender: string;
  role: string;
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
    validate: {
      validator: (value: string) => /\S+@\S+\.\S+/.test(value),
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
});

const UserModel: Model<UserDocument> = mongoose.model<UserDocument>("User",userSchema);

export default UserModel;
