import mongoose, { Document, Model, Schema } from "mongoose";

interface ContactAttributes {
  name: string;
  email: string;
  message: string;
  createdAt: string; 
  
}

interface ContactDocument extends Document, ContactAttributes {}

const contactSchema: Schema<ContactDocument> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: String,
    default: () => {
      const currentDate = new Date();
      const date = currentDate.toISOString().split("T")[0];
      const time = currentDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${date} ${time}`;
    },
  },
});

const ContactModel: Model<ContactDocument> = mongoose.model<ContactDocument>("Contact",contactSchema);

export default ContactModel;
