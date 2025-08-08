"use client";

import React from "react";
import { State } from "wagmi";
import { WagmiContextProvider } from "@/contexts/web3-context";
import { AppkitContextProvider } from "@/contexts/appkit-context";

interface ProvidersProps {
  children: React.ReactNode;
  initialState: State | undefined;
}

export default function Providers({ children, initialState }: Readonly<ProvidersProps>) {
  return (
    <WagmiContextProvider initialState={initialState}>
      <AppkitContextProvider>{children}</AppkitContextProvider>
    </WagmiContextProvider>
  );
}
