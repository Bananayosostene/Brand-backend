import express from "express";
import bodyParser from "body-parser";
import mainRouter from "./routes/index";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import cors from 'cors'
import YAML from "yamljs";
import path from "path"; 
import dotenv from "dotenv";


dotenv.config();

const app = express();
const PORT = 5000;

app.use(
  cors({
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.urlencoded({ extended: true }))

app.use("/brand", mainRouter);

const swaggerJsdoc = YAML.load(path.join(__dirname, "./yamal.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc));

const DbConnection: string = process.env.onlineDB as string;
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
export default app;