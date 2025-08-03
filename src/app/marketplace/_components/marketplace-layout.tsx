"use client";

import React from "react";
import FilterPanel from "./filter-panel";
import MarketplaceGrid from "./marketplace-grid";

export default function MarketplaceLayout() {
  return (
    <React.Fragment>
      <div className="space-y-4">
        <FilterPanel />
        <MarketplaceGrid />
      </div>
    </React.Fragment>
  );
}
