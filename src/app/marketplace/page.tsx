import React from "react";
import MarketplaceLayout from "./_components/marketplace-layout";

export default async function MarketplacePage() {
  return (
    <main className="min-h-screen mt-8 px-4 flex flex-col gap-4">
      <MarketplaceLayout />
    </main>
  );
}
