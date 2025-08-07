import { FileType } from "@prisma/client";

export function getFileType(mimeType: string): FileType | null {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  return null;
}

export function getFileBaseName(filename: string): string {
  const lastDotIndex = filename.lastIndexOf(".");
  return lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;
}

export function getFileExt(filename: string): string | null {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
    return null;
  }
  return filename.slice(lastDotIndex + 1).toLowerCase();
}

export function formatFileSize(bytes: bigint) {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === BigInt(0)) return "0 Bytes";
  const i = Math.floor(Math.log(Number(bytes)) / Math.log(1024));
  return Math.round((Number(bytes) / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}
