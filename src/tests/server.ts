import mongoose from "mongoose";
import bodyParser from "body-parser";
import mainRouter from "../routes/index";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(bodyParser.json());
// app.use("/brand", mainrouter);

const db: string = "mongodb://localhost:27017/MyBrandTest";
app.use("/brand", mainRouter);

mongoose
  .connect(db)
  .then(() => {

    app.listen(3000, () => {
    });
  })
  .catch((error: any) => {
    process.exit(1);
  });

export default app;

