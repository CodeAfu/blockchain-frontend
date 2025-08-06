"use client";

import React from "react";
import Modal from "@/components/modal";
import NextImage from "@/components/next-image";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  alt?: string;
}

export default function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  alt,
}: ImagePreviewModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title={title}
      closeOnOverlayClick
    >
      <div className="relative w-full min-h-[80vh]">
        <NextImage 
          src={imageUrl} 
          alt={alt || title} 
          className="object-contain p-4" 
          sizes="100vw" 
        />
      </div>
    </Modal>
  );
}