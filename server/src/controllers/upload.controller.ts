import { Request, Response, NextFunction } from "express";
import { generateUploadUrl } from "../services/storage.service.js";

export async function getPresignedUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const { fileName, contentType, prefix } = req.body;
    
    const data = await generateUploadUrl(fileName, contentType, prefix);
    
    res.json({
      status: "success",
      data
    });
  } catch (error) {
    next(error);
  }
}
