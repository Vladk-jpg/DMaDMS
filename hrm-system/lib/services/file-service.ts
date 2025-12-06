import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export class FileService {
  private static UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "employees");

  static async saveEmployeePicture(file: File): Promise<string> {
    try {
      if (!existsSync(this.UPLOAD_DIR)) {
        await mkdir(this.UPLOAD_DIR, { recursive: true });
      }

      const fileExtension = path.extname(file.name);
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

      if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
        throw new Error("Invalid file type");
      }

      const uniqueFilename = `${randomUUID()}${fileExtension}`;
      const filePath = path.join(this.UPLOAD_DIR, uniqueFilename);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      return `/uploads/employees/${uniqueFilename}`;
    } catch (error) {
      console.error("Error saving file:", error);
      throw new Error("Failed to save file");
    }
  }

  static validateFileSize(file: File, maxSizeInMB: number = 5): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  static validateFileType(file: File): boolean {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    return allowedTypes.includes(file.type);
  }
}
