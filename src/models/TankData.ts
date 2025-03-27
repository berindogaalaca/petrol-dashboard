import { TankRecord } from "@/types/tank";
import mongoose, { Schema } from "mongoose";

const TankDataSchema = new Schema<TankRecord>(
  {
    tankId: { type: String, required: true },
    tankName: { type: String, required: true },
    fuelType: { type: String, required: true },
    maxCapacity: { type: Number, required: true },
    currentLevel: { type: Number, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    salesAmount: { type: Number, required: true, default: 0 },
    refillAmount: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    collection: "tank-data",
  }
);

const TankDataModel =
  mongoose.models.TankData ||
  mongoose.model<TankRecord>("TankData", TankDataSchema);

export default TankDataModel;
