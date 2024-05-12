import mongoose, { Document, Model, Schema } from "mongoose";

interface BlacklistAttributes {
    token: string;
}

interface BlacklistDocument extends Document, BlacklistAttributes {}

const userSchema: Schema<BlacklistDocument> = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
});

const BlacklistModel: Model<BlacklistDocument> = mongoose.model<BlacklistDocument>("blacklist", userSchema);

export default BlacklistModel;




