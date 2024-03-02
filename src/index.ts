import mongoose from "mongoose";
import bodyParser from "body-parser";
import mainrouter from "./routes/index";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use("/brand", mainrouter);

const db: string = "mongodb://localhost:27017/MyBrand";

mongoose
  .connect(db)
  .then(() => {
    console.log("Database connected successfully");

    app.listen(5000, () => {
      console.log("Server listening at http://localhost:5000");
    });
  })
  .catch((error: any) => {
    console.error("Error connecting to the database:", error);

  });

export default app;
