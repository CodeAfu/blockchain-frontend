import { useAccount, useSignMessage } from "wagmi";
import { NFTDto } from "@/types/media";
import { useMediaContract } from "./use-media-contract";
import { useState } from "react";
import { parseEther } from "viem";
import { uploadFile } from "@/lib/ipfs/upload";
import { createNFTData, mintNFTWithMetadata } from "@/lib/nft";

export enum UploadStatus {
  NO_WALLET = "no-wallet",
  UPLOADING = "uploading",
  UPLOAD_FAILED = "upload-failed",
  CREATING_NFT = "creating-nft",
  MINTING = "minting",
  MINT_FAILED = "mint-failed",
  SUCCESS = "success",
}

export function useSignedUpload() {
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const contract = useMediaContract();

  const isPending = status === "uploading" || status === "creating-nft" || status === "minting";

  const { data: mintingFeeData } = contract.useMintingFee();
  const mintingFee = (mintingFeeData as bigint) || parseEther("0.001");

  const uploadWithSignature = async (file: File, nftData: NFTDto) => {
    if (!isConnected || !address) {
      setStatus(UploadStatus.NO_WALLET);
      return {
        data: null,
        error: new Error("No wallet detected."),
      };
    }


    // 1. Upload file to IPFS
    setStatus(UploadStatus.UPLOADING);
    const fileUploadResult = await uploadFile(file, address, signMessageAsync);

    if (fileUploadResult.error) {
      setStatus(UploadStatus.UPLOAD_FAILED);
      return fileUploadResult;
    }

    // 2. Create NFT data
    setStatus(UploadStatus.CREATING_NFT);
    const nftDataDto = createNFTData(nftData, address, file);

    // 3. Create and mint NFT with metadata
    setStatus(UploadStatus.MINTING);
    const nftResult = await mintNFTWithMetadata(
      nftDataDto,
      address,
      contract,
      fileUploadResult.data.cid,
      mintingFee
    );


    if (nftResult.error) {
      setStatus(UploadStatus.MINT_FAILED);
      return nftResult;
    }

    setStatus(UploadStatus.SUCCESS);
    return nftResult;
  };

  return {
    uploadWithSignature,
    isPending,
    status,
    isConnected,
  };
}
