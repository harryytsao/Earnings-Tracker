export type EarningTime =
  | "time-after-hours"
  | "time-not-supplied"
  | "time-pre-market";

export interface Earning {
  symbol: string;
  companyName: string;
  reportDate: string;
  estimatedEps: string | null;
  lastYearReportDate: string | null;
  time: EarningTime;
  lastYearEps: string | null;
  fiscalQuarterEnding: string | null;
  marketCap: string | null;
  numberOfEstimates: string | null;
}
