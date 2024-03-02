import { Request, Response } from "express";
import ContactModel from "../models/contactModel";

export const findContactById = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.contactId;
    const contact = await ContactModel.findById(id);
     console.log(".......",id);

    if (contact) {
      return res.status(200).json({
        message: "Contact found",
        data: contact,
      });
    }
    else {
      console.log("!!!!!!!!!!!!!", id);
      return res.status(404).json({
        message: "Contact not found",
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
