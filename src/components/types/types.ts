export type PrayerSettingsForm = {
  Country: string;
  City: string;
  CalculationMethod: string;
  JuristicMethod: string;
  MidnightMode: boolean;
  Tune: {
    Fajr: number;
    Duhr: number;
    Asr: number;
    Maghrib: number;
    Isha: number;
  };
};
