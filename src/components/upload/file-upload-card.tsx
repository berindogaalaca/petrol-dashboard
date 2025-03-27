"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, Download } from "lucide-react";

interface FileUploadCardProps {
  title?: string;
  description?: string;
  acceptedFileTypes?: string;
  buttonText?: string;
  dragDropText?: string;
  isLoading?: boolean;
  onFileChange?: (file: File | null) => void;
  onUpload?: (file: File | null) => void;
  loadingText?: string;
  uploadButtonText?: string;
  className?: string;
  sampleFilePath?: string;
  showSampleDownload?: boolean;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  title = "File Upload",
  description = "Select the file you want to upload to the system and click the upload button.",
  acceptedFileTypes = ".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg,.csv",
  buttonText = "Click to select a file",
  dragDropText = "or drag and drop file here",
  isLoading = false,
  onFileChange,
  onUpload,
  loadingText = "Uploading...",
  uploadButtonText = "Upload File",
  className = "w-full max-w-md shadow-lg",
  sampleFilePath = "",
  showSampleDownload = false,
}) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (onFileChange) {
        onFileChange(selectedFile);
      }
    }
  };

  const handleUpload = () => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const uniqueId = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>

        {showSampleDownload && sampleFilePath && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.open(sampleFilePath, "_blank")}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Sample File
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Input
            type="file"
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            className="hidden"
            id={`file-upload-${uniqueId}`}
          />
          <Label
            htmlFor={`file-upload-${uniqueId}`}
            className="flex flex-col items-center cursor-pointer"
          >
            <File className="w-10 h-10 text-gray-400 mb-2" />
            <Label className="text-sm font-medium text-primary">
              {buttonText}
            </Label>
            <Label className="text-xs text-gray-500 mt-1">{dragDropText}</Label>
          </Label>
        </div>

        {file && (
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center">
              <File className="w-6 h-6 text-primary mr-2" />
              <div className="overflow-hidden">
                <Label className="text-sm font-medium truncate">
                  {file.name}
                </Label>
                <Label className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Label>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleUpload}
          className="w-full"
          disabled={!file || isLoading}
          size="lg"
        >
          {isLoading ? (
            <Label className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {loadingText}
            </Label>
          ) : (
            <Label className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              {uploadButtonText}
            </Label>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUploadCard;
