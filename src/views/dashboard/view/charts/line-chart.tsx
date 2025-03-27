"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { toast } from "sonner";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { SalesRecord } from "@/types/sales";

interface StatisticsCardLineProps {
  todayData: SalesRecord[] | null;
  yesterdayData: SalesRecord[] | null;
}

export function StaticsCardLine({
  todayData,
  yesterdayData,
}: StatisticsCardLineProps) {
  const totalSalesToday = useMemo(() => {
    if (!todayData || todayData.length === 0) return 0;

    return todayData
      .filter((record) => record.paymentLocation !== "DAILY")
      .reduce((total, record) => total + record.grossAmount, 0);
  }, [todayData]);

  const totalSalesYesterday = useMemo(() => {
    if (!yesterdayData || yesterdayData.length === 0) return 0;

    return yesterdayData
      .filter((record) => record.paymentLocation !== "DAILY")
      .reduce((total, record) => total + record.grossAmount, 0);
  }, [yesterdayData]);

  const salesPercentageChange = useMemo(() => {
    if (!totalSalesYesterday) return totalSalesToday > 0 ? 100 : 0;
    return parseFloat(
      (
        ((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) *
        100
      ).toFixed(2)
    );
  }, [totalSalesToday, totalSalesYesterday]);

  const calculateProfit = (amount: number) => amount * 0.15;

  const totalProfitToday = useMemo(() => {
    if (!todayData || todayData.length === 0) return 0;

    return todayData
      .filter((record) => record.paymentLocation !== "DAILY")
      .reduce(
        (total, record) => total + calculateProfit(record.grossAmount),
        0
      );
  }, [todayData]);

  const totalProfitYesterday = useMemo(() => {
    if (!yesterdayData || yesterdayData.length === 0) return 0;

    return yesterdayData
      .filter((record) => record.paymentLocation !== "DAILY")
      .reduce(
        (total, record) => total + calculateProfit(record.grossAmount),
        0
      );
  }, [yesterdayData]);

  const profitPercentageChange = useMemo(() => {
    if (!totalProfitYesterday) return totalProfitToday > 0 ? 100 : 0;
    return parseFloat(
      (
        ((totalProfitToday - totalProfitYesterday) / totalProfitYesterday) *
        100
      ).toFixed(2)
    );
  }, [totalProfitToday, totalProfitYesterday]);

  const salesChartData = useMemo(() => {
    if (!todayData || todayData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Sales",
            data: [],
            borderColor: "rgba(34, 197, 94, 1)",
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      };
    }

    const transactionData = todayData.filter(
      (record) => record.paymentLocation !== "DAILY"
    );

    const hourlyData = new Array(24).fill(0);

    transactionData.forEach((record) => {
      const [hours, minutes] = record.time.split(":").map(Number);
      hourlyData[hours] += record.grossAmount;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Sales",
          data: hourlyData,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  }, [todayData]);

  const profitChartData = useMemo(() => {
    if (!todayData || todayData.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Profit",
            data: [],
            borderColor: "rgba(99, 102, 241, 1)",
            backgroundColor: "rgba(99, 102, 241, 0.2)",
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      };
    }

    const transactionData = todayData.filter(
      (record) => record.paymentLocation !== "DAILY"
    );

    const hourlyProfit = new Array(24).fill(0);

    transactionData.forEach((record) => {
      const [hours, minutes] = record.time.split(":").map(Number);
      hourlyProfit[hours] += calculateProfit(record.grossAmount);
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Profit",
          data: hourlyProfit,
          borderColor: "rgba(99, 102, 241, 1)",
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  }, [todayData]);

  const detectMalfunctions = (records: SalesRecord[]) => {
    const malfunctions = records.filter((record) => {
      const isFuel = ["Benzin 95", "Motorin", "LPG"].includes(
        record.productDescription
      );
      const hasPumpIssue = isFuel && !record.fuelPumpNumber;

      const hasQuantityIssue = record.quantity <= 0;
      const hasPriceIssue = record.unitPrice <= 0 || record.grossAmount <= 0;

      return hasPumpIssue || hasQuantityIssue || hasPriceIssue;
    });

    return malfunctions;
  };

  const todayMalfunctions = useMemo(() => {
    if (!todayData || todayData.length === 0) return [];
    return detectMalfunctions(todayData);
  }, [todayData]);

  const yesterdayMalfunctions = useMemo(() => {
    if (!yesterdayData || yesterdayData.length === 0) return [];
    return detectMalfunctions(yesterdayData);
  }, [yesterdayData]);

  const malfunctionPercentageChange = useMemo(() => {
    if (yesterdayMalfunctions.length === 0) {
      return todayMalfunctions.length > 0 ? 100 : 0;
    }
    return parseFloat(
      (
        ((todayMalfunctions.length - yesterdayMalfunctions.length) /
          yesterdayMalfunctions.length) *
        100
      ).toFixed(2)
    );
  }, [todayMalfunctions, yesterdayMalfunctions]);

  const malfunctionChartData = useMemo(() => {
    if (!todayMalfunctions || todayMalfunctions.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: "Malfunctions",
            data: [],
            borderColor: "rgba(239, 68, 68, 1)",
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      };
    }

    const hourlyMalfunctions = new Array(24).fill(0);

    todayMalfunctions.forEach((record) => {
      const [hours] = record.time.split(":").map(Number);
      hourlyMalfunctions[hours]++;
    });

    return {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [
        {
          label: "Malfunctions",
          data: hourlyMalfunctions,
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    };
  }, [todayMalfunctions]);

  const handleSeeAllMalfunctions = () => {
    toast.info(
      `Showing all ${todayMalfunctions.length} malfunctions for today`,
      {
        description: "This functionality will be implemented in the future.",
        duration: 3000,
      }
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4 py-4">
      <StatisticsCard
        title="Total Sales Today"
        value={totalSalesToday}
        percentageChange={salesPercentageChange}
        color={salesPercentageChange >= 0 ? "blue" : "orange"}
        chartData={salesChartData}
      />
      <StatisticsCard
        title="Total Profit Today"
        value={totalProfitToday}
        percentageChange={profitPercentageChange}
        color={profitPercentageChange >= 0 ? "green" : "orange"}
        chartData={profitChartData}
      />
      <StatisticsCard
        title="Malfunctions Today"
        value={todayMalfunctions.length}
        percentageChange={malfunctionPercentageChange}
        color="orange"
        chartData={malfunctionChartData}
        showSeeAll={true}
        onSeeAllClick={handleSeeAllMalfunctions}
      />
    </div>
  );
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
    borderWidth?: number;
  }[];
}

interface StatCardProps {
  title: string;
  value: number;
  percentageChange: number;
  chartData: ChartData;
  color?: "blue" | "green" | "purple" | "orange";
  showSeeAll?: boolean;
  onSeeAllClick?: () => void;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      display: false,
    },
  },
  elements: {
    point: {
      radius: 0,
    },
  },
};

export function StatisticsCard({
  title,
  value,
  percentageChange,
  chartData,
  color = "blue",
  showSeeAll = false,
  onSeeAllClick,
}: StatCardProps) {
  const colorVariants = {
    blue: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    green:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    purple:
      "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950",
    orange:
      "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950",
  };

  return (
    <Card className="h-full border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Statistics</div>
          {showSeeAll && (
            <Button
              onClick={onSeeAllClick}
              className="text-xs text-gray-500 bg-gray-100 hover:text-white hover:bg-gray-900 font-medium rounded-full px-4 py-0 "
            >
              See All
            </Button>
          )}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-start justify-between">
          <div>
            <div className="text-2xl font-bold">${value.toLocaleString()}</div>
            <div
              className={cn(
                "flex items-center text-sm",
                percentageChange > 0 ? "text-green-600" : "text-red-600"
              )}
            >
              <span>
                {percentageChange > 0 ? "+" : ""}
                {percentageChange}%
              </span>
            </div>
          </div>
          <div className="h-16 lg:w-1/2 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
