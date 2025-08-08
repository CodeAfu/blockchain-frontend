"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MediaNFT, MediaAccessLog } from "@prisma/client";
import Modal from "@/components/modal";
import PreviewImage from "@/components/preview-image";
import { Button } from "@/components/shadcn-ui/button";
import { Badge } from "@/components/shadcn-ui/badge";
import Link from "next/link";
import { Eye, Lock, Unlock, DollarSign } from "lucide-react";
import { Separator } from "@/components/shadcn-ui/separator";
import { MEDIA_ACCESS_FEE_ETH } from "@/lib/consts";
import { useMarketplaceContext } from "@/contexts/marketplace-context";
import { toast } from "sonner";
import { checkAccessPermission } from "@/actions/market-actions";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: MediaNFT;
  imageUrl?: string;
  accessLogs?: MediaAccessLog[];
}

interface AuthorizationState {
  isAuthorized: boolean;
  reason: "owner" | "previous_access" | "unauthorized";
  message: string;
}

export default function PurchaseModal({
  isOpen,
  onClose,
  nft,
  imageUrl,
  accessLogs = [],
}: PurchaseModalProps) {
  const {
    address,
    buy,
    access,
    clearAccessCompleted,
    clearBuyCompleted,
    buyLogState,
    accessLogState,
    isWritePending,
    isConfirming,
    // isConfirmed,
    // lastTxHash,
    pendingTx,
    txError,
  } = useMarketplaceContext();
  const [hasAccess, setHasAccess] = useState(false);

  // Authorization logic
  const authorizationState: AuthorizationState = useMemo(() => {
    if (!address) {
      return {
        isAuthorized: false,
        reason: "unauthorized",
        message: "Connect wallet to check access",
      };
    }

    // Check if user is the owner
    if (address.toLowerCase() === nft.ownerAddress.toLowerCase()) {
      return {
        isAuthorized: true,
        reason: "owner",
        message: "You own this NFT",
      };
    }

    if (hasAccess) {
      return {
        isAuthorized: true,
        reason: "previous_access",
        message: "You have access to this content",
      };
    }

    return {
      isAuthorized: false,
      reason: "unauthorized",
      message: "Purchase access to view content",
    };
  }, [address, hasAccess, nft.ownerAddress]);

  // Transaction success message
  // useEffect(() => {
  //   if (pendingTx === "buyNFT" && isConfirmed) {
  //     toast.success("Transaction successful!");
  //   }
  // }, [isConfirmed, pendingTx]);

  // Media access success message
  // useEffect(() => {
  //   if (pendingTx === "accessMedia" && isConfirmed) {
  //     const fetchAccess = async () => {
  //       if (!address) return;
  //       const result = await checkAccessPermission(Number(nft.tokenId), address);
  //       setHasAccess(result);
  //     };
  //     fetchAccess();
  //   }
  // }, [isConfirmed, pendingTx, address, nft.tokenId]);

  // Fetch initial hasAccess and isOwner
  useEffect(() => {
    if (!address) return;

    if (address.toLowerCase() === nft.ownerAddress.toLowerCase()) {
      setHasAccess(true);
      return;
    }

    const fetchAccess = async () => {
      const result = await checkAccessPermission(Number(nft.tokenId), address);
      setHasAccess(result);
    };
    fetchAccess();
  }, [address, nft.ownerAddress, nft.tokenId]);

  // Handle successful access state management
  useEffect(() => {
    if (accessLogState.completed && accessLogState.data && !accessLogState.error) {
      const fetchAccess = async () => {
        const result = await checkAccessPermission(Number(nft.tokenId), address);
        setHasAccess(result);
      };

      fetchAccess();

      // IMPORTANT
      clearAccessCompleted();
      console.log("Fetch Access provided and cleared states");
    }
  }, [accessLogState.completed, accessLogState.data, accessLogState.error, address, nft.tokenId]);

  // Handle successful buy state management
  useEffect(() => {
    if (buyLogState.completed && buyLogState.data && !buyLogState.error) {
      // IMPORTANT
      clearBuyCompleted();
      console.log("Fetch Access provided and cleared states");
    }
  }, [
    buyLogState.completed,
    buyLogState.data,
    buyLogState.error,
    address,
    nft.tokenId,
    clearBuyCompleted,
  ]);

  // Display contract errors
  useEffect(() => {
    if (txError) {
      toast.error("Error", { description: `${txError}` });
    }
  }, [txError]);

  const handlePurchase = async () => {
    if (!nft) return;
    if (!address) {
      toast.error("Please connect to an Ethereum wallet");
      return;
    }

    try {
      await buy(nft);
    } catch (error) {
      toast("Error", {
        description: `Error while buying NFT ${nft.tokenId}`,
      });
      console.error("Failed to buy NFT:", error);
    }
  };

  const handleGetAccess = async () => {
    if (!address) {
      toast("Error", {
        description: "Please connect to an Ethereum wallet",
      });
      return;
    }

    try {
      await access(nft);
    } catch (error) {
      toast("Error", {
        description: `Error while attempting to access NFT ${nft.tokenId}`,
      });
      console.error("Failed to purchase access:", error);
    }
  };

  const estimatedGasFee = 0.005;
  const totalPrice = parseFloat(nft.price.toString()) + estimatedGasFee;
  const accessFee = MEDIA_ACCESS_FEE_ETH;

  const isOwner = authorizationState.reason === "owner";
  const isAccessPending = pendingTx === "accessMedia" && (isWritePending || isConfirming);
  const isPurchasePending = pendingTx === "buyNFT" && (isWritePending || isConfirming);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="NFT Details"
      closeOnOverlayClick={!isAccessPending || !isPurchasePending || !isConfirming}
      className="relative"
    >
      <div className="p-6">
        {/* Authorization Status Badge */}
        <div className="mb-4 flex justify-center">
          {["previous_access", "owner"].includes(authorizationState.reason) ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
            >
              <Unlock className="w-3 h-3 mr-1" />
              {authorizationState.reason === "owner" ? "Owner Access" : "Premium Access"}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800"
            >
              <Lock className="w-3 h-3 mr-1" />
              Content Locked
            </Badge>
          )}
        </div>

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
                <p className="text-sm text-muted-foreground line-clamp-3">{nft.description}</p>
              </div>
            )}

            {/* Access Status */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Content Access</span>
              </div>
              <p className="text-xs text-muted-foreground">{authorizationState.message}</p>
              {!hasAccess && (
                <p className="text-xs text-muted-foreground mt-1">
                  Access fee: {accessFee} ETH (one-time payment)
                </p>
              )}
            </div>

            {/* Pricing Section */}
            {nft.isForSale && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Purchase NFT</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="text-lg font-semibold text-foreground">{nft.price} ETH</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gas Fee (est.)</span>
                    <span className="text-sm text-foreground">~{estimatedGasFee} ETH</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>{totalPrice.toFixed(3)} ETH</span>
                  </div>
                </div>
              </>
            )}

            {/* Access Logs Preview */}
            {accessLogs.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2 text-foreground">Recent Access</h4>
                  <div className="space-y-1">
                    {accessLogs.slice(0, 2).map(log => (
                      <div key={log.id} className="flex items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className="text-muted-foreground">
                          {log.buyerAddress.slice(0, 6)}...{log.buyerAddress.slice(-4)}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(log.accessedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {accessLogs.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{accessLogs.length - 2} more access logs
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isAccessPending}>
            Cancel
          </Button>

          {/* Access/View Button */}
          {authorizationState.reason === "previous_access" ||
          authorizationState.reason === "owner" ? (
            <Button variant="secondary" className="flex-1" asChild>
              <Link href={`/media/${nft.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Content
              </Link>
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleGetAccess}
              disabled={!address || isAccessPending}
            >
              {isAccessPending ? (
                "Processing..."
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Get Access ({accessFee} ETH)
                </>
              )}
            </Button>
          )}

          {/* Purchase NFT Button - Only show if for sale and user doesn't own it */}
          {nft.isForSale && !isOwner && (
            <Button onClick={handlePurchase} className="flex-1" disabled={isPurchasePending}>
              {isPurchasePending ? "Processing..." : "Buy NFT"}
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            {!hasAccess
              ? "Purchase access to view the full content permanently"
              : hasAccess && nft.isForSale
                ? "You have content access. Purchase NFT to become the owner"
                : "You have full access to this content"}
          </p>
          {buyLogState.error && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Failed to purchase NFT: {buyLogState.error.message || "Unknown error"}
            </p>
          )}

          {accessLogState.error && (
            <p className="text-xs text-red-500 mt-2 text-center">
              Failed to get access: {accessLogState.error.message || "Unknown error"}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
