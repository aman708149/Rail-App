// src/hooks/useGlobalDateRange.ts

import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useRole } from "@/src/context/RoleProvider";

interface UseGlobalDateRangeOptions {
  fromDaysAgo?: number;   // e.g. 2 → 2 days ago
  fromMonthsAgo?: number; // e.g. 1 → 1 month ago
}

export function useGlobalDateRange(options?: UseGlobalDateRangeOptions) {
  const { user } = useRole();
  const currentDateISO = user?.currentDateISO ?? "";

  const [FromDate, setFromDate] = useState<string>("");
  const [ToDate, setToDate] = useState<string>("");
  const [minDate, setMinDate] = useState<string>("");

  useEffect(() => {
    if (!currentDateISO) return;

    let fromDateCalc = "";

    if (options?.fromDaysAgo !== undefined) {
      // N days ago from currentDateISO
      fromDateCalc =
        DateTime.fromISO(currentDateISO)
          .minus({ days: options.fromDaysAgo })
          .toISODate() ?? "";
    } else if (options?.fromMonthsAgo !== undefined) {
      // N months ago from currentDateISO
      fromDateCalc =
        DateTime.fromISO(currentDateISO)
          .minus({ months: options.fromMonthsAgo })
          .toISODate() ?? "";
    } else {
      // Default: last 30 days
      fromDateCalc =
        DateTime.fromISO(currentDateISO).minus({ days: 30 }).toISODate() ?? "";
    }

    const minDateCalc =
      DateTime.fromISO(currentDateISO).minus({ months: 3 }).toISODate() ?? "";

    setFromDate(fromDateCalc);
    setToDate(currentDateISO);
    setMinDate(minDateCalc);
  }, [currentDateISO, options?.fromDaysAgo, options?.fromMonthsAgo]);

  return {
    FromDate,          // ISO string: "2025-11-26"
    ToDate,            // ISO string
    setFromDate,
    setToDate,
    minDate,           // ISO string for 3 months ago
    maxDate: currentDateISO,
  };
}
