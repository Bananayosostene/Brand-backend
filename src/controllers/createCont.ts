import { Request, Response } from "express";
import ContactModel from "../models/contactModel";

export const createContact = async (req: Request, res: Response) => {
  try {
    const newContact = new ContactModel({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });

    const savedContact = await newContact.save();

    return res.status(201).json({
      message: "Contact created successfully",
      data: savedContact,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
