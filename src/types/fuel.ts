export interface FuelPrices {
  month?: string;
  year?: number;
  diesel: number;
  adBlue: number;
  superE5: number;
  superE10: number;
  cleaning: number;
  lastUpdated?: Date;
}

export interface FuelResponse {
  data: {
    [key: string]: {
      "Kursunsuz_95(Excellium95)_TL/lt": string;
      "Motorin(Eurodiesel)_TL/lt": string;
      "Motorin(Excellium_Eurodiesel)_TL/lt": string;
      [key: string]: string;
    };
  };
}
