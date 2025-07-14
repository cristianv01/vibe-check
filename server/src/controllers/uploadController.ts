import { Request, Response } from "express";
import { S3Service } from '../services/s3Service';

export const generatePresignedUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fileType, fileName, folder } = req.body;
    
    if (!fileType) {
      res.status(400).json({ message: 'fileType is required' });
      return;
    }
    
    const result = await S3Service.generatePresignedUrl({
      fileType,
      fileName,
      folder: folder || 'posts'
    });
    
    res.json(result);
  } catch (error: any) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ message: 'Error generating upload URL', error: error.message });
  }
}; 