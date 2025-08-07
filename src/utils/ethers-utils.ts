import { NFTMetadata } from "@/types/media";
import { ethers, keccak256, toUtf8Bytes } from "ethers";

export function toWei(etherAmount: number | string): bigint {
  return BigInt(ethers.parseEther(etherAmount.toString()).toString());
}

export function fromWei(weiAmount: bigint | string): string {
  return ethers.formatEther(weiAmount.toString());
}

export function parsePriceInWei(value: unknown): bigint {
  if (typeof value === "bigint") return value;

  if (typeof value === "string") {
    return BigInt(value);
  }

  if (typeof value === "object" && value !== null && isBigIntSerializedObject(value)) {
    return BigInt(value.value);
  }

  throw new Error("Invalid priceInWei value: " + JSON.stringify(value));
}

function isBigIntSerializedObject(obj: unknown): obj is { $type: "BigInt"; value: string } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "$type" in obj &&
    "value" in obj &&
    (obj as Record<string, unknown>)["$type"] === "BigInt" &&
    typeof (obj as Record<string, unknown>)["value"] === "string"
  );
}

export function createMetadataHash(metadata: NFTMetadata): string {
  const canonicalJson = JSON.stringify(sortObject(metadata));
  const hash = keccak256(toUtf8Bytes(canonicalJson));
  return hash;
}

function sortObject(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortObject((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}

// export function formatEther(wei: string) {
//   const eth = Number(wei) / Math.pow(10, 18);
//   return eth.toFixed(4);
// }
