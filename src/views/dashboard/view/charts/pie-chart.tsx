"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Label } from "@/components/ui/label";
import { UploadFile } from "@/types/file";
import { FuelPrices } from "@/types/fuel";

interface PieChartProps {
  data?: UploadFile[];
}

interface MonthlyDataMap {
  [key: string]: FuelPrices;
}

interface ChartItem {
  id: string;
  name: string;
  value: number;
  color: string;
  percentage: number;
  change: {
    value: number;
    isPositive: boolean;
  };
}

const COLORS: Record<string, string> = {
  diesel: "#473bf5",
  adBlue: "#385af6",
  superE5: "#97a9f7",
  superE10: "#c8d1f9",
  cleaning: "#e5e9f9",
};

const FUEL_NAMES: Record<string, string> = {
  diesel: "Diesel",
  adBlue: "Ad Blue",
  superE5: "Super E5",
  superE10: "Super E10",
  cleaning: "Cleaning",
};

const generateMonthlyData = ({ data }: PieChartProps): MonthlyDataMap => {
  if (!data || data.length === 0) {
    return {};
  }

  const monthlyData: MonthlyDataMap = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    const monthKey = `${month}-${year}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month,
        year,
        diesel: 0,
        adBlue: 0,
        superE5: 0,
        superE10: 0,
        cleaning: 0,
      };
    }

    monthlyData[monthKey].diesel += Number(item.diesel) || 0;
    monthlyData[monthKey].adBlue += Number(item.adBlue) || 0;
    monthlyData[monthKey].superE5 += Number(item.superE5) || 0;
    monthlyData[monthKey].superE10 += Number(item.superE10) || 0;
    monthlyData[monthKey].cleaning += Number(item.cleaning) || 0;
  });

  return monthlyData;
};

const prepareChartData = (monthData: FuelPrices): ChartItem[] => {
  const chartData: ChartItem[] = [];
  const fuelTypes = [
    "diesel",
    "adBlue",
    "superE5",
    "superE10",
    "cleaning",
  ] as const;

  fuelTypes.forEach((type) => {
    const value = monthData[type];

    if (value > 0) {
      chartData.push({
        id: type,
        name: FUEL_NAMES[type],
        value: value,
        color: COLORS[type],
        percentage: 0,
        change: {
          value: 0,
          isPositive: true,
        },
      });
    }
  });

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return chartData.map((item) => ({
    ...item,
    percentage: parseFloat(((item.value / total) * 100).toFixed(2)),
    change: {
      value: 0,
      isPositive: true,
    },
  }));
};

const getAvailableMonths = (data: UploadFile[] | undefined): string[] => {
  if (!data || data.length === 0) {
    return [];
  }
  const months = new Set<string>();

  data.forEach((item) => {
    const date = new Date(item.date);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    months.add(`${month}-${year}`);
  });

  return Array.from(months).sort((a, b) => {
    const [monthA, yearA] = a.split("-");
    const [monthB, yearB] = b.split("-");

    if (yearA !== yearB) {
      return Number(yearB) - Number(yearA);
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames.indexOf(monthB) - monthNames.indexOf(monthA);
  });
};

export default function PieChartView({ data }: PieChartProps) {
  const monthlyData = React.useMemo(
    () => generateMonthlyData({ data }),
    [data]
  );
  const availableMonths = React.useMemo(() => getAvailableMonths(data), [data]);

  const latestMonth = availableMonths.length > 0 ? availableMonths[0] : "";

  const [selectedMonthYear, setSelectedMonthYear] =
    React.useState<string>(latestMonth);

  React.useEffect(() => {
    if (availableMonths.length > 0) {
      setSelectedMonthYear(availableMonths[0]);
    }
  }, [availableMonths]);

  const salesData = React.useMemo(() => {
    if (!selectedMonthYear || !monthlyData[selectedMonthYear]) return [];
    return prepareChartData(monthlyData[selectedMonthYear]);
  }, [selectedMonthYear, monthlyData]);

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-sm border rounded-xl bg-white p-0 pt-2">
      <CardHeader className="mt-2">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-2">
          <div className="space-y-1">
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius="90%"
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {salesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
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
                  <Label className="text-gray-400 text-sm ml-2">
                    {item.percentage.toFixed(2)}%
                  </Label>
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
