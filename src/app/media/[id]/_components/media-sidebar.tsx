import { Badge } from "@/components/shadcn-ui/badge";
import { Button } from "@/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { formatAddress } from "@/utils/media-utils";
import { MediaNFT } from "@prisma/client";
import { Separator } from "@radix-ui/react-separator";
import { Calendar, DollarSign, Tag, User } from "lucide-react";
import React from "react";

interface MediaSidebarProps {
  media: MediaNFT;
}

export default function MediaSidebar({ media }: MediaSidebarProps) {
  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{media.title}</CardTitle>
          <CardDescription>Token ID: #{media.tokenId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {media.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {media.description}
              </p>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Creator
              </span>
              <Badge variant="outline">{formatAddress(media.creatorAddress)}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Owner
              </span>
              <Badge variant={media.creatorAddress === media.ownerAddress ? "default" : "outline"}>
                {formatAddress(media.ownerAddress)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Royalty
              </span>
              <Badge variant="outline">{Number(media.royaltyFeeInBasisPoints) / 100}%</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created
              </span>
              <span className="text-sm text-muted-foreground">
                {new Date(media.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Separator />

          {media.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {media.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {media.isForSale && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">For Sale</CardTitle>
            <CardDescription>This NFT is currently listed on the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {media.price} ETH
            </div>
            <Button className="w-full mt-4" variant="outline">
              View on Marketplace
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Content CID</span>
            <span className="font-mono text-xs">{media.cid.slice(0, 12)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Metadata CID</span>
            <span className="font-mono text-xs">{media.metadataCid.slice(0, 12)}...</span>
          </div>
          {media.domain && (
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Domain</span>
              <span className="break-all text-sm text-right">{media.domain}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </React.Fragment>
  );
}
