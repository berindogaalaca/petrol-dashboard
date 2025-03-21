"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { UploadFile } from "@/types/file";
import { useIsMobile } from "@/hooks/use-mobile";

interface TankChartProps {
  data: UploadFile | null;
}

export default function TankGauge({ data }: TankChartProps) {
  const full = 100;
  const date = new Date(data?.date ?? "").toLocaleDateString();

  const tanksData = useMemo(
    () => [
      {
        id: 1,
        name: "Diesel",
        fillRate: full - (data?.diesel ?? 0),
      },
      {
        id: 2,
        name: "Ad Blue",
        fillRate: full - (data?.adBlue ?? 0),
      },
      {
        id: 3,
        name: "Super E5",
        fillRate: full - (data?.superE5 ?? 0),
      },
      {
        id: 4,
        name: "Super E10",
        fillRate: full - (data?.superE10 ?? 0),
      },
      {
        id: 5,
        name: "Cleaning",
        fillRate: full - (data?.cleaning ?? 0),
      },
    ],
    [data]
  );

  const [selectedTankId, setSelectedTankId] = useState(1);
  const selectedTank =
    tanksData.find((tank) => tank.id === selectedTankId) || tanksData[0];

  return (
    <Card className="w-full shadow-sm border rounded-xl">
      <CardContent className="px-6 pt-2">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="space-y-1">
              <h3 className="text-gray-500 text-lg">Tanks</h3>
              <h2 className="text-2xl font-bold">{selectedTank.name}</h2>
            </div>
            <Select
              value={selectedTankId.toString()}
              onValueChange={(value) =>
                setSelectedTankId(Number.parseInt(value))
              }
            >
              <SelectTrigger className="w-[140px] bg-gray-50 rounded-full mt-2 lg:mt-0">
                <SelectValue placeholder="Select tank" />
              </SelectTrigger>
              <SelectContent>
                {tanksData.map((tank) => (
                  <SelectItem key={tank.id} value={tank.id.toString()}>
                    {tank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border-t my-2" />

          <div className="flex justify-center py-4">
            <GaugeChart value={selectedTank.fillRate} />
          </div>

          <div className="text-center space-y-1">
            <p className="text-lg font-semibold">{selectedTank.name} </p>
            <p className="text-gray-500">Updated {date}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface GaugeChartProps {
  value: number;
}

function GaugeChart({ value }: GaugeChartProps) {
  const isMobile = useIsMobile();
  const size = isMobile ? 240 : 360;

  const strokeWidth = isMobile ? 15 : 20;
  const radius = (size - strokeWidth) / 2;

  const fillPercentage = Math.min(Math.max(value, 0), 100);

  const segments = [
    { startAngle: 0, endAngle: 85, color: "#f472b6" },
    { startAngle: 95, endAngle: 130, color: "#f9a8d4" },
    { startAngle: 140, endAngle: 160, color: "#fde047" },
    { startAngle: 170, endAngle: 180, color: "#4ade80" },
  ];

  const indicatorAngle = (fillPercentage / 100) * 180;
  const indicatorX =
    size / 2 + radius * Math.cos(((indicatorAngle - 180) * Math.PI) / 180);
  const indicatorY =
    size / 2 + radius * Math.sin(((indicatorAngle - 180) * Math.PI) / 180);

  const getIndicatorColor = (): string => {
    const percentageAngle = (fillPercentage / 100) * 180;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (
        percentageAngle >= segment.startAngle &&
        percentageAngle <= segment.endAngle
      ) {
        return segment.color;
      }

      if (i < segments.length - 1) {
        const nextSegment = segments[i + 1];
        if (
          percentageAngle > segment.endAngle &&
          percentageAngle < nextSegment.startAngle
        ) {
          return percentageAngle - segment.endAngle <
            nextSegment.startAngle - percentageAngle
            ? segment.color
            : nextSegment.color;
        }
      }
    }

    return segments[segments.length - 1].color;
  };

  const createArc = (startAngle: number, endAngle: number) => {
    const start = {
      x: size / 2 + radius * Math.cos(((startAngle - 180) * Math.PI) / 180),
      y: size / 2 + radius * Math.sin(((startAngle - 180) * Math.PI) / 180),
    };

    const end = {
      x: size / 2 + radius * Math.cos(((endAngle - 180) * Math.PI) / 180),
      y: size / 2 + radius * Math.sin(((endAngle - 180) * Math.PI) / 180),
    };

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size / 2 + strokeWidth / 2}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
      >
        <path
          d={createArc(0, 180)}
          fill="none"
          stroke="#fff"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {segments.map((segment, index) => (
          <path
            key={index}
            d={createArc(segment.startAngle, segment.endAngle)}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}

        <circle
          cx={indicatorX}
          cy={indicatorY}
          r={strokeWidth / 2}
          fill="white"
          stroke={getIndicatorColor()}
          strokeWidth="4"
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center mt-16 ml-2">
        <span
          className={`${
            isMobile ? "text-4xl" : "text-6xl"
          } font-bold text-gray-900`}
        >
          {value}%
        </span>
      </div>
    </div>
  );
}
