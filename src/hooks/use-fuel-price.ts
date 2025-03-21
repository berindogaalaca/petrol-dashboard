import { FuelPrices, FuelResponse } from "@/types/fuel";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchFuelPrices = async (): Promise<FuelPrices> => {
  const { data } = await axios.get<FuelResponse>(
    "https://hasanadiguzel.com.tr/api/akaryakit/sehir=IZMIR"
  );

  let dieselPrice = 0;
  let e5Price = 0;
  let e10Price = 0;

  if (data && data.data) {
    const firstKey = Object.keys(data.data)[0];
    const priceData = data.data[firstKey];

    if (priceData) {
      if (priceData["Motorin(Eurodiesel)_TL/lt"]) {
        dieselPrice = parseFloat(
          priceData["Motorin(Eurodiesel)_TL/lt"].replace(",", ".")
        );
      }

      if (priceData["Kursunsuz_95(Excellium95)_TL/lt"]) {
        e5Price = parseFloat(
          priceData["Kursunsuz_95(Excellium95)_TL/lt"].replace(",", ".")
        );
      }

      if (priceData["Motorin(Excellium_Eurodiesel)_TL/lt"]) {
        e10Price = parseFloat(
          priceData["Motorin(Excellium_Eurodiesel)_TL/lt"].replace(",", ".")
        );
      } else {
        e10Price = e5Price * 0.98;
      }
    }
  }
  return {
    diesel: dieselPrice,
    adBlue: 50,
    superE5: e5Price,
    superE10: e10Price,
    cleaning: 35,
    lastUpdated: new Date(),
  };
};

export const useFuelPrices = () => {
  return useQuery<FuelPrices>({
    queryKey: ["fuel-prices"],
    queryFn: fetchFuelPrices,
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    placeholderData: {
      diesel: 0,
      adBlue: 50,
      superE5: 0,
      superE10: 0,
      cleaning: 35,
      lastUpdated: new Date(),
    },
  });
};
