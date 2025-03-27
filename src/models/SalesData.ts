import { SalesRecord } from "@/types/sales";
import mongoose, { Schema } from "mongoose";

const SalesDataSchema = new Schema<SalesRecord>(
  {
    transactionNumber: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    articleNumber: { type: String, required: true },
    productDescription: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    grossAmount: { type: Number, required: true },
    unit: { type: String, required: false },
    vatPercent: { type: Number, required: true },
    vatIdentifier: { type: String, required: true },
    currencyCode: { type: String, required: true },
    vatAmount: { type: Number, required: true },
    paymentMethodId: { type: String, required: true },
    paymentLocation: { type: String, required: true },
    cardNumber: { type: String },
    customerNumber: { type: String },
    personCard: { type: String },
    driverNumber: { type: String },
    fuelPumpNumber: { type: String },
    stationNumber: { type: String },
    costCenter: { type: String },
    cashRegisterNumber: { type: String },
    extraField: { type: String },
    terminalID: { type: String },
    couponNumber: { type: String },
  },
  {
    timestamps: true,
    collection: "sales-data",
  }
);

const SalesDataModel =
  mongoose.models.SalesData ||
  mongoose.model<SalesRecord>("SalesData", SalesDataSchema);

export default SalesDataModel;
