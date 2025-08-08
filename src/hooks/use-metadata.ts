"use client";
import { getMetadata } from "@/actions/nft-actions";
import { NFTMetadata } from "@/types/media";
import { useQuery } from "@tanstack/react-query";

export function parseNFTMetadata(raw: unknown): NFTMetadata | null {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as NFTMetadata;
    } catch (err) {
      console.error("Failed to parse metadata JSON string:", err);
      return null;
    }
  }
  if (raw && typeof raw === "object") {
    return raw as NFTMetadata;
  }
  console.error("Unrecognized metadata format.");
  return null;
}

export function useMetadata(metadataCid: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["nft-metadata", metadataCid],
    queryFn: async () => {
      const metadataResult = await getMetadata(metadataCid);
      if (metadataResult.error) {
        throw new Error(metadataResult.error.message);
      }
      const parsedMetadata = parseNFTMetadata(metadataResult.data?.data);
      if (!parsedMetadata) {
        throw new Error("Failed to parse metadata");
      }
      return parsedMetadata;
    },
    enabled: !!metadataCid,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - metadata never changes
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days - keep in memory longer
    retry: 2,
  });

  // Extract file extension from metadata
  const fileExtension = data?.attributes?.find(attr => attr.trait_type === "File Type")?.value;
  const parsedFileExtension =
    typeof fileExtension === "string" ? (fileExtension.split("/").pop() ?? "bin") : "bin";

  return {
    metadata: data,
    fileExtension: parsedFileExtension,
    isLoadingMetadata: isLoading,
    isErrorLoadingMetadata: isError,
    metadataError: error,
  };
}
