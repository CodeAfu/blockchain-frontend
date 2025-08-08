import MediaRights from "@/contracts/MediaRights.json";
import hardhatContractAddress from "@/contracts/contract-address.json"; // local hardhat contract

const contractAddress =
  process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS || hardhatContractAddress.mediaRights;

export const MEDIA_CONTRACT_ADDRESS = contractAddress;
export const MEDIA_CONTRACT_ABI = MediaRights.abi;
export const MEDIA_CONTRACT_BYTECODE = MediaRights.bytecode;
export const MEDIA_ACCESS_FEE_ETH = 0.0001;
export const FETCH_MEDIA_ACCESS_URI_STALE_TIME_MS = 20 * 60 * 60 * 1000; // 20 hours
export const FETCH_MEDIA_ACCESS_URI_CACHE_TIME_MS = 22 * 60 * 60 * 1000; // 22 hours
// export const MEDIA_STALE_TIME_S = 600;
