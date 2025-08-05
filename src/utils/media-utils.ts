import { allowedContentTypes, MediaContentType, NFTData } from "@/types/media";
import { getFileType } from "./file-utils";
import { FileType } from "@prisma/client";

export function convertPercentToBasisPoints(percent: number) {
  return BigInt(Math.floor(percent * 100));
}

export function convertBasisPointsToPercent(rfbp: bigint) {
  return Number(rfbp) / 100;
}

export function tagsToList(tags: string) {
  return tags
    .trim()
    .split(" ")
    .map(item => item.replaceAll(",", "").replaceAll(".", ""));
}

export function isAllowedType(type: string): type is MediaContentType {
  return allowedContentTypes.includes(type as MediaContentType);
}

export function patchNFTFileData(file: File, nft: NFTData) {
  nft.fileType = getFileType(file.type);
  nft.fileSize = BigInt(file.size);
}

export function fileTypeToMediaTypeMapper(
  fileType: FileType | null | undefined
): "audio" | "video" | "image" | undefined {
  if (!fileType) return undefined;

  const mapper: Record<FileType, "audio" | "video" | "image"> = {
    [FileType.AUDIO]: "audio",
    [FileType.VIDEO]: "video",
    [FileType.IMAGE]: "image",
  };

  return mapper[fileType];
}
