"use server";

import { db } from "@/lib/database";
import { MediaAccessAndTransferLogs, MediaNFTWithTempUrl } from "@/types/media";
import { MediaNFT } from "@prisma/client";
import { getAccessLinkByCid, getMetadata } from "./nft-actions";
import z from "zod";
import { devLog } from "@/utils/logging";
import { decrypt } from "@/lib/hashing";
import { prisma } from "@/lib/prisma";
import { parseNFTMetadata } from "@/utils/media-utils";

const FilterSchema = z.object({
  limit: z.number().default(4),
  cursorId: z.string().optional(),
  mediaType: z.array(z.enum(["audio", "video", "image"])).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  search: z.string().optional(),
  sortPrice: z.enum(["asc", "desc"]).optional(),
  sortDate: z.enum(["newest", "oldest"]).optional(),
});

export async function getAllMedia(limit?: number, offset?: number): Promise<MediaNFT[]> {
  return await db.getPaginatedMediaNFTs(limit, offset);
}

export async function getAllMediaWithUrl(
  limit?: number,
  offset?: number
): Promise<MediaNFTWithTempUrl[]> {
  const dbResult = await db.getPaginatedMediaNFTs(limit, offset);
  const result = Promise.all(
    dbResult.map(async item => {
      const uri = await getAccessLinkByCid(decrypt(item.cid));
      if (uri.error) {
        console.error("Failed to get URI from Pinata.");
      }
      return {
        ...item,
        tempAccessUri: uri.data || "",
      };
    })
  );
  return result;
}

export async function getAllMediaByCursorWithUrl(
  formData?: unknown
): Promise<{ media: MediaNFTWithTempUrl[]; hasMore: boolean; nextCursor?: string }> {
  const parsed = FilterSchema.safeParse(formData);
  if (!parsed.success) {
    console.error("Invalid filters passed to getAllMediaByCursor:", parsed.error);
    return { media: [], hasMore: false };
  }

  const filters = parsed.data;
  devLog("[SVR] Filters: ", filters);
  const dbResult = await db.getMediaNFTsByCursor(filters.limit ?? 4, filters.cursorId, filters);
  const media = dbResult.media;

  const mediaResult = await Promise.all(
    media.map(async item => {
      const uri = await getAccessLinkByCid(decrypt(item.cid));
      if (uri.error) {
        console.error("Failed to get URI from Pinata.");
      }

      return {
        ...item,
        tempAccessUri: uri.data || "",
      };
    })
  );

  const result = {
    media: mediaResult,
    hasMore: dbResult.hasMore,
    nextCursor: dbResult.nextCursor,
  };

  return result;
}

export async function getMediaItemWithUrl(
  id: string
): Promise<(MediaNFTWithTempUrl & MediaAccessAndTransferLogs & { fileExtension: string }) | null> {
  const media = await db.getMediaNFT(id);
  if (!media) {
    console.error("[SVR] No media found with ID:", id);
    return null;
  }

  const uriResult = await getAccessLinkByCid(decrypt(media.cid));
  if (uriResult.error) {
    console.error("[SVR] Error whil fetching temporary access uri: ", uriResult.error);
    return null;
  }

  const metadataResult = await getMetadata(media.metadataCid);
  if (metadataResult.error) {
    console.error("[SVR] Error whil fetching temporary access uri: ", uriResult.error);
    return null;
  }

  const rawMetadata = metadataResult.data;

  const parsedMetadata = parseNFTMetadata(rawMetadata.data);
  if (!parsedMetadata) return null;

  const fileTypeTrait = parsedMetadata.attributes.find(attr => attr.trait_type === "File Type");

  const fileExtension =
    typeof fileTypeTrait?.value === "string"
      ? (fileTypeTrait.value.split("/").pop() ?? "bin")
      : "bin";

  return {
    ...media,
    tempAccessUri: uriResult.data,
    fileExtension,
  };
}

export async function getMyMedia(ownerAddress?: string): Promise<MediaNFTWithTempUrl[]> {
  const dbResult = await prisma.mediaNFT.findMany({
    where: {
      ownerAddress: ownerAddress,
    },
    orderBy: { createdAt: "desc" },
  });

  const result = await Promise.all(
    dbResult.map(async item => {
      const uri = await getAccessLinkByCid(decrypt(item.cid));
      if (uri.error) {
        console.error("Failed to get URI from Pinata.");
      }

      return {
        ...item,
        tempAccessUri: uri.data || "",
      };
    })
  );

  return result;
}
