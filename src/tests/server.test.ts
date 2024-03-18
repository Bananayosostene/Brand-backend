import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import mainRouter from "../routes/index";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use("/brand", mainRouter);

const db: string = process.env.TEST_DB as string;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }as any)
  .then(() => {
    app.listen(3000, () => {
    });
  })
  .catch((error: any) => {
    console.log("Error connecting to the database", error);
    process.exit(1);
  });

export default app;
