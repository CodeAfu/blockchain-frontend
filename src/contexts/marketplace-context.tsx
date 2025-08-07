"use client";

import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useMarketplace } from "@/hooks/use-media-contract";
import { LogState, NFTMediaItem } from "@/types/media";
import { Address, Hash } from "viem";
import { MediaAccessedEvent, MediaSoldEvent } from "@/types/contract";
import { useTrade } from "@/hooks/use-trade";
import { MediaAccessLog, MediaNFT, MediaTransfer } from "@prisma/client";

interface MarketplaceContextValue {
  address: Address | undefined;

  tokenIds: bigint[];
  marketplaceCache: Map<bigint, NFTMediaItem>;

  buy: (nft: MediaNFT) => Promise<void>;
  access: (nft: MediaNFT) => Promise<void>;

  buyLogState: LogState<MediaTransfer>;
  accessLogState: LogState<MediaAccessLog>;

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
    writeError,
    refetchTokenCount,
    useWatchMediaSold,
    useWatchMediaAccessed,
  } = useMarketplace();
  const {
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
  } = useTrade();

  useWatchMediaSold(() => {
    refetchTokenCount();
  });

  useWatchMediaAccessed(() => {});

  const value: MarketplaceContextValue = useMemo(
    () => ({
      address,
      tokenIds,
      marketplaceCache,

      listForSale,
      unlistFromSale,
      buyNFT,
      accessMedia,

      buy,
      access,

      buyLogState,
      accessLogState,

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
      address,
      tokenIds,
      marketplaceCache,
      listForSale,
      unlistFromSale,
      buyNFT,
      accessMedia,
      buy,
      access,
      buyLogState,
      accessLogState,
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
