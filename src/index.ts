import express from "express";
import bodyParser from "body-parser";
import mainRouter from "./routes/index";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use("/brand", mainRouter);

import YAML from "yamljs";
import path from "path"; 
const swaggerJsdoc = YAML.load(path.join(__dirname, "./yamal.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc));

const DbConnection: string = process.env.db_live as string;
 console.log("-----------------", DbConnection);
mongoose
.connect(DbConnection)
.then(() => {
    console.log("Database connected successfully!");
    app.listen(PORT, () => {
      console.log(`Server listenings at http://localhost:${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  });
