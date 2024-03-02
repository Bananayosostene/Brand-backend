import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

export const passwordHashing = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error(
      `Error hashing password: ${
        error instanceof Error ? error.message : error
      }`
    );
    throw new Error("Password hashing failed");
  }
};

export const passComparer = async (
  password: string,
  hashedPass: string
): Promise<boolean> => {
  try {
    let result = await bcrypt.compare(password, hashedPass);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error comparing passwords: ${error.message}`);
      throw new Error("Password comparison failed");
    } else {
      console.error(
        `An unknown error occurred during password comparison: ${error}`
      );
      throw new Error("Password comparison failed");
    }
  }
};
