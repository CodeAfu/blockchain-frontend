import { FileType, MediaNFT } from "@prisma/client";
import { Address } from "viem";

export const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/svg+xml"] as const;
export const audioTypes = ["audio/mpeg", "audio/ogg"] as const;
export const videoTypes = ["video/mp4"] as const;

export const allowedContentTypes = [...imageTypes, ...audioTypes, ...videoTypes] as const;

export type MediaContentType = (typeof allowedContentTypes)[number];

export interface MediaItem {
  title: string;
  owner: Address;
  ipfsHash: string;
  timestamp: bigint;
  royaltyFee: bigint;
}

// Events
export interface MediaMintedEvent {
  tokenId: bigint;
  creator: Address;
  metadataURI: string;
  creatorRoyalty: bigint;
  initialPrice: bigint;
}

export interface MediaListedEvent {
  tokenId: bigint;
  seller: Address;
  price: bigint;
}

export interface MediaSoldEvent {
  tokenId: bigint;
  seller: Address;
  buyer: Address;
  price: bigint;
  creatorRoyalty: bigint;
  platformFee: bigint;
}

// export interface MediaRegisteredEvent {
//   mediaId: Hash;
//   owner: Address;
//   title: string;
//   ipfsHash: string;
//   royaltyFee: bigint;
// }

export interface MediaAccessedEvent {
  tokenId: bigint;
  buyer: Address;
  amountPaid: bigint;
}

export interface NFTDto {
  title: string;
  description: string | null;
  royaltyFee: number;
  price: number;
  tags: string[];
}

export interface CreateNFTDataReturnType {
  creatorAddress: Address;
  ownerAddress: Address;
  fileType: FileType | null;
  rawFileType: string;
  fileSize: bigint;
  priceInWei: string;
  royaltyFeeInBasisPoints: bigint;
  isForSale: boolean;
  royaltyFee: number;
  title: string;
  description: string | null;
  price: number;
  tags: string[];
}

export interface NFTData extends Omit<MediaNFT, "priceInWei" | "royaltyFeeInBasisPoints"> {
  royaltyFee: number;
  priceInWei?: string;
  royaltyFeeInBasisPoints?: bigint;
}

export interface MediaNFTWithTempUrl extends MediaNFT {
  tempAccessUri: string;
}


// export interface NFTData {
//   tokenId: number;
//   creatorAddress: string;
//   ownerAddress: string;
//   title: string;
//   description?: string;
//   royaltyFee: bigint;
//   royaltyInBasisPoints: bigint;
//   price: bigint;
//   priceInWei: bigint;
//   tags?: string[];
//   fileType?: FileType;
//   fileSize?: bigint;
// }

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;

  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;

  media?: {
    type: string;
    size_bytes: number;
  };

  pricing: {
    price_eth: number;
    royalty_percent: number;
  };

  properties?: {
    // Optional
    files: Array<{
      uri: string;
      type: string;
    }>;
    category: string;
  };
}

export interface SaleInfo {
  creator: Address;
  creatorRoyalty: bigint;
  owner: Address;
  price: bigint;
  isForSale: boolean;
}

export interface MediaDetails {
  creator: Address;
  creatorRoyalty: bigint;
  salePrice: bigint;
  isForSale: boolean;
}

export interface NFTMediaItem {
  tokenId: bigint;
  tokenURI: string;
  owner: Address;
  creator: Address;
  creatorRoyalty: bigint;
  salePrice: bigint;
  isForSale: boolean;
}

export interface MediaNFTInput {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  royaltyFee: bigint;
  creatorAddress: string;
  recipientAddress?: string;
}

export interface MintResult {
  tokenId: number;
  creator: string;
  recipient: string;
  royaltyFee: bigint;
  fileIpfsHash: string;
  metadataIpfsHash: string;
  transactionHash: string;
}

export interface MediaAccessData {
  tokenId: number;
  buyerAddress: string;
  amountPaid: bigint;
  transactionHash?: string;
}

export interface MediaTransferData {
  tokenId: number;
  fromAddress: string;
  toAddress: string;
  transactionHash?: string;
}
