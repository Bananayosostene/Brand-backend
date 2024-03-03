import mongoose from "mongoose";
import bodyParser from "body-parser";
import mainrouter from "./routes/index";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use("/brand", mainrouter);

const db: string =  "mongodb+srv://Sostene:sostene123@cluster0.16msskq.mongodb.net/MyBrand?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(db)
  .then(() => {
    console.log("Database connected successfully!");

    app.listen(5000, () => {
      console.log("Server listening at http://localhost:5000");
    });
  })
  .catch((error: any) => {
    console.error("Error connecting to the database:", error);
  process.exit(1);
  });

export default app;
