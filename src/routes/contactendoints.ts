import express, { Router } from "express";
import { deleteContactById } from "../controllers/deleteCont";
import { findAllContacts } from "../controllers/findAllCont";
import { findContactById } from "../controllers/findOneCont";
import { createContact } from "../controllers/createCont";
import { verifyingToken } from "../utils/token";
import { isAdmin } from "../midddleware/permission";

const contactRouter: Router = express.Router();

contactRouter.post("/post", createContact);
contactRouter.use(verifyingToken);
contactRouter.use(isAdmin);
contactRouter.get("/get/:contactId", findContactById);
contactRouter.get("/gets", findAllContacts);
contactRouter.delete("/delete/:contactId", deleteContactById);

export default contactRouter;
