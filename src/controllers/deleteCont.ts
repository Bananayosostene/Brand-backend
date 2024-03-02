import { Request, Response } from "express";
import ContactModel from "../models/contactModel";

export const deleteContactById = async (req: Request, res: Response) => {
  try {
    const id: string = req.params.contactId;

    const contact = await ContactModel.findById(id);

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
        data: null,
      });
    }

    const deletedContact = await ContactModel.findByIdAndDelete(id);

    if (deletedContact) {
      return res.status(200).json({
        message: "Contact deleted successfully",
        data: deletedContact,
      });
    } else {
      return res.status(500).json({
        message: "Failed to delete contact",
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
