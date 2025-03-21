"use client";

import { useFile } from "@/hooks/use-file";
import { BarChartView } from "./charts/bar-chart";
import { StaticsCardLine } from "./charts/line-chart";
import TankGauge from "./charts/tanks-chart";
import PieChartView from "./charts/pie-chart";

export default function DashboardView() {
  const { data, isLoading, error } = useFile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const sortedData =
    data && data.length > 0
      ? [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      : [];

  const todayData = sortedData.length > 0 ? sortedData[0] : null;

  const yesterdayData = sortedData.length > 1 ? sortedData[1] : null;

  return (
    <div className="my-20 w-full">
      <StaticsCardLine todayData={todayData} yesterdayData={yesterdayData} />
      <div className="mx-4 py-4">
        <BarChartView data={data} />
      </div>
      <div className="mx-4 py-4 flex flex-col lg:flex-row gap-4 place-items-start ">
        <TankGauge data={todayData} />
        <PieChartView data={data} />
      </div>
    </div>
  );
}
