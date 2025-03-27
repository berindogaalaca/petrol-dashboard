"use client";

import { useFile, useTankFile } from "@/hooks/use-file";
import { BarChartView } from "./charts/bar-chart";
import { StaticsCardLine } from "./charts/line-chart";
import TankGauge from "./charts/tanks-chart";
import PieChartView from "./charts/pie-chart";
import { useEffect, useState } from "react";
import { SalesRecord } from "@/types/sales";
import { TankRecord } from "@/types/tank";

export default function DashboardView() {
  const { data: salesData, isLoading, error } = useFile();
  const {
    data: tankData,
    isLoading: tankisLoading,
    error: tankError,
  } = useTankFile();
  const [todayData, setTodayData] = useState<SalesRecord[]>([]);
  const [yesterdayData, setYesterdayData] = useState<SalesRecord[]>([]);
  const [todayTankData, setTodayTankData] = useState<TankRecord[]>([]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const todayRecords = salesData.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getDate() === today.getDate() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      });

      const yesterdayRecords = salesData.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getDate() === yesterday.getDate() &&
          itemDate.getMonth() === yesterday.getMonth() &&
          itemDate.getFullYear() === yesterday.getFullYear()
        );
      });

      setTodayData(todayRecords);
      setYesterdayData(yesterdayRecords);
    }
  }, [salesData]);

  useEffect(() => {
    if (tankData && tankData.length > 0) {
      const today = new Date();

      const todayTanks = tankData.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getDate() === today.getDate() &&
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      });

      setTodayTankData(todayTanks);
    }
  }, [tankData]);

  if (isLoading || tankisLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="my-20 w-full">
      <StaticsCardLine todayData={todayData} yesterdayData={yesterdayData} />
      <div className="mx-0 lg:mx-4 py-4">
        <BarChartView data={salesData} />
      </div>
      <div className="mx-0 lg:mx-4 py-4 flex flex-col lg:flex-row gap-4 place-items-start ">
        <TankGauge data={todayTankData} />
        <PieChartView data={salesData} />
      </div>
    </div>
  );
}
