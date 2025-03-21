import { useMemo } from "react";
import { useFuelPrices } from "./use-fuel-price";
import { UploadFile } from "@/types/file";

const PROFIT_PER_LITER = 5;

export function useSalesComparison(
  todayData: UploadFile | null,
  yesterdayData: UploadFile | null
) {
  const { data: fuelPrices, isLoading: pricesLoading } = useFuelPrices();

  const comparison = useMemo(() => {
    const defaultResult = {
      todayTotalValue: 0,
      yesterdayTotalValue: 0,
      difference: 0,
      percentageChange: 0,
      isIncrease: false,
      todayTotalProfit: 0,
      yesterdayTotalProfit: 0,
      profitDifference: 0,
      salesData: [{ value: 0 }, { value: 0 }],
      profitData: [{ value: 0 }, { value: 0 }],
      profitPercentageChange: 0,
      isProfitIncrease: false,
    };

    if (!todayData || !yesterdayData || !fuelPrices || pricesLoading) {
      return defaultResult;
    }

    const todayTotalVolume =
      (todayData.diesel || 0) +
      (todayData.adBlue || 0) +
      (todayData.superE5 || 0) +
      (todayData.superE10 || 0) +
      (todayData.cleaning || 0);

    const yesterdayTotalVolume =
      (yesterdayData.diesel || 0) +
      (yesterdayData.adBlue || 0) +
      (yesterdayData.superE5 || 0) +
      (yesterdayData.superE10 || 0) +
      (yesterdayData.cleaning || 0);

    const todayTotalValue =
      (todayData.diesel || 0) * fuelPrices.diesel +
      (todayData.adBlue || 0) * fuelPrices.adBlue +
      (todayData.superE5 || 0) * fuelPrices.superE5 +
      (todayData.superE10 || 0) * fuelPrices.superE10 +
      (todayData.cleaning || 0) * fuelPrices.cleaning;

    const yesterdayTotalValue =
      (yesterdayData.diesel || 0) * fuelPrices.diesel +
      (yesterdayData.adBlue || 0) * fuelPrices.adBlue +
      (yesterdayData.superE5 || 0) * fuelPrices.superE5 +
      (yesterdayData.superE10 || 0) * fuelPrices.superE10 +
      (yesterdayData.cleaning || 0) * fuelPrices.cleaning;

    const difference = todayTotalValue - yesterdayTotalValue;
    const percentageChange =
      yesterdayTotalValue > 0 ? (difference / yesterdayTotalValue) * 100 : 0;

    const todayTotalProfit = todayTotalVolume * PROFIT_PER_LITER;
    const yesterdayTotalProfit = yesterdayTotalVolume * PROFIT_PER_LITER;

    const profitDifference = todayTotalProfit - yesterdayTotalProfit;
    const profitPercentageChange =
      yesterdayTotalProfit > 0
        ? (profitDifference / yesterdayTotalProfit) * 100
        : 0;

    const salesData = [
      { value: yesterdayTotalValue },
      { value: todayTotalValue },
    ];

    const profitData = [
      { value: yesterdayTotalProfit },
      { value: todayTotalProfit },
    ];

    return {
      todayTotalValue,
      yesterdayTotalValue,
      difference,
      percentageChange: Math.abs(percentageChange),
      isIncrease: difference > 0,
      todayTotalProfit,
      yesterdayTotalProfit,
      salesData,
      profitData,
      profitDifference,
      profitPercentageChange: Math.abs(profitPercentageChange),
      isProfitIncrease: profitDifference > 0,
    };
  }, [todayData, yesterdayData, fuelPrices, pricesLoading]);

  return {
    ...comparison,
    isLoading: pricesLoading,
  };
}
