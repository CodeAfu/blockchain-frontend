"use client";

import React from "react";
import FilterPanel from "./filter-panel";
import MarketplaceGrid from "./marketplace-grid";

export default function MarketplaceLayout() {
  return (
    <React.Fragment>
      <FilterPanel />
      <MarketplaceGrid />
    </React.Fragment>
  );
}
