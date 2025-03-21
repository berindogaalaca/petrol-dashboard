"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { useUploadFile } from "@/hooks/use-file";
import { Upload, File } from "lucide-react";
import { UploadFile } from "@/types/file";
import { Label } from "@/components/ui/label";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const uploadFileMutation = useUploadFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const result = await uploadFileMutation.mutateAsync(
        file as unknown as UploadFile
      );

      if (result.success) {
        toast.success("File uploaded successfully", {
          duration: 3000,
        });
        setFile(null);
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error("An error occurred while uploading the file", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("An error occurred while uploading the file", {
        duration: 3000,
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">File Upload</CardTitle>
        <CardDescription>
          Select the file you want to upload to the system and click the upload
          button.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <Input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg,.csv"
            className="hidden"
            id="file-upload"
          />
          <Label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <File className="w-10 h-10 text-gray-400 mb-2" />
            <Label className="text-sm font-medium text-primary">
              Click to select a file
            </Label>
            <Label className="text-xs text-gray-500 mt-1">
              or drag and drop file here
            </Label>
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
          disabled={!file || uploadFileMutation.isPending}
          size="lg"
        >
          {uploadFileMutation.isPending ? (
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
              Uploading...
            </Label>
          ) : (
            <Label className="flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </Label>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
