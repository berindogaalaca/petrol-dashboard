"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { UploadFile } from "@/types/file";
import { Label } from "@/components/ui/label";

interface BarChartProps {
  data?: UploadFile[];
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
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [updatedCategories, setUpdatedCategories] = useState(categories);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const sortedData = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sortedData.length >= 2) {
      const latestData = sortedData[0];
      const previousData = sortedData[1];

      const newCategories = [...categories];
      newCategories[1].percentage = calculatePercentageChange(
        latestData.diesel,
        previousData.diesel
      );
      newCategories[2].percentage = calculatePercentageChange(
        latestData.adBlue,
        previousData.adBlue
      );
      newCategories[3].percentage = calculatePercentageChange(
        latestData.superE5,
        previousData.superE5
      );
      newCategories[4].percentage = calculatePercentageChange(
        latestData.superE10,
        previousData.superE10
      );
      newCategories[5].percentage = calculatePercentageChange(
        latestData.cleaning,
        previousData.cleaning
      );

      setUpdatedCategories(newCategories);
    }

    const processedDailyData = processDailyData(sortedData);
    setDailyData(processedDailyData);

    const processedWeeklyData = processWeeklyData(sortedData);
    setWeeklyData(processedWeeklyData);

    const processedMonthlyData = processMonthlyData(sortedData);
    setMonthlyData(processedMonthlyData);
  }, [data]);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const processDailyData = (sortedData: UploadFile[]) => {
    const latestDay = sortedData[0];

    return [
      {
        name: "00:00",
        diesel: Math.round(latestDay.diesel * 0.1),
        adBlue: Math.round(latestDay.adBlue * 0.1),
        superE5: Math.round(latestDay.superE5 * 0.1),
        superE10: Math.round(latestDay.superE10 * 0.1),
        cleaning: Math.round(latestDay.cleaning * 0.1),
      },
      {
        name: "04:00",
        diesel: Math.round(latestDay.diesel * 0.15),
        adBlue: Math.round(latestDay.adBlue * 0.15),
        superE5: Math.round(latestDay.superE5 * 0.15),
        superE10: Math.round(latestDay.superE10 * 0.15),
        cleaning: Math.round(latestDay.cleaning * 0.15),
      },
      {
        name: "08:00",
        diesel: Math.round(latestDay.diesel * 0.25),
        adBlue: Math.round(latestDay.adBlue * 0.25),
        superE5: Math.round(latestDay.superE5 * 0.25),
        superE10: Math.round(latestDay.superE10 * 0.25),
        cleaning: Math.round(latestDay.cleaning * 0.25),
      },
      {
        name: "12:00",
        diesel: Math.round(latestDay.diesel * 0.2),
        adBlue: Math.round(latestDay.adBlue * 0.2),
        superE5: Math.round(latestDay.superE5 * 0.2),
        superE10: Math.round(latestDay.superE10 * 0.2),
        cleaning: Math.round(latestDay.cleaning * 0.2),
      },
      {
        name: "16:00",
        diesel: Math.round(latestDay.diesel * 0.2),
        adBlue: Math.round(latestDay.adBlue * 0.2),
        superE5: Math.round(latestDay.superE5 * 0.2),
        superE10: Math.round(latestDay.superE10 * 0.2),
        cleaning: Math.round(latestDay.cleaning * 0.2),
      },
      {
        name: "20:00",
        diesel: Math.round(latestDay.diesel * 0.1),
        adBlue: Math.round(latestDay.adBlue * 0.1),
        superE5: Math.round(latestDay.superE5 * 0.1),
        superE10: Math.round(latestDay.superE10 * 0.1),
        cleaning: Math.round(latestDay.cleaning * 0.1),
      },
    ];
  };

  const processWeeklyData = (sortedData: UploadFile[]) => {
    const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const result = [];

    const daysToProcess = Math.min(7, sortedData.length);

    for (let i = 0; i < daysToProcess; i++) {
      const item = sortedData[i];
      const date = new Date(item.date);
      const dayName = weekDays[date.getDay()];

      result.push({
        name: dayName,
        diesel: item.diesel,
        adBlue: item.adBlue,
        superE5: item.superE5,
        superE10: item.superE10,
        cleaning: item.cleaning,
      });
    }

    return result.reverse();
  };

  const processMonthlyData = (sortedData: UploadFile[]) => {
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const monthlyTotals: Record<string, any> = {};

    sortedData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = months[date.getMonth()];

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          name: monthKey,
          diesel: 0,
          adBlue: 0,
          superE5: 0,
          superE10: 0,
          cleaning: 0,
          count: 0,
        };
      }

      monthlyTotals[monthKey].diesel += item.diesel;
      monthlyTotals[monthKey].adBlue += item.adBlue;
      monthlyTotals[monthKey].superE5 += item.superE5;
      monthlyTotals[monthKey].superE10 += item.superE10;
      monthlyTotals[monthKey].cleaning += item.cleaning;
      monthlyTotals[monthKey].count += 1;
    });

    const result = Object.values(monthlyTotals).map((item: any) => ({
      name: item.name,
      diesel: Math.round(item.diesel / item.count),
      adBlue: Math.round(item.adBlue / item.count),
      superE5: Math.round(item.superE5 / item.count),
      superE10: Math.round(item.superE10 / item.count),
      cleaning: Math.round(item.cleaning / item.count),
    }));

    const monthsToDisplay = Math.min(6, result.length);
    return result.slice(0, monthsToDisplay);
  };

  const toggleCategory = (category: string) => {
    if (category === "all") {
      setActiveCategories(["all"]);
      return;
    }

    let newCategories = [...activeCategories];

    if (newCategories.includes("all")) {
      newCategories = newCategories.filter((c) => c !== "all");
    }

    if (newCategories.includes(category)) {
      newCategories = newCategories.filter((c) => c !== category);
      if (newCategories.length === 0) {
        newCategories = ["all"];
      }
    } else {
      newCategories.push(category);
    }

    setActiveCategories(newCategories);
  };

  const getVisibleSeries = () => {
    if (activeCategories.includes("all")) {
      return updatedCategories.slice(1).map((c) => c.value);
    }
    return activeCategories;
  };

  const getChartData = () => {
    switch (activeTab) {
      case "daily":
        return dailyData;
      case "monthly":
        return monthlyData;
      case "weekly":
      default:
        return weeklyData;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center pb-2 border-e-1">
        <CardTitle className="text-sm font-medium text-muted-foreground col-Label-4">
          Statistics
          <h2 className="text-2xl font-bold mt-1 text-black">
            Total summary of sales
          </h2>
        </CardTitle>
        <Tabs
          defaultValue="weekly"
          value={activeTab}
          onValueChange={setActiveTab}
          className="ml-auto mr-100"
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
      <CardContent className="flex flex-col lg:flex-row gap-8  ">
        <div className="w-full lg:w-3/4 h-[400px] border-e-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getChartData()}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barGap={4}
              barSize={10}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
              <YAxis axisLine={false} tickLine={false} dx={-10} />
              <Tooltip />
              {getVisibleSeries().map((series, index) => {
                const category = updatedCategories.find(
                  (c) => c.value === series
                );
                return (
                  <Bar
                    key={series}
                    dataKey={series}
                    fill={
                      category?.color ||
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`
                    }
                    radius={[4, 4, 0, 0]}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
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
                    : "-"
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
