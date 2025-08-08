"use server";

import { db } from "@/lib/database";
import { MediaAccessAndTransferLogs } from "@/types/media";
import { MediaNFT } from "@prisma/client";
import z from "zod";
import { devLog } from "@/utils/logging";
import { prisma } from "@/lib/prisma";

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

export async function getAllMediaByCursor(
  formData?: unknown
): Promise<{ media: MediaNFT[]; hasMore: boolean; nextCursor?: string }> {
  const parsed = FilterSchema.safeParse(formData);
  if (!parsed.success) {
    console.error("Invalid filters passed to getAllMediaByCursor:", parsed.error);
    return { media: [], hasMore: false };
  }

  const filters = parsed.data;
  devLog("[SVR] Filters: ", filters);
  const dbResult = await db.getMediaNFTsByCursor(filters.limit ?? 4, filters.cursorId, filters);
  const media: MediaNFT[] = dbResult.media;

  const result = {
    media: media,
    hasMore: dbResult.hasMore,
    nextCursor: dbResult.nextCursor,
  };

  return result;
}

export async function getMediaItem(
  id: string
): Promise<(MediaNFT & MediaAccessAndTransferLogs) | null> {
  const media = await db.getMediaNFT(id);
  if (!media) {
    console.error("[SVR] No media found with ID:", id);
    return null;
  }

  return media;
}

export async function getMyMedia(ownerAddress?: string): Promise<MediaNFT[]> {
  const result = await prisma.mediaNFT.findMany({
    where: {
      ownerAddress: ownerAddress,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
}
