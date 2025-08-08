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

  const existingPermissionResult = await getAccessPermission(tokenId, buyerAddress);

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

export async function buyNFTAction(params: {
  tokenId: number;
  fromAddress: string;
  toAddress: string;
  transactionHash: string;
}): Promise<Result<MediaTransfer>> {
  const { tokenId, fromAddress, toAddress, transactionHash } = params;

  const result = await tryCatch(
    prisma.$transaction(async tx => {
      await tx.mediaNFT.update({
        where: { tokenId },
        data: {
          ownerAddress: toAddress,
        },
      });

      return await tx.mediaTransfer.create({
        data: {
          tokenId,
          fromAddress,
          toAddress,
          transactionHash,
        },
      });
    })
  );

  return result;
}

export async function getAccessPermission(
  tokenId: number,
  address: string
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

export async function checkAccessPermission(tokenId: number, address?: string): Promise<boolean> {
  if (!address) {
    console.warn(
      "[WARNING] No 'address' parameter was passed. 'checkAccessPermission' returning 'false' by default."
    );
    return false;
  }
  const result = await getAccessPermission(tokenId, address);
  return result.data !== null;
}

export async function checkIsOwner(tokenId: number, address?: string): Promise<boolean> {
  if (!address) {
    console.warn(
      "[WARNING] No 'address' parameter was passed. 'checkIsOwner' returning 'false' by default."
    );
    return false;
  }

  const result = await tryCatch(
    prisma.mediaNFT.findFirst({
      where: { tokenId, ownerAddress: address },
    })
  );

  if (result.error) {
    console.error(result.error);
  }

  return result.data !== null;
}
