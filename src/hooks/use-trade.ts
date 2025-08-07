"use client";

import { useState, useEffect, useRef } from "react";
import { useMediaContract } from "@/hooks/use-media-contract";
import { useAccount } from "wagmi";
import { MEDIA_ACCESS_FEE } from "@/lib/consts";
import { parseEther } from "viem";
import { logAccess, logPurchase } from "@/actions/market-actions";
import { MediaAccessLog, MediaNFT, MediaTransfer } from "@prisma/client";
import { LogState } from "@/types/media";

export function useTrade() {
  const { address } = useAccount();
  const {
    buyNFT,
    accessMedia,
    pendingTx,
    lastTxHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    txError,
  } = useMediaContract();

  const [buyLogState, setBuyLogState] = useState<LogState<MediaTransfer>>({
    loading: false,
    error: null,
    data: null,
  });

  const [accessLogState, setAccessLogState] = useState<LogState<MediaAccessLog>>({
    loading: false,
    error: null,
    data: null,
  });

  const buyNFTRef = useRef<MediaNFT | null>(null);
  const accessNFTRef = useRef<MediaNFT | null>(null);

  const buy = async (nft: MediaNFT): Promise<void> => {
    setBuyLogState({ loading: true, error: null, data: null });
    buyNFTRef.current = nft;
    await buyNFT(BigInt(nft.tokenId), BigInt(nft.priceInWei));
  };

  const access = async (nft: MediaNFT): Promise<void> => {
    setAccessLogState({ loading: true, error: null, data: null });
    accessNFTRef.current = nft;
    await accessMedia(BigInt(nft.tokenId));
  };

  useEffect(() => {
    if (pendingTx === "buyNFT" && isConfirmed && lastTxHash && address && buyNFTRef.current) {
      const nft = buyNFTRef.current;
      logPurchase({
        tokenId: nft.tokenId,
        fromAddress: nft.ownerAddress,
        toAddress: address,
        transactionHash: lastTxHash,
      })
        .then(res => {
          if (res.error) {
            setBuyLogState({ loading: false, error: res.error, data: null });
          } else {
            setBuyLogState({ loading: false, error: null, data: res.data });
          }
        })
        .catch(err => {
          setBuyLogState({ loading: false, error: err, data: null });
        })
        .finally(() => {
          buyNFTRef.current = null;
        });
    }
  }, [pendingTx, isConfirmed, lastTxHash, address]);

  useEffect(() => {
    if (
      pendingTx === "accessMedia" &&
      isConfirmed &&
      lastTxHash &&
      address &&
      accessNFTRef.current
    ) {
      const nft = accessNFTRef.current;
      logAccess({
        tokenId: nft.tokenId,
        buyerAddress: address,
        amountPaid: parseEther(`${MEDIA_ACCESS_FEE}`),
        transactionHash: lastTxHash,
      })
        .then(res => {
          if (res.error) {
            setAccessLogState({ loading: false, error: res.error, data: null });
          } else {
            setAccessLogState({ loading: false, error: null, data: res.data });
          }
        })
        .catch(err => {
          setAccessLogState({ loading: false, error: err, data: null });
        })
        .finally(() => {
          accessNFTRef.current = null;
        });
    }
  }, [pendingTx, isConfirmed, lastTxHash, address]);

  return {
    address,
    buy,
    access,
    pendingTx,
    lastTxHash,
    isWritePending,
    isConfirming,
    isConfirmed,
    txError,
    buyLogState,
    accessLogState,
  };
}
