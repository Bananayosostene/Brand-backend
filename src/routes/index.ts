import { Router } from "express";
import userRouter from "./userendpoints";
import contactRouter from "./contactendoints";
import blogRouter from "./blogendpoints";

const mainrouter: Router = Router();
mainrouter.use("/contact", contactRouter);
mainrouter.use("/user", userRouter); 
mainrouter.use("/blog", blogRouter); 

export default mainrouter;