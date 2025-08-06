"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useMarketplace } from "@/hooks/use-media-contract";
import { NFTMediaItem } from "@/types/media";
import { Hash } from "viem";
import { MediaAccessedEvent, MediaSoldEvent } from "@/types/contract";

interface MarketplaceContextValue {
  tokenIds: bigint[];
  marketplaceCache: Map<bigint, NFTMediaItem>;

  listForSale: (tokenId: bigint, price: bigint) => void;
  unlistFromSale: (tokenId: bigint) => void;
  buyNFT: (tokenId: bigint, payment: bigint) => void;
  accessMedia: (tokenId: bigint, payment: bigint) => void;

  useWatchMediaSold: (onEvent: (event: MediaSoldEvent) => void) => void;
  useWatchMediaAccessed: (onEvent: (event: MediaAccessedEvent) => void) => void;

  // Transaction state
  isWritePending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  lastTxHash?: Hash;
  pendingTx?: string | null;
  writeError?: Error | null;
  txError?: Error | null;
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const {
    tokenIds,
    marketplaceCache,
    listForSale,
    unlistFromSale,
    buyNFT,
    accessMedia,
    isWritePending,
    isConfirming,
    isConfirmed,
    lastTxHash,
    pendingTx,
    writeError,
    txError,
    refetchTokenCount,
    useWatchMediaSold,
    useWatchMediaAccessed,
  } = useMarketplace();

  // Hooking up event listeners
  useWatchMediaSold(() => {
    refetchTokenCount();
  });

  useWatchMediaAccessed(() => {
    // Optional: e.g. update access logs
  });

  const value: MarketplaceContextValue = useMemo(
    () => ({
      tokenIds,
      marketplaceCache,

      listForSale,
      unlistFromSale,
      buyNFT,
      accessMedia,

      isWritePending,
      isConfirming,
      isConfirmed,
      lastTxHash,
      pendingTx,
      writeError,
      txError,
      useWatchMediaSold,
      useWatchMediaAccessed,
    }),
    [
      tokenIds,
      marketplaceCache,
      listForSale,
      unlistFromSale,
      buyNFT,
      accessMedia,
      isWritePending,
      isConfirming,
      isConfirmed,
      lastTxHash,
      pendingTx,
      writeError,
      txError,
      useWatchMediaSold,
      useWatchMediaAccessed,
    ]
  );

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
};

export const useMarketplaceContext = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplaceContext must be used within a MarketplaceProvider");
  }
  return context;
};
