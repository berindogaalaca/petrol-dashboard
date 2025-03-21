import { endpoints } from "@/utils/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IResult } from "@/types";
import { UploadFile } from "@/types/file";
import axios from "axios";

export const useFile = () => {
  return useQuery<UploadFile[]>({
    queryKey: ["sales-data"],
    queryFn: async () => {
      const { data } = await axios.get<UploadFile[]>(endpoints.getData);
      return data;
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file: UploadFile) => {
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
