import supertest from "supertest";
import { Response } from "supertest";
import { Request } from "supertest";
import UserModel from "../models/userModel";
import { deleteContactById } from "../controllers/deleteCont";
import app from "../index";
import * as bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { passComparer } from "../utils/passencodingAnddecoding";
import { passwordHashing } from "../utils/passencodingAnddecoding";
import ContactModel from "../models/contactModel";
import { generateToken, verifyingToken } from "../utils/token";
import { any } from "joi";
import BlogModel from "../models/blogModel";

jest.mock("cloudinary");
jest.mock("../models/blogModel");

dotenv.config();
const request = supertest(app);

beforeAll(async () => {
  const testDbConnection: string = process.env.TESTDB as string;
  mongoose.connect(testDbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any);
});

afterAll(async () => {
  await mongoose.disconnect();
});

//index.ts

