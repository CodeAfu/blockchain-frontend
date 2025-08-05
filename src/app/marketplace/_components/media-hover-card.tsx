"use client";

import React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/shadcn-ui/hover-card";
import { Avatar, AvatarFallback } from "@/components/shadcn-ui/avatar";
import { Badge } from "@/components/shadcn-ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MediaNFT } from "@prisma/client";
import { Button } from "@/components/shadcn-ui/button";

interface MediaHoverCardProps {
  media: MediaNFT;
}

export default function MediaHoverCard({ media }: MediaHoverCardProps) {
  const fileTypeLabel = media.fileType;
  const sizeMB = media.fileSize
    ? `${(Number(media.fileSize) / 1_000_000).toFixed(2)} MB`
    : "Unknown";
  const createdAgo = formatDistanceToNow(new Date(media.createdAt), { addSuffix: true });

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link" className="p-0 sm:text-lg truncate text-black">
          {media.title}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-96 p-4 space-y-2 z-50">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{media.title[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-sm font-semibold">{media.title}</h4>
            <p className="text-xs text-muted-foreground">
              Token #{media.tokenId} • Created {createdAgo}
            </p>
          </div>
        </div>

        {media.description && <p className="text-sm line-clamp-3">{media.description}</p>}

        <div className="grid grid-cols-3 text-sm gap-y-1">
          <span className="text-muted-foreground">Creator</span>
          <span className="col-span-2 break-all">{media.creatorAddress}</span>

          <span className="text-muted-foreground">Owner</span>
          <span className="col-span-2 break-all">{media.ownerAddress}</span>

          <span className="text-muted-foreground">File Type</span>
          <span className="col-span-2">{fileTypeLabel}</span>

          <span className="text-muted-foreground">Size</span>
          <span className="col-span-2">{sizeMB}</span>

          <span className="text-muted-foreground">Price (ETH)</span>
          <span className="col-span-2">{media.price}</span>

          <span className="text-muted-foreground">Royalty</span>
          <span className="col-span-2">{Number(media.royaltyFeeInBasisPoints) / 100}%</span>

          <span className="text-muted-foreground">For Sale</span>
          <span className="col-span-2">{media.isForSale ? "Yes" : "No"}</span>
        </div>

        {media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {media.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
