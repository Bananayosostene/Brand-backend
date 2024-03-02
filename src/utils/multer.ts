import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';


async function ensureDir(directory: string): Promise<void> {
  try {
    await fs.promises.access(directory, fs.constants.F_OK);
  } catch (e) {
    await fs.promises.mkdir(directory, { recursive: true });
    console.log("errors", e);
  }
}

 const storage = multer.diskStorage({
  destination(req: Request, file: Express.Multer.File, cb) {
    const dir = "images_container";
    ensureDir(dir);
    cb(null, "images_container");
  },
  filename(req: Request, file: Express.Multer.File, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ storage: storage });

export const uploaded = upload.fields([
  { name: "picture", maxCount: 1 },
  { name: "image", maxCount: 4 },
  { name: "images", maxCount: 20 }
]);
