"use client";

import React, { useEffect, useReducer, useState } from "react";
import { Button } from "@/components/shadcn-ui/button";
import { Card, CardContent } from "@/components/shadcn-ui/card";
import { Input } from "@/components/shadcn-ui/input";
import { Textarea } from "@/components/shadcn-ui/textarea";
import { Label } from "@/components/shadcn-ui/label";
import {
  uploadFormReducer,
  initialUploadFormState,
  UploadFormState,
  UploadFormAction,
} from "@/lib/reducers/upload-form-reducer";
import { useSignedUpload } from "@/hooks/use-signed-upload";
import { devLog } from "@/utils/logging";
import DisplayUploadStatus from "./_components/upload-status";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
import { toast } from "sonner";
import NextImage from "@/components/next-image";
import { CircleAlert } from "lucide-react";

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

type BooleanFields = BooleanKeys<UploadFormState>;

export default function Upload() {
  const { uploadWithSignature, isConnected, isPending, status } = useSignedUpload();
  const [{ title, description, royaltyFee, price, tags, listForSale }, dispatch] = useReducer(
    uploadFormReducer,
    initialUploadFormState
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [tagList, setTagList] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [royaltyError, setRoyaltyError] = useState<string | null>(null);

  useEffect(() => {
    dispatch({ type: "SET_FIELD", field: "listForSale", value: true });
  }, []);

  useEffect(() => {
    if (!status) return;
    setError(null);
  }, [status]);

  useEffect(() => {
    if (error) {
      toast.error("Error", {
        description: error,
        className: "border border-red-500 bg-red-50 text-red-600",
        icon: <CircleAlert className="stroke-red-500" />,
        duration: 5000,
      });
    }
  }, [error]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const supportedTypes = ["image/", "video/", "audio/"];
      const isSupported = supportedTypes.some(type => file.type.startsWith(type));

      if (!isSupported) {
        setError("Unsupported file type. Please select an image, video, or audio file.");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange =
    <K extends keyof UploadFormState>(field: K) =>
    (
      e: K extends "listForSale"
        ? React.ChangeEvent<HTMLInputElement>
        : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const value =
        field === "listForSale" ? (e.target as HTMLInputElement).checked : e.target.value;

      dispatch({ type: "SET_FIELD", field, value } as UploadFormAction);
      setError(null);
    };

  const handleRoyaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch({ type: "SET_FIELD", field: "royaltyFee", value: e.target.value });

    const numericValue = parseFloat(value);
    if (numericValue > 10) {
      setRoyaltyError("Royalty fee cannot exceed 10%.");
    } else if (numericValue < 0) {
      setRoyaltyError("Royalty fee cannot be less than 0%.");
    } else {
      setRoyaltyError(null);
    }
  };

  const handleCheckboxChange =
    <K extends BooleanFields>(field: K) =>
    (checked: UploadFormState[K]) => {
      dispatch({ type: "SET_FIELD", field, value: checked });
      setError(null);
      devLog("Checked: ", checked);
    };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/,$/, "");
      if (trimmed && !tagList.includes(trimmed)) {
        setTagList(prev => [...prev, trimmed]);
        setTagInput("");

        dispatch({ type: "SET_FIELD", field: "tags", value: [...tagList, trimmed].join(",") });
      }
    } else if (e.key === "Backspace" && tagInput === "") {
      setTagList(prev => prev.slice(0, -1));
      dispatch({ type: "SET_FIELD", field: "tags", value: tagList.slice(0, -1).join(",") });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    if (!title || !description || !royaltyFee || !price) {
      setError("Please fill in all fields before uploading.");
      return;
    }

    const numericRoyalty = parseFloat(royaltyFee);
    if (numericRoyalty > 10) {
      setError("Royalty fee cannot exceed 10%.");
      return;
    }

    if (!isConnected) {
      setError("Please Connect to your wallet.");
      return;
    }

    const nftDto = {
      title,
      description,
      royaltyFee: numericRoyalty,
      price: Number(price),
      tags: tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== ""),
      isForSale: listForSale,
    };

    devLog("Uploading file with data:", nftDto);

    const uploadResult = await uploadWithSignature(selectedFile, nftDto);

    devLog(uploadResult);

    setSelectedFile(null);
    setPreviewUrl(null);

    dispatch({ type: "RESET" });
    setError(null);
    setRoyaltyError(null);
    setTagInput("");
    setTagList([]);
    toast.message("Success!", {
      description: "NFT uploaded successfully",
      duration: 5000,
    });
  };

  return (
    <div className="flex flex-col bg-gray-50">
      <main className="flex flex-1 justify-center min-h-[90vh] p-4">
        <Card className="w-full max-w-2xl shadow-lg h-fit sm:my-8 my-0">
          <CardContent className="flex flex-col gap-4 p-6">
            <h2 className="text-2xl font-bold text-center">Upload NFT</h2>

            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-4">
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Choose File
                  </label>
                </Button>

                {selectedFile && (
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                )}
              </div>

              <input
                id="file-upload"
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {previewUrl && (
              <div className="shadow relative aspect-video rounded-lg p-4">
                {selectedFile?.type.startsWith("image/") ? (
                  <NextImage src={previewUrl} alt="Preview" />
                ) : selectedFile?.type.startsWith("video/") ? (
                  <video src={previewUrl} controls className="w-full rounded-lg shadow" />
                ) : selectedFile?.type.startsWith("audio/") ? (
                  <audio src={previewUrl} controls className="w-full" />
                ) : null}
              </div>
            )}

            {/* Title */}
            <div className="w-full">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter NFT title"
                value={title}
                onChange={handleChange("title")}
              />
            </div>

            {/* Description */}
            <div className="w-full">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your NFT"
                value={description}
                onChange={handleChange("description")}
              />
            </div>

            {/* Royalty fee */}
            <div className="w-full">
              <Label htmlFor="royalty">Royalty Fee (%)</Label>
              <Input
                id="royalty"
                type="number"
                placeholder="5"
                value={royaltyFee}
                onChange={handleRoyaltyChange}
              />
              {royaltyError && <p className="text-red-500 text-sm mt-1">{royaltyError}</p>}
            </div>

            {/* Price */}
            <div className="w-full">
              <Label htmlFor="price">Price (ETH)</Label>
              <Input
                id="price"
                type="number"
                step="0.05"
                placeholder="0.05"
                value={price}
                onChange={handleChange("price")}
              />
            </div>

            {/* Tags */}
            <div className="w-full">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <div className="flex flex-wrap items-center gap-2 border rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                {tagList.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                <input
                  id="tags"
                  className="flex-grow outline-none text-sm min-w-[100px]"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add tag..."
                />
              </div>
            </div>

            <div className="hidden items-center gap-2 mt-2">
              <Label htmlFor="listForSale">List Media for Sale: </Label>
              <Checkbox
                name="listForSale"
                checked={listForSale}
                onCheckedChange={handleCheckboxChange("listForSale")}
                className="shadow-md border border-gray-300 hover:bg-gray-100 hover:ring-2 hover:ring-gray-500"
              />
            </div>

            {/* {error && (
              <div className="text-red-500 w-fit self-center border border-red-500 bg-red-50 p-2 rounded-lg text-sm">
                <p className="text-center font-bold">Error</p>
                <p className="text-center">{error}</p>
              </div>
            )} */}

            {status && <DisplayUploadStatus status={status} />}

            <Button onClick={handleUpload} disabled={isPending} className="w-full mt-2">
              Mint Your NFT
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
