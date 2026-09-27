import { Request, Response } from "express";

export const uploadMedia = (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file was uploaded.",
      });
      return;
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: "File uploaded successfully.",
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl,
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
