"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useUploadSalesFile, useUploadTankFile } from "@/hooks/use-file";
import { useRouter } from "next/navigation";
import FileUploadCard from "@/components/upload/file-upload-card";

export default function UploadPage() {
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [tankFile, setTankFile] = useState<File | null>(null);

  const uploadSalesFileMutation = useUploadSalesFile();
  const uploadTankFileMutation = useUploadTankFile();

  const router = useRouter();

  const handleSalesFileSelection = (selectedFile: File | null) => {
    setSalesFile(selectedFile);
  };

  const handleTankFileSelection = (selectedFile: File | null) => {
    setTankFile(selectedFile);
  };

  const handleSalesUpload = async () => {
    if (!salesFile) return;

    try {
      const result = await uploadSalesFileMutation.mutateAsync(
        salesFile as unknown as File
      );

      if (result.success) {
        toast.success("Sales data uploaded successfully", {
          duration: 1000,
          onAutoClose: () => {
            router.refresh();
            router.push("/");
          },
        });

        setSalesFile(null);
        const fileInput = document.getElementById(
          "file-upload-upload-sales-data"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error("An error occurred while uploading the sales file", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Sales file upload error:", error);
      toast.error("An error occurred while uploading the sales file", {
        duration: 3000,
      });
    }
  };

  const handleTankUpload = async () => {
    if (!tankFile) return;

    try {
      const result = await uploadTankFileMutation.mutateAsync(tankFile);

      if (result.success) {
        toast.success("Tank filling data uploaded successfully", {
          duration: 1000,
          onAutoClose: () => {
            router.refresh();
            router.push("/");
          },
        });

        setTankFile(null);
        const fileInput = document.getElementById(
          "file-upload-load-tank-filling-data"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        toast.error("An error occurred while uploading the tank file", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Tank file upload error:", error);
      toast.error("An error occurred while uploading the tank file", {
        duration: 3000,
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-evenly items-center w-full">
      <FileUploadCard
        className="w-full max-w-md shadow-lg"
        title="Upload Sales Data"
        description="Select your sales data file in CSV format to upload to the system."
        acceptedFileTypes=".csv"
        onFileChange={handleSalesFileSelection}
        onUpload={handleSalesUpload}
        isLoading={uploadSalesFileMutation.isPending}
        showSampleDownload={true}
        sampleFilePath="/samples/sample_sales_data.csv"
      />

      <FileUploadCard
        className="w-full max-w-md shadow-lg mt-4 lg:mt-0"
        title="Load Tank Filling Data"
        description="Select your tank filling data file in CSV format to upload to the system."
        acceptedFileTypes=".csv"
        onFileChange={handleTankFileSelection}
        onUpload={handleTankUpload}
        isLoading={uploadTankFileMutation.isPending}
        showSampleDownload={true}
        sampleFilePath="/samples/sample_tank_filling_data.csv"
      />
    </div>
  );
}
