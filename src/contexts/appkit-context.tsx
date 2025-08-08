"use client";

import {
  useAppKit,
  useAppKitAccount,
  useAppKitNetworkCore,
  useAppKitProvider,
  useDisconnect,
  type Provider,
} from "@reown/appkit/react";
import { BrowserProvider } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { formatEther } from "viem";

interface AppKitConextProps {
  address: string | undefined;
  isConnected: boolean;
  balance: number;
  handleConnect: () => void;
  handleDisconnect: () => void;
}

const AppKitContext = createContext<AppKitConextProps | undefined>(undefined);

export function AppkitContextProvider({ children }: { children: React.ReactNode }) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { chainId } = useAppKitNetworkCore();
  const [balance, setBalance] = useState<number>(0);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (!isConnected) return;
    handleGetBalance();
  }, [isConnected]);

  // Detect account changes and update balance
  useEffect(() => {
    if (!walletProvider || typeof walletProvider.on !== "function") return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        handleGetBalance(accounts[0]);
      }
    };

    walletProvider.on("accountsChanged", handleAccountsChanged);

    return () => {
      walletProvider.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [walletProvider]);

  const handleGetBalance = async (overrideAddress?: string) => {
    const addr = overrideAddress || address;
    if (!walletProvider || !addr) return;

    const provider = new BrowserProvider(walletProvider, chainId);
    const rawBalance = await provider.getBalance(addr);
    const eth = parseFloat(formatEther(rawBalance));
    setBalance(Math.round(eth * 1e4) / 1e4);
  };

  const handleConnect = () => {
    open({
      view: "Connect",
      namespace: "eip155",
    });
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <AppKitContext.Provider
      value={{ address, isConnected, balance, handleConnect, handleDisconnect }}
    >
      {children}
    </AppKitContext.Provider>
  );
}

export function useAppKitContext() {
  const context = useContext(AppKitContext);
  if (!context) {
    throw new Error("useAppKitContext must be used within a AppKitContext Provider.");
  }
  return context;
}
