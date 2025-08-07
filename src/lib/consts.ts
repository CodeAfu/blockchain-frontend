import MediaRights from "@/contracts/MediaRights.json";
import hardhatContractAddress from "@/contracts/contract-address.json"; // local hardhat contract

const contractAddress =
  process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS || hardhatContractAddress.mediaRights;

export const MEDIA_CONTRACT_ADDRESS = contractAddress;
export const MEDIA_CONTRACT_ABI = MediaRights.abi;
export const MEDIA_CONTRACT_BYTECODE = MediaRights.bytecode;
export const MEDIA_ACCESS_FEE = 0.0001; // ETH
