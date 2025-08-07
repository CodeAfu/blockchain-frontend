import { Badge } from "@/components/shadcn-ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs";
import { formatAddress } from "@/utils/media-utils";
import { MediaAccessLog, MediaTransfer } from "@prisma/client";
import { ArrowRightLeft, Eye } from "lucide-react";
import React from "react";
import { formatEther } from "viem";

interface ActivityLogsCardProps {
  accessLogs: MediaAccessLog[];
  transfers: MediaTransfer[];
}

export default function ActivityLogsCard({ accessLogs, transfers }: ActivityLogsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>Recent access and transfer activity for this media</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Access Logs ({accessLogs.length})
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Transfers ({transfers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access" className="mt-4">
            {accessLogs.length > 0 ? (
              <div className="space-y-3">
                {accessLogs.slice(0, 5).map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="text-sm font-medium">{formatAddress(log.buyerAddress)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.accessedAt).toLocaleString()}
                        </p>
                        {log.transactionHash && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatAddress(log.transactionHash)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">{formatEther(log.amountPaid)} ETH</Badge>
                  </div>
                ))}
                {accessLogs.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    And {accessLogs.length - 5} more access logs...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No access logs yet</p>
            )}
          </TabsContent>

          <TabsContent value="transfers" className="mt-4">
            {transfers.length > 0 ? (
              <div className="space-y-3">
                {transfers.slice(0, 5).map(transfer => (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <div className="text-sm">
                          <span className="font-medium">{formatAddress(transfer.fromAddress)}</span>
                          <ArrowRightLeft className="w-3 h-3 inline mx-2" />
                          <span className="font-medium">{formatAddress(transfer.toAddress)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transfer.transferredAt).toLocaleString()}
                        </p>
                        {transfer.transactionHash && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatAddress(transfer.transactionHash)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">Transfer</Badge>
                  </div>
                ))}
                {transfers.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    And {transfers.length - 5} more transfers...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No transfers yet</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
