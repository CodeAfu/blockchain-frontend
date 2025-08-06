"use client";

import React from "react";
import FilterPanel from "./filter-panel";
import MarketplaceGrid from "./marketplace-grid";
import { MarketplaceProvider } from "@/contexts/marketplace-context";

export default function MarketplaceLayout() {
  return (
    <MarketplaceProvider>
      <FilterPanel />
      <MarketplaceGrid />
    </MarketplaceProvider>
  );
}
