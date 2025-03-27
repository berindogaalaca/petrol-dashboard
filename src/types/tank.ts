export interface TankFillingRecord {
  date: string;
  tankId: string;
  productNumber: string;
  productDescription: string;
  initialVolume: number;
  filledAmount: number;
  finalVolume: number;
  operatorId: string;
  stationId: string;
}
