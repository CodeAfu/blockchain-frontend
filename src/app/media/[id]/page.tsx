import React from "react";
import MediaSection from "./_components/media-section";

export default async function AccessMedia({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-[90vh] flex flex-col">
      <MediaSection mediaId={id} />
    </main>
  );
}
