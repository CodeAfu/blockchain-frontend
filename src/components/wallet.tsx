"use client";

import React from "react";
import { Button } from "./shadcn-ui/button";
import { useAppKitContext } from "@/contexts/appkit-context";

export default function Wallet() {
  const { isConnected, address, handleConnect, balance, handleDisconnect } = useAppKitContext();

  return (
    <div>
      {isConnected ? (
        <div className="sm:flex hidden flex-row-reverse items-center justify-center gap-3">
          <Button onClick={handleDisconnect}>Disconnect</Button>
          <div className="md:flex hidden flex-col tracking-tight text-sm items-end justify-end">
            <span className="text-gray-500 text-xs">{address}</span>
            <span>{balance.toLocaleString()} ETH</span>
          </div>
        </div>
      ) : (
        <Button className="sm:flex hidden" onClick={handleConnect}>
          Connect
        </Button>
      )}
    </div>
  );
}
