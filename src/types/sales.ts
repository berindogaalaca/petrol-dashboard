export interface SalesRecord {
  transactionNumber: string;
  date: Date;
  time: string;
  articleNumber: string;
  productDescription: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  unit: string;
  vatPercent: number;
  vatIdentifier: string;
  currencyCode: string;
  vatAmount: number;
  paymentMethodId: string;
  paymentLocation: string;
  cardNumber?: string;
  customerNumber?: string;
  personCard?: string;
  driverNumber?: string;
  fuelPumpNumber?: string;
  stationNumber?: string;
  costCenter?: string;
  cashRegisterNumber?: string;
  extraField?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
