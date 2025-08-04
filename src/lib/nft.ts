import { createMetadata, saveToDatabase } from "@/actions/nft-actions";
import { CreateNFTDataReturnType, NFTData, NFTDto } from "@/types/media";
import { devLog } from "@/utils/logging";
import { getFileType } from "@/utils/file-utils";
import { Address, parseEther } from "viem";
import { uploadMetadata } from "@/lib/ipfs/upload";
import { Result } from "@/types/result";
import { MediaContract } from "@/types/contract";
import { convertPercentToBasisPoints } from "@/utils/media-utils";
import { MediaNFT } from "@prisma/client";
import { tryCatch } from "@/utils/try-catch";
import { toWei } from "@/utils/ethers-utils";

type PatchedNFT = Omit<NFTData, "tokenId"> & {
  royaltyFeeInBasisPoints: bigint;
  priceInWei: string;
  rawFileType: string;
};

export function createNFTData(
  nftData: NFTDto,
  address: Address,
  file: File
): CreateNFTDataReturnType {
  return {
    ...nftData,
    creatorAddress: address,
    ownerAddress: address,
    fileType: getFileType(file.type),
    rawFileType: file.type,
    fileSize: BigInt(file.size),
    priceInWei: parseEther(nftData.price.toString()).toString(),
    royaltyFeeInBasisPoints: convertPercentToBasisPoints(nftData.royaltyFee),
    isForSale: false,
  };
}

export async function mintNFTWithMetadata(
  nftDataDto: CreateNFTDataReturnType,
  address: Address,
  contract: MediaContract,
  fileCid: string,
  mintingFee: bigint
): Promise<Result<MediaNFT>> {
  try {
    // Create metadata
    const metadataResult = await tryCatch(
      createMetadata({
        cid: fileCid,
        title: nftDataDto.title,
        description: nftDataDto.description || "",
        rawFileType: nftDataDto.rawFileType,
        fileSize: nftDataDto.fileSize,
        price: nftDataDto.price,
        royaltyFee: nftDataDto.royaltyFee,
        isForSale: nftDataDto.isForSale,
      })
    );

    if (metadataResult.error) {
      return metadataResult;
    }

    const metadata = metadataResult.data;
    const metadataUploadResult = await uploadMetadata(metadata, address);

    if (metadataUploadResult.error) {
      return metadataUploadResult;
    }

    const metadataURI = metadataUploadResult.data.cid;
    const patchedNFTData = patchNFTData(nftDataDto);

    // Mint NFT on blockchain
    const mintResult = await tryCatch(
      contract.mintNFTAsync(
        address,
        metadataURI,
        patchedNFTData.royaltyFeeInBasisPoints,
        BigInt(patchedNFTData.priceInWei),
        mintingFee
      )
    );

    if (mintResult.error) {
      return mintResult;
    }

    const tokenId = mintResult.data.tokenId;
    devLog("Token Minted Successfully: ", tokenId);

    // Prepare data for database
    const nftDataWithCid: PatchedNFT & { tokenId: number; cid: string; metadataCid: string } = {
      ...patchedNFTData,
      tokenId: tokenId,
      cid: fileCid,
      metadataCid: metadataUploadResult.data.cid,
    };

    devLog({
      tokenId: nftDataWithCid.tokenId,
      tokenIdType: typeof nftDataWithCid.tokenId,
      priceInWei: nftDataWithCid.priceInWei,
      priceInWeiType: typeof nftDataWithCid.priceInWei,
    });

    devLog(
      "NFT Payload:",
      JSON.stringify(
        nftDataWithCid,
        (_key, value) => (typeof value === "bigint" ? value.toString() : value),
        2 // pretty print
      )
    );

    // Save to database
    return await saveToDatabase(nftDataWithCid);
  } catch (error) {
    return {
      data: null,
      error: new Error(`NFT minting failed: ${error}`),
    };
  }
}

export function patchNFTData(nftDataDto: CreateNFTDataReturnType): PatchedNFT {
  if (!nftDataDto.royaltyFeeInBasisPoints) {
    nftDataDto.royaltyFeeInBasisPoints = convertPercentToBasisPoints(nftDataDto.royaltyFee);
  }

  if (!nftDataDto.priceInWei) {
    nftDataDto.priceInWei = toWei(nftDataDto.price).toString();
  }

  return nftDataDto as PatchedNFT;
}
