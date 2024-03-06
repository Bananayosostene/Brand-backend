import mongoose, { Document, Model, Schema } from "mongoose";

interface ContactAttributes {
  name: string;
  email: string;
  message: string;
  createdAt: string; 
  
}

function validateEmail(email: string): boolean {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
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
    validate: [
      {
        validator: (value: string) => validateEmail(value),
        message: "Invalid email format",
      },
    ],
  },
  message: {
    type: String,
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
