// utils/formatDateWithDay.ts
import { format, parse } from "date-fns";

// 🟢 Convert "12-01-2025" → "Sun, 12 Jan"
export function formatDateWithDay(inputDateStr: string): string {
  try {
    const [day, month, year] = inputDateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return format(date, "EEE, dd MMM"); // ✔️ RN/Expo supported
  } catch {
    return "Invalid Date";
  }
}

// 🟢 Convert "12-01-2025" → "Sun, 12 Jan"
export function formatDateWithDayandmonth(
  dateString: string,
  onlyminut: boolean = false // 👈 param kept but unused
): string {
  try {
    const parsedDate = parse(dateString, "dd-MM-yyyy", new Date());
    return format(parsedDate, "EEE, dd MMM");
  } catch {
    return "Invalid Date";
  }
}

// 🟢 Convert ISO → "Sun, 12 Jan"
export function convertZuloDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, "EEE, dd MMM");
  } catch {
    return "Invalid Date";
  }
}

// 🟢 Convert "DD-MM-YYYY" → "Sun, 12 Jan"
export function DateWithDayAndMonth(dateString: string): string {
  try {
    const [day, month, year] = dateString.split("-");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return format(date, "EEE, dd MMM");
  } catch {
    return "Invalid Date";
  }
}
