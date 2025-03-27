"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TankRecord } from "@/types/tank";
import { GaugeComponent } from "react-gauge-component";
import { Label } from "@/components/ui/label";

interface TankGaugeProps {
  data: TankRecord[];
}

export default function TankGauge({ data }: TankGaugeProps) {
  const uniqueTanks = useMemo(() => {
    const tankMap = new Map<string, TankRecord>();

    data.forEach((tank) => {
      const existingTank = tankMap.get(tank.tankId);

      if (
        !existingTank ||
        (tank.updatedAt &&
          existingTank.updatedAt &&
          new Date(tank.updatedAt) > new Date(existingTank.updatedAt))
      ) {
        tankMap.set(tank.tankId, tank);
      }
    });

    return Array.from(tankMap.values()).sort((a, b) => {
      const extractNumber = (tankName: string) => {
        const match = tankName.match(/Tank\s*(\d+)/i);
        return match ? parseInt(match[1]) : 0;
      };

      return extractNumber(a.tankName) - extractNumber(b.tankName);
    });
  }, [data]);

  const [selectedTankId, setSelectedTankId] = useState(
    uniqueTanks.length > 0 ? uniqueTanks[0].tankId : ""
  );

  const selectedTank = useMemo(
    () =>
      uniqueTanks.find((tank) => tank.tankId === selectedTankId) ||
      uniqueTanks[0],
    [selectedTankId, uniqueTanks]
  );

  const tankFillRate = useMemo(() => {
    return selectedTank
      ? (selectedTank.currentLevel / selectedTank.maxCapacity) * 100
      : 0;
  }, [selectedTank]);

  return (
    <Card className="w-full shadow-sm border rounded-xl">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="space-y-1">
            <Label className="text-gray-500 text-lg">Tanks</Label>
            <CardTitle className="text-2xl font-bold">
              {selectedTank?.tankName ?? "Tank"}
            </CardTitle>
          </div>
          <Select
            value={selectedTankId}
            onValueChange={(value) => setSelectedTankId(value)}
          >
            <SelectTrigger className="w-[140px] bg-gray-50 rounded-full mt-2 lg:mt-0">
              <SelectValue placeholder="Select tank" />
            </SelectTrigger>
            <SelectContent>
              {uniqueTanks.map((tank) => (
                <SelectItem key={tank.tankId} value={tank.tankId}>
                  {tank.tankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="border-t my-2" />
      </CardHeader>
      {uniqueTanks.length > 0 ? (
        <CardContent className="px-6 pt-2">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-center py-4">
              <GaugeComponent
                type="semicircle"
                minValue={0}
                maxValue={100}
                value={tankFillRate}
                labels={{
                  valueLabel: {
                    style: {
                      fontSize: "40px",
                      paddingTop: "50px",
                      fill: "#333",
                      fontWeight: 700,
                      textShadow: "none",
                    },
                  },
                }}
                arc={{
                  colorArray: ["#ff8083", "#ffa0a2", "#ffd966", "#7ed957"],
                  padding: 0.03,
                  subArcs: [
                    { limit: 25 },
                    { limit: 50 },
                    { limit: 75 },
                    { limit: 100 },
                  ],
                }}
                pointer={{
                  type: "blob",
                  elastic: true,
                  animationDelay: 0,
                  color: "#ff8083",
                }}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-lg font-semibold">
                {selectedTank.tankName} - {selectedTank.fuelType}
              </p>
              <p className="text-gray-500">
                Updated{" "}
                {selectedTank.updatedAt
                  ? new Date(selectedTank.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
              <p className="text-gray-500">
                Current Level: {selectedTank.currentLevel} /{" "}
                {selectedTank.maxCapacity}
              </p>
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
