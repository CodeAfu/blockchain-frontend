"use client";

import React from "react";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import Container from "@/components/container";
import NextImage from "@/components/next-image";

const images: { url: string }[] = [{ url: "/assets/insight.png" }];
const videos: { url: string }[] = [];
const audios: { url: string }[] = [];

const renderImages = () =>
  images.length > 0 ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative">
      {images.map((img, index) => (
        <div
          key={index}
          className="border flex justify-center items-center relative aspect-square rounded bg-white shadow"
        >
          <NextImage
            src={img.url}
            alt={`Image ${index + 1}`}
            className="object-contain rounded p-4"
          />
        </div>
      ))}
    </div>
  ) : (
    <Card>
      <CardContent className="p-4 text-gray-500">No images found.</CardContent>
    </Card>
  );

const renderVideos = () =>
  videos.length > 0 ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative">
      {videos.map((vid, index) => (
        <div key={index} className="border aspect-square rounded p-2 bg-white shadow">
          <video src={vid.url} controls className="w-full rounded" />
        </div>
      ))}
    </div>
  ) : (
    <Card>
      <CardContent className="p-4 text-gray-500">No videos found.</CardContent>
    </Card>
  );

const renderAudios = () =>
  audios.length > 0 ? (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative">
      {audios.map((aud, index) => (
        <div key={index} className="border aspect-square rounded p-2 bg-white shadow">
          <audio src={aud.url} controls className="w-full" />
        </div>
      ))}
    </div>
  ) : (
    <Card>
      <CardContent className="p-4 text-gray-500">No audio found.</CardContent>
    </Card>
  );

export default function MyMediaPage() {
  // const account = useAccount();
  // const address = account.address;
  // const data = getMyMedia(address as string)

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <Container>
        <main className="flex flex-col flex-1 px-4 sm:px-12 py-8">
          {/* Images */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Images</h3>
            {renderImages()}
          </div>

          {/* Videos */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Videos</h3>
            {renderVideos()}
          </div>

          {/* Audio */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Audio</h3>
            {renderAudios()}
          </div>
        </main>
      </Container>

      <Footer />
    </div>
  );
}
