"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SalesRecord } from "@/types/sales";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data?: SalesRecord[];
}

const categories = [
  { name: "All Categories", value: "all", percentage: null, color: "#3713ff" },
  { name: "Diesel", value: "diesel", percentage: 0, color: "#8100ff" },
  { name: "Ad Blue", value: "adBlue", percentage: 0, color: "#3713ff" },
  { name: "Super E5", value: "superE5", percentage: 0, color: "#d7b6fc" },
  { name: "Super E10", value: "superE10", percentage: 0, color: "#8196fc" },
  { name: "Cleaning", value: "cleaning", percentage: 0, color: "#99aafc" },
];

export function BarChartView({ data }: BarChartProps) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [activeCategories, setActiveCategories] = useState<string[]>(["all"]);

  const parseDate = (dateStr: string | Date): Date => {
    if (dateStr instanceof Date) return dateStr;

    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }

    return new Date(dateStr);
  };

  const getCategoryFromProduct = (description: string): string | null => {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes("motorin")) {
      return "diesel";
    } else if (lowerDesc.includes("adblue") || lowerDesc.includes("ad blue")) {
      return "adBlue";
    } else if (lowerDesc.includes("95") || lowerDesc.includes("benzin")) {
      return "superE5";
    } else if (lowerDesc.includes("lpg")) {
      return "superE10";
    } else if (lowerDesc.includes("yağ") || lowerDesc.includes("sandviç")) {
      return "cleaning";
    }

    return null;
  };

  const updatedCategories = useMemo(() => {
    if (!data || data.length === 0) return categories;

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const calculateSalesByCategory = (startDate: Date, endDate: Date) => {
      const filteredData = data.filter((record) => {
        if (record.paymentLocation === "DAILY") return false;

        const recordDate = parseDate(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const result: Record<string, number> = {
        diesel: 0,
        adBlue: 0,
        superE5: 0,
        superE10: 0,
        cleaning: 0,
      };

      filteredData.forEach((record) => {
        const category = getCategoryFromProduct(record.productDescription);
        if (category && result[category] !== undefined) {
          result[category] += record.grossAmount;
        }
      });

      return result;
    };

    const currentPeriodSales = calculateSalesByCategory(oneMonthAgo, now);

    const twoMonthsAgo = new Date(oneMonthAgo);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);
    const previousPeriodSales = calculateSalesByCategory(
      twoMonthsAgo,
      oneMonthAgo
    );

    return categories.map((category) => {
      if (category.value === "all") return category;

      const currentValue = currentPeriodSales[category.value] || 0;
      const previousValue = previousPeriodSales[category.value] || 0;

      let percentageChange = 0;
      if (previousValue > 0) {
        percentageChange =
          ((currentValue - previousValue) / previousValue) * 100;
      } else if (currentValue > 0) {
        percentageChange = 100;
      }

      return {
        ...category,
        percentage: Math.round(percentageChange),
      };
    });
  }, [data]);

  const toggleCategory = (category: string) => {
    if (category === "all") {
      setActiveCategories(["all"]);
    } else {
      if (activeCategories.includes("all")) {
        setActiveCategories([category]);
      } else if (activeCategories.includes(category)) {
        const newCategories = activeCategories.filter((c) => c !== category);
        setActiveCategories(newCategories.length ? newCategories : ["all"]);
      } else {
        setActiveCategories([...activeCategories, category]);
      }
    }
  };

  const getVisibleSeries = () => {
    if (activeCategories.includes("all")) {
      return updatedCategories.slice(1).map((c) => c.value);
    }
    return activeCategories;
  };

  const getChartData = () => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    const salesData = data.filter(
      (record) => record.paymentLocation !== "DAILY"
    );

    let processedData: Record<string, number[]> = {};
    let labels: string[] = [];

    if (activeTab === "daily") {
      labels = [
        "00-03",
        "03-06",
        "06-09",
        "09-12",
        "12-15",
        "15-18",
        "18-21",
        "21-24",
      ];
      processedData = processDataByHour(salesData);
    } else if (activeTab === "weekly") {
      labels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
      processedData = processDataByDay(salesData);
    } else {
      labels = ["1st Week", "2nd Week", "3rd Week", "4th Week"];
      processedData = processDataByWeek(salesData);
    }

    const datasets = getVisibleSeries().map((category) => {
      const categoryInfo = updatedCategories.find((c) => c.value === category);
      return {
        label: categoryInfo?.name || category,
        data: processedData[category] || Array(labels.length).fill(0),
        backgroundColor: categoryInfo?.color || "#3713ff",
        borderRadius: 4,
        barThickness: 10,
      };
    });

    return { labels, datasets };
  };

  const processDataByHour = (salesData: SalesRecord[]) => {
    const result: Record<string, number[]> = {};

    updatedCategories.slice(1).forEach((category) => {
      result[category.value] = Array(8).fill(0);
    });

    salesData.forEach((record) => {
      const time = record.time;
      const hour = parseInt(time.split(":")[0], 10);
      const hourGroup = Math.floor(hour / 3);

      const category = getCategoryFromProduct(record.productDescription);
      if (category && result[category]) {
        result[category][hourGroup] += record.grossAmount;
      }
    });

    return result;
  };

  const processDataByDay = (salesData: SalesRecord[]) => {
    const result: Record<string, number[]> = {};

    updatedCategories.slice(1).forEach((category) => {
      result[category.value] = Array(7).fill(0);
    });

    salesData.forEach((record) => {
      const date = parseDate(record.date);
      let dayOfWeek = date.getDay();

      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      const category = getCategoryFromProduct(record.productDescription);
      if (category && result[category]) {
        result[category][dayOfWeek] += record.grossAmount;
      }
    });

    return result;
  };

  const processDataByWeek = (salesData: SalesRecord[]) => {
    const result: Record<string, number[]> = {};

    updatedCategories.slice(1).forEach((category) => {
      result[category.value] = Array(4).fill(0);
    });

    salesData.forEach((record) => {
      const date = parseDate(record.date);
      const day = date.getDate();

      const weekIndex = Math.min(Math.floor((day - 1) / 7), 3);

      const category = getCategoryFromProduct(record.productDescription);
      if (category && result[category]) {
        result[category][weekIndex] += record.grossAmount;
      }
    });

    return result;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
                notation: "compact",
                compactDisplay: "short",
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
          color: "#f0f0f0",
          drawBorder: false,
        },
        ticks: {
          callback: function (value: any) {
            return value === 0 ? "0" : value / 1000 + "k";
          },
        },
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center pb-2 border-b">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Statistics
          <h2 className="text-2xl font-bold mt-1 text-black">
            Total summary of sales
          </h2>
        </CardTitle>
        <Tabs
          defaultValue="weekly"
          value={activeTab}
          onValueChange={setActiveTab}
          className="ml-auto mr-80"
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="daily" className="text-sm">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-sm">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-sm">
              Monthly
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex flex-col lg:flex-row gap-8 pt-6">
        <div className="w-full lg:w-3/4 h-[400px] border-r">
          <Bar data={getChartData()} options={chartOptions} />
        </div>
        <div className="w-full lg:w-1/4 space-y-4">
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 cursor-pointer",
              activeCategories.includes("all")
                ? "bg-indigo-100 border-indigo-300"
                : "bg-white"
            )}
            onClick={() => toggleCategory("all")}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center",
                activeCategories.includes("all")
                  ? "bg-indigo-600"
                  : "border border-indigo-300"
              )}
            >
              {activeCategories.includes("all") && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <Label className="font-medium">All Categories</Label>
          </div>

          {updatedCategories.slice(1).map((category) => (
            <div
              key={category.value}
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleCategory(category.value)}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center",
                    activeCategories.includes(category.value)
                      ? "border-2 border-indigo-600"
                      : "border border-gray-300"
                  )}
                >
                  {activeCategories.includes(category.value) && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                </div>
                <Label>{category.name}</Label>
              </div>
              <Label
                className={`${
                  category.percentage != null && category.percentage >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {category.percentage != null
                  ? category.percentage >= 0
                    ? "+"
                    : ""
                  : ""}
                {category.percentage != null
                  ? Math.abs(category.percentage)
                  : 0}
                %
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
