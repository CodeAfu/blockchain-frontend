"use client";

import React from "react";
import { MediaNFT } from "@prisma/client";
import Modal from "@/components/modal";
import PreviewImage from "@/components/preview-image";
import { Button } from "@/components/shadcn-ui/button";
import { useMarketplaceContext } from "@/contexts/marketplace-context";
import Link from "next/link";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: MediaNFT;
  imageUrl?: string;
  onPurchase: () => void;
  isLoading?: boolean;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  nft,
  imageUrl,
  onPurchase,
  isLoading = false,
}: PurchaseModalProps) {
  const { address } = useMarketplaceContext();
  const estimatedGasFee = 0.005;
  const totalPrice = parseFloat(nft.price.toString()) + estimatedGasFee;

  const isOwner = !!address && address === nft.ownerAddress;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Purchase NFT"
      closeOnOverlayClick={!isLoading}
    >
      <div className="p-6">
        {/* NFT Preview */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Image */}
          <div className="flex-shrink-0 w-full md:w-48">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              {imageUrl ? (
                <PreviewImage
                  src={imageUrl}
                  alt={nft.title}
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No preview
                </div>
              )}
            </div>
          </div>

          {/* Right side - Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{nft.title}</h3>
              <p className="text-sm text-muted-foreground">
                by {nft.ownerAddress.slice(0, 6)}...{nft.ownerAddress.slice(-4)}
              </p>
            </div>

            {nft.description && (
              <div>
                <h4 className="text-sm font-medium mb-1 text-foreground">Description</h4>
                <p className="text-sm text-muted-foreground">{nft.description}</p>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Price</span>
                <span className="text-lg font-semibold text-foreground">{nft.price} ETH</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Gas Fee (est.)</span>
                <span className="text-sm text-foreground">~{estimatedGasFee} ETH</span>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(3)} ETH</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          {isOwner ? (
            <Button variant="secondary" className="flex-1" asChild>
              <Link href={`/media/${nft.id}`}>View</Link>
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" onClick={() => {}}>
              Get Access
            </Button>
          )}
          <Button onClick={onPurchase} className="flex-1" disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Purchase"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
