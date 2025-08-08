// components/ui/transaction-overlay.tsx
"use client";

import { useMarketplaceContext } from "@/contexts/marketplace-context";
import { Loader2 } from "lucide-react";

export default function TransactionOverlay() {
  const { isWritePending, isConfirming } = useMarketplaceContext();

  if (!isWritePending && !isConfirming) return null;
  
  return (
    <div className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-background border border-border text-foreground p-6 rounded-xl shadow-xl flex flex-col items-center gap-3">
        <Loader2 className="md:w-10 md:h-10 w-5 h-5 animate-spin text-primary" />
        <span className="md:text-md text-sm font-medium">Confirming Transaction...</span>
      </div>
    </div>
  );
}
