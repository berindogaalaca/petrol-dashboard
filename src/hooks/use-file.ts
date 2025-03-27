import { endpoints } from "@/utils/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IResult } from "@/types";
import axios from "axios";
import { SalesRecord } from "@/types/sales";
import { TankFillingRecord } from "@/types/tank";

export const useFile = () => {
  return useQuery<SalesRecord[]>({
    queryKey: ["sales-data"],
    queryFn: async () => {
      const { data } = await axios.get<SalesRecord[]>(endpoints.getData);
      return data;
    },
  });
};

export const useUploadSalesFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const { data } = await axios.post<IResult<any>>(
          endpoints.uploadData,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const errorMessage =
            error.response.data?.data?.message ||
            error.response.data?.message ||
            "Dosya yüklenirken bir hata oluştu";
          throw new Error(errorMessage);
        }
        throw error;
      }
    },
  });
};

export const useUploadTankFile = () => {
  return useMutation({
    mutationFn: async (file: TankFillingRecord) => {
      const formData = new FormData();
      formData.append("file", file as unknown as Blob);

      const { data } = await axios.post<IResult<any>>(
        endpoints.uploadData,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
  });
};
