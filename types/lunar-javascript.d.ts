declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    // Add other Solar methods if needed
  }

  export class Lunar {
    lDay: number;
    lMonth: number;
    // Add other Lunar properties/methods if needed
    getDay(): number; // Adding getDay and getMonth based on common usage
    getMonth(): number;
    getYear(): number;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInGanZhi(): string;
    getAnimal(): string;
    // Potentially add fromYmd for lunar to solar conversion
    static fromYmd(year: number, month: number, day: number, isLeap?: boolean): Lunar;
    getSolar(): Solar;
  }
}
