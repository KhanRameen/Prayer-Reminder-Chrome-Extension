export type PrayerSettingsForm = {
  Country: {
    isoCode: string;
    name: string;
  };
  City: string;
  CalculationMethod: string;
  JuristicMethod: "0" | "1";
  MidnightMode: "0" | "1";
  Tune: {
    Fajr: number;
    Sunrise: number;
    Dhuhr: number;
    Asr: number;
    Maghrib: number;
    Isha: number;
  };
};
