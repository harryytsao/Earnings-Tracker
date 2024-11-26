export type EarningTime =
  | "time-after-hours"
  | "time-not-supplied"
  | "time-pre-market";

export interface Earning {
  symbol: string;
  name: string;
  time: EarningTime;
  reportDate: string;
  lastYearRptDt: string;
  lastYearEPS: string;
  epsForecast: string;
  fiscalQuarterEnding: string;
  marketCap: string;
  noOfEsts: string;
}
