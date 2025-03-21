"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFuelPrices } from "@/hooks/use-fuel-price";
import { useSalesComparison } from "@/hooks/use-sales-comparison";
import { cn } from "@/lib/utils";
import { UploadFile } from "@/types/file";
import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface StatisticsCardLineProps {
  todayData: UploadFile | null;
  yesterdayData: UploadFile | null;
}

export function StaticsCardLine({
  todayData,
  yesterdayData,
}: StatisticsCardLineProps) {
  const {
    todayTotalValue,
    percentageChange,
    isIncrease,
    todayTotalProfit,
    profitPercentageChange,
    isProfitIncrease,
    salesData,
    profitData,
    isLoading,
  } = useSalesComparison(todayData, yesterdayData);

  const formattedSalesChange = useMemo(() => {
    return {
      value: `${percentageChange.toFixed(2)}%`,
      positive: isIncrease,
    };
  }, [percentageChange, isIncrease]);

  const formattedProfitChange = useMemo(() => {
    return {
      value: `${profitPercentageChange.toFixed(2)}%`,
      positive: isProfitIncrease,
    };
  }, [profitPercentageChange, isProfitIncrease]);

  const malfunctionsData = useMemo(() => {
    if (!todayData || !yesterdayData) return [];

    return [
      { value: todayData.malfunctions },
      { value: yesterdayData.malfunctions },
    ];
  }, [todayData]);

  const malfunctionsChange = useMemo(() => {
    const todayMalfunctions = todayData?.malfunctions || 0;
    const yesterdayMalfunctions = yesterdayData?.malfunctions || 0;

    const difference = todayMalfunctions - yesterdayMalfunctions;
    const percentageChange =
      yesterdayMalfunctions > 0
        ? (difference / yesterdayMalfunctions) * 100
        : 0;

    const isPositive = difference <= 0;

    return {
      value: `${Math.abs(percentageChange).toFixed(2)}%`,
      positive: isPositive,
    };
  }, [todayData, yesterdayData]);

  const handleSeeAllMalfunctions = () => {
    toast.info("Fault details will be added soon!", {
      description: "This feature is currently under development.",
      duration: 3000,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-4 py-4">
      <StatisticsCard
        title="Total Sales Today"
        value={todayData ? `$${todayTotalValue}` : "$0"}
        change={formattedSalesChange}
        data={salesData}
        color="#3b82f6"
      />
      <StatisticsCard
        title="Total Profit Today"
        value={todayData ? `$${todayTotalProfit}` : "$0"}
        change={formattedProfitChange}
        data={profitData}
        color="#22c55e"
      />
      <StatisticsCard
        title="Malfunctions Today"
        value={todayData ? todayData.malfunctions.toString() : "0"}
        change={malfunctionsChange}
        data={malfunctionsData}
        color="#ef4444"
        showSeeAll={true}
        onSeeAllClick={handleSeeAllMalfunctions}
      />
    </div>
  );
}

interface StatisticsCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    positive: boolean;
  };
  data?: Array<{ value: number }>;
  color: string;
  showSeeAll?: boolean;
  onSeeAllClick?: () => void;
}

export function StatisticsCard({
  title,
  value,
  change,
  data,
  color,
  showSeeAll = false,
  onSeeAllClick,
}: StatisticsCardProps) {
  return (
    <Card className="h-full border-none shadow-md">
      <CardHeader className="flex lg:flex-row items-start lg:items-center flex-col justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Statistics
          <div className="text-xl font-bold text-black">{title}</div>
        </CardTitle>
        {showSeeAll && (
          <Button
            onClick={onSeeAllClick}
            className="text-xs text-gray-500 bg-gray-100 hover:text-white hover:bg-gray-900 font-medium rounded-full px-4 py-0 "
          >
            See All
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col ">
          <div className="text-3xl font-bold">{value}</div>
          <div
            className={cn(
              "text-xs font-medium",
              change.positive ? "text-green-500" : "text-rose-500"
            )}
          >
            {change.positive ? "+" : "-"}
            {change.value}
          </div>
        </div>
        <div className="h-16 w-1/2">
          <ResponsiveContainer width="80%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
