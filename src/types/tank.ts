export interface TankRecord {
  tankId: string;
  tankName: string;
  fuelType: string;
  maxCapacity: number;
  currentLevel: number;
  date: Date;
  time: string;
  salesAmount: number;
  refillAmount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
