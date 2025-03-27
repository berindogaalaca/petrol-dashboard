"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SalesRecord } from "@/types/sales";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data?: SalesRecord[];
}

const FUEL_TYPES = {
  DIESEL: "Diesel",
  AD_BLUE: "Ad Blue",
  SUPER_E5: "Super E5",
  SUPER_E10: "Super E10",
  CLEANING: "Cleaning",
};

const COLORS = {
  [FUEL_TYPES.DIESEL]: "#473bf5",
  [FUEL_TYPES.AD_BLUE]: "#385af6",
  [FUEL_TYPES.SUPER_E5]: "#97a9f7",
  [FUEL_TYPES.SUPER_E10]: "#c8d1f9",
  [FUEL_TYPES.CLEANING]: "#e5e9f9",
};

export default function PieChartView({ data }: PieChartProps) {
  const availableMonths = useMemo(() => {
    if (!data || data.length === 0) return [];

    const months = new Set<string>();
    data.forEach((record) => {
      const date = new Date(record.date);
      const monthYear = `${date.toLocaleString("default", {
        month: "long",
      })} ${date.getFullYear()}`;
      months.add(monthYear);
    });

    return Array.from(months).sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");

      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);

      return dateB.getTime() - dateA.getTime();
    });
  }, [data]);

  const [selectedMonthYear, setSelectedMonthYear] = useState<string>(
    availableMonths.length > 0 ? availableMonths[0] : ""
  );

  const salesData = useMemo(() => {
    if (!data || data.length === 0 || !selectedMonthYear) return [];

    const [selectedMonth, selectedYear] = selectedMonthYear.split(" ");
    const filterDate = new Date(`${selectedMonth} 1, ${selectedYear}`);

    const filteredData = data.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === filterDate.getMonth() &&
        recordDate.getFullYear() === filterDate.getFullYear() &&
        record.paymentLocation !== "DAILY"
      );
    });

    const salesByFuelType: Record<string, number> = {
      [FUEL_TYPES.DIESEL]: 0,
      [FUEL_TYPES.AD_BLUE]: 0,
      [FUEL_TYPES.SUPER_E5]: 0,
      [FUEL_TYPES.SUPER_E10]: 0,
      [FUEL_TYPES.CLEANING]: 0,
    };

    filteredData.forEach((record) => {
      const productType = getFuelType(record.productDescription);
      if (productType) {
        salesByFuelType[productType] += record.grossAmount;
      }
    });

    const totalSales = Object.values(salesByFuelType).reduce(
      (sum, value) => sum + value,
      0
    );

    const prevMonthDate = new Date(filterDate);
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

    const prevMonthFilteredData = data.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getMonth() === prevMonthDate.getMonth() &&
        recordDate.getFullYear() === prevMonthDate.getFullYear() &&
        record.paymentLocation !== "DAILY"
      );
    });

    const prevSalesByFuelType: Record<string, number> = {
      [FUEL_TYPES.DIESEL]: 0,
      [FUEL_TYPES.AD_BLUE]: 0,
      [FUEL_TYPES.SUPER_E5]: 0,
      [FUEL_TYPES.SUPER_E10]: 0,
      [FUEL_TYPES.CLEANING]: 0,
    };

    prevMonthFilteredData.forEach((record) => {
      const productType = getFuelType(record.productDescription);
      if (productType) {
        prevSalesByFuelType[productType] += record.grossAmount;
      }
    });

    return Object.entries(salesByFuelType)
      .map(([fuelType, amount]) => {
        const percentage = totalSales > 0 ? (amount / totalSales) * 100 : 0;
        const prevAmount = prevSalesByFuelType[fuelType] || 0;
        let changePercentage = 0;

        if (prevAmount > 0) {
          changePercentage = ((amount - prevAmount) / prevAmount) * 100;
        } else if (amount > 0) {
          changePercentage = 100;
        }

        return {
          id: fuelType,
          name: fuelType,
          value: amount,
          color: COLORS[fuelType],
          percentage,
          change: changePercentage.toFixed(2),
          isPositive: changePercentage >= 0,
        };
      })
      .filter((item) => item.value > 0);
  }, [data, selectedMonthYear]);

  const chartData = {
    labels: salesData.map((item) => item.name),
    datasets: [
      {
        data: salesData.map((item) => item.value),
        backgroundColor: salesData.map((item) => item.color),
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = ((value / total) * 100).toFixed(2);
            return `${
              context.label
            }: ${value.toLocaleString()} TRY (${percentage}%)`;
          },
        },
      },
    },
    cutout: "0%",
    responsive: true,
    maintainAspectRatio: false,
  };

  function getFuelType(description: string): string | null {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes("diesel") || lowerDesc.includes("motorin")) {
      return FUEL_TYPES.DIESEL;
    } else if (lowerDesc.includes("ad blue") || lowerDesc.includes("adblue")) {
      return FUEL_TYPES.AD_BLUE;
    } else if (
      lowerDesc.includes("super e5") ||
      lowerDesc.includes("e5") ||
      lowerDesc.includes("benzin 95")
    ) {
      return FUEL_TYPES.SUPER_E5;
    } else if (
      lowerDesc.includes("super e10") ||
      lowerDesc.includes("e10") ||
      lowerDesc.includes("lpg")
    ) {
      return FUEL_TYPES.SUPER_E10;
    } else {
      return FUEL_TYPES.CLEANING;
    }
  }

  return (
    <Card className="w-full max-w-3xl shadow-sm border rounded-xl bg-white p-0 pt-2">
      <CardHeader className="mt-2">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-2">
          <div className="lg:space-y-1">
            <p className="text-gray-500 text-base">Statistics</p>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Total Sales by Gas Type
            </CardTitle>
          </div>
          <Select
            value={selectedMonthYear}
            onValueChange={setSelectedMonthYear}
            disabled={availableMonths.length === 0}
          >
            <SelectTrigger className="w-[160px] bg-gray-50 rounded-full mt-2 lg:mt-0">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((monthYear) => (
                <SelectItem key={monthYear} value={monthYear}>
                  {monthYear}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <div className="px-6">
        <div className="border-t my-2" />
      </div>

      {salesData.length > 0 ? (
        <CardContent className="pt-2 pb-6 px-2 sm:px-4">
          <div className="flex flex-col md:flex-row justify-evenly items-center gap-3">
            <div className="w-[140px] h-[140px] sm:w-[150px] sm:h-[150px] lg:w-[180px] lg:h-[180px] shrink-0">
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            <div className="flex flex-col w-full md:w-auto gap-1 sm:gap-2">
              {salesData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <Label className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </Label>
                  </div>
                  <div className="flex items-center gap-1">
                    <Label className="text-gray-400 text-sm">
                      {item.percentage.toFixed(2)}%
                    </Label>
                    <Label
                      className={`text-xs ${
                        item.isPositive ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      ({item.isPositive ? "+" : ""}
                      {item.change}%)
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      ) : (
        <CardContent className="py-10 text-center">
          <p className="text-gray-500">
            No data available for the selected period
          </p>
        </CardContent>
      )}
    </Card>
  );
}
