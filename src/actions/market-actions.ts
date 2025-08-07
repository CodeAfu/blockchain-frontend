"use server";

import { Result } from "@/types/result";
import { tryCatch } from "@/utils/try-catch";
import {
  MediaAccessLog,
  MediaAccessPermission,
  MediaTransfer,
  Prisma,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

export async function logAccess(params: {
  tokenId: number;
  buyerAddress: string;
  amountPaid: bigint;
  transactionHash: string;
}): Promise<Result<MediaAccessLog>> {
  const { tokenId, buyerAddress, amountPaid, transactionHash } = params;

  const existingPermissionResult = await getAccessPermission(buyerAddress, tokenId);

  if (existingPermissionResult.error) {
    console.error(existingPermissionResult.error);
  }

  if (!existingPermissionResult.error && !existingPermissionResult.data) {
    const createAccessDbResult = await tryCatch(
      prisma.mediaAccessPermission.create({
        data: {
          tokenId,
          address: buyerAddress,
        },
      })
    );

    if (
      createAccessDbResult.error instanceof Prisma.PrismaClientKnownRequestError &&
      createAccessDbResult.error.code === "P2002"
    ) {
    } else {
      console.error(createAccessDbResult.error);
    }
  }

  const logDbResult = await tryCatch(
    prisma.mediaAccessLog.create({
      data: {
        tokenId,
        buyerAddress,
        amountPaid,
        transactionHash,
      },
    })
  );

  return logDbResult;
}

export async function logPurchase(params: {
  tokenId: number;
  fromAddress: string;
  toAddress: string;
  transactionHash: string;
}): Promise<Result<MediaTransfer>> {
  const { tokenId, fromAddress, toAddress, transactionHash } = params;

  const dbResult = await tryCatch(
    prisma.mediaTransfer.create({
      data: {
        tokenId,
        fromAddress,
        toAddress,
        transactionHash,
      },
    })
  );

  return dbResult;
}

export async function getAccessPermission(
  address: string,
  tokenId: number
): Promise<Result<MediaAccessPermission | null>> {
  const dbResult = await tryCatch(
    prisma.mediaAccessPermission.findFirst({
      where: {
        tokenId,
        address,
      },
    })
  );

  if (dbResult.error) {
    console.error(dbResult.error);
    return dbResult;
  }

  return dbResult;
}

export async function checkAccessPermission(address: string, tokenId: number): Promise<boolean> {
  const result = await getAccessPermission(address, tokenId);
  return result.data !== null;
}
