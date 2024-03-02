import { Request, Response } from "express";
import ContactModel from "../models/contactModel";

export const findAllContacts = async (req: Request, res: Response) => {
  try {
    const arrayOfContacts = await ContactModel.find();

    if (arrayOfContacts.length > 0) {
      return res.status(200).json({
        message: "Contacts found",
        data: arrayOfContacts,
      });
    } else {
      return res.status(404).json({
        message: "No contacts found",
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      data: null,
      theErrorIs: error,
    });
  }
};
