"use client";

import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/shadcn-ui/alert";
import { Button } from "@/components/shadcn-ui/button";
import { useRouter } from "next/navigation";

export default function NotAllowedFilter() {
  const router = useRouter();

  return (
    <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-xl flex items-center justify-center">
      <Alert className="max-w-md py-8 w-full text-center">
        <AlertTitle className="text-xl">Access Denied</AlertTitle>
        <AlertDescription className="mb-4">
          You are not allowed to view this media item.
        </AlertDescription>
        <Button onClick={() => router.push("/marketplace")}>Return to Marketplace</Button>
      </Alert>
    </div>
  );
}
