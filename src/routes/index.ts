import { Router } from "express";
import userRouter from "./userendpoints";
import contactRouter from "./contactendoints";
import blogRouter from "./blogendpoints";

const mainRouter: Router = Router();
mainRouter.use("/contact", contactRouter);
mainRouter.use("/user", userRouter); 
mainRouter.use("/blog", blogRouter); 

export default mainRouter;