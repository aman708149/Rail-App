// utils/trainTimings.ts   ✔ FULL REACT NATIVE EXPO VERSION

import { formatDateWithDayandmonth } from "@/src/utils/DateFormate/formatDateWithDay";
import { format, parse } from "date-fns";

// -----------------------------------------------------------
// 🟢 MAIN FUNCTION – Get Complete Timings & Info for Train
// -----------------------------------------------------------
export async function trainTimings(
  from: string,
  To: string,
  trainroute: any,
  runningdays: string[],
  initialFromStation: string,
  journeyDate: string
) {
  let arr: any = [];
  arr[0] = getStationData(trainroute, from);
  arr[1] = getStationData(trainroute, To);

  let halt = arr[1]?.stnSerialNumber - arr[0]?.stnSerialNumber;
  let distance = arr[1]?.distance - arr[0]?.distance;
  let duration = DurationCalculation(
    arr[0]?.departureTime,
    arr[1]?.arrivalTime,
    arr[0]?.dayCount,
    arr[1]?.dayCount
  );

  let ArrivalDate = GetarrivalDate(journeyDate, arr[0]?.departureTime, duration);

  let runningDaysFinal = calculateRunningDays(
    trainroute,
    from,
    initialFromStation,
    runningdays
  );

  return {
    distance,
    halt,
    fstationName: arr[0]?.stationName,
    fdepartureTime: arr[0]?.departureTime,
    tostationName: arr[1]?.stationName,
    toarrivalTime: arr[1]?.arrivalTime,
    duration,
    ArrivalDate,
    ...runningDaysFinal,
  };
}

// -----------------------------------------------------------
// 📆 ARRIVAL DATE CALCULATION    Output -> "12-01-2025"
// -----------------------------------------------------------
export function GetarrivalDate(
  journeyDate: string,
  departureTime: string,
  duration: string
) {
  const baseDate = parse(journeyDate, "yyyyMMdd", new Date());

  let [depH, depM] = departureTime.split(":").map(Number);
  let dateWithTime = new Date(baseDate);
  dateWithTime.setHours(depH, depM);

  let [durH, durM] = duration.split(":").map(Number);
  dateWithTime.setHours(dateWithTime.getHours() + durH);
  dateWithTime.setMinutes(dateWithTime.getMinutes() + durM);

  return zuloTimeToDDMMYYY(dateWithTime); // 👉 Output: dd-MM-yyyy
}

// -----------------------------------------------------------
// 📅 FORMAT – Convert Date → "DD-MM-YYYY"
// -----------------------------------------------------------
export function zuloTimeToDDMMYYY(date: Date) {
  try {
    return format(date, "dd-MM-yyyy");
  } catch (e) {
    return "Invalid Date";
  }
}

// -----------------------------------------------------------
// 📅 SIDEBAR DATE FORMAT → "Mon, 12 Jan"
// -----------------------------------------------------------
export function GetArrivalDateSideBar(
  journeyDate: string,
  departureTime: string,
  duration: string
) {
  try {
    const formatDate = format(
      parse(journeyDate, "d-M-yyyy", new Date()),
      "yyyyMMdd"
    );
    const newDate = GetarrivalDate(formatDate, departureTime, duration);
    return formatDateWithDayandmonth(newDate); // imports from your other file
  } catch {
    return "Invalid date";
  }
}

// -----------------------------------------------------------
// 🚉 GET STATION DETAILS FROM ROUTE ARRAY
// -----------------------------------------------------------
export function getStationData(data: any, code: string) {
  const station = data?.stationList?.find(
    (s: { stationCode: string }) => s.stationCode === code
  );
  if (!station) return null;
  const { stationName, departureTime, arrivalTime, distance, dayCount, stnSerialNumber } =
    station;
  return { stationName, departureTime, arrivalTime, distance, dayCount, stnSerialNumber };
}

// -----------------------------------------------------------
// 🕒 DURATION CALCULATION – OUTPUT → "13:45"
// -----------------------------------------------------------
export function DurationCalculation(
  DepartureTime: string,
  ArrivalTime: string,
  DayCountDeparture: number,
  DayCountArrival: number
) {
  const dep = convertTimeToObj(DepartureTime);
  const arr = convertTimeToObj(ArrivalTime);

  const fullDays = DayCountArrival - DayCountDeparture - 1;

  let totalHours =
    24 - dep.hour - (dep.minute > 0 ? 1 : 0) +
    fullDays * 24 +
    arr.hour;

  let totalMinutes = dep.minute > 0 ? 60 - dep.minute : 0;
  totalMinutes += arr.minute;

  totalHours += Math.floor(totalMinutes / 60);
  totalMinutes = totalMinutes % 60;

  return `${String(totalHours).padStart(2, "0")}:${String(
    totalMinutes
  ).padStart(2, "0")}`;
}

// -----------------------------------------------------------
// 🕒 TIME STRING TO OBJECT
// -----------------------------------------------------------
export function convertTimeToObj(timeStr: string) {
  if (!timeStr || !timeStr.includes(":")) {
    return { hour: 0, minute: 0 };
  }
  const [hour, minute] = timeStr.split(":").map(Number);
  return { hour, minute };
}

// -----------------------------------------------------------
// 🟢 CALCULATE RUNNING DAYS BASED ON DAY COUNT SHIFT
// -----------------------------------------------------------
interface RunningDays {
  runningSun: string;
  runningMon: string;
  runningTue: string;
  runningWed: string;
  runningThu: string;
  runningFri: string;
  runningSat: string;
}

export function calculateRunningDays(
  trainRoute: any,
  selectedStationCode: string,
  initialStationCode: string,
  runningdays: string[]
): RunningDays {
  const runningDays: RunningDays = {
    runningMon: runningdays[0],
    runningTue: runningdays[1],
    runningWed: runningdays[2],
    runningThu: runningdays[3],
    runningFri: runningdays[4],
    runningSat: runningdays[5],
    runningSun: runningdays[6],
  };

  const selectedStation = trainRoute.stationList.find(
    (st: { stationCode: string }) => st.stationCode === selectedStationCode
  );
  const initialStation = trainRoute.stationList.find(
    (st: { stationCode: string }) => st.stationCode === initialStationCode
  );

  if (!selectedStation || !initialStation) return runningDays;

  const adjust = selectedStation.dayCount - initialStation.dayCount;
  if (adjust === 0) return runningDays;

  const shiftDays = (days: string[], shift: number) =>
    days.map((_, i) => days[(i + shift) % days.length]);

  const shifted = shiftDays(runningdays, adjust);

  return {
    runningMon: shifted[0],
    runningTue: shifted[1],
    runningWed: shifted[2],
    runningThu: shifted[3],
    runningFri: shifted[4],
    runningSat: shifted[5],
    runningSun: shifted[6],
  };
}
