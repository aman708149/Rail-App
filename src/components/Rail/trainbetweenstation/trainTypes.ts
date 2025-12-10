import { avlDayList } from "./avlDayList";


export interface TrainRoute {
  _id: string;
  trainNumber: string;
  trainName: string;
  stationFrom: string;
  stationTo: string;
  trainOwner: string;
  trainRunsOnMon: string;
  trainRunsOnTue: string;
  trainRunsOnWed: string;
  trainRunsOnThu: string;
  trainRunsOnFri: string;
  trainRunsOnSat: string;
  trainRunsOnSun: string;
  serverId: string;
  timeStamp: string;
  stationList: Station[];
  __v: number;
}

export interface Station {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  routeNumber: string;
  haltTime: string;
  distance: number;
  dayCount: number;
  stnSerialNumber: string;
  boardingDisabled: string;
  previousDistance: number;
  previousDuration: string;
  _id: string;
}

export interface availabilityType {
  enqClass: string,
  quota: string,
  availability: avlDayList,
  fare: number,
  agentFee: string,
  pgCharge: string,
  totalFare: string,
  wpServiceCharge: string,
  wpServiceTax: string
}

export interface TrainType {
  initialFromStnCode: string;  // ✅ Add this
  initialToStnCode: string;    // ✅ Add this
  trainNumber: string;
  trainName: string;
  fromStnCode: string;
  toStnCode: string;
  arrivalTime: string;
  departureTime: string;
  distance: string;
  duration: string;
  runningMon: string;
  runningTue: string;
  runningWed: string;
  runningThu: string;
  runningFri: string;
  runningSat: string;
  runningSun: string;
  avlClasses: string[];
  trainType: string[];
  atasOpted: string;
  flexiFlag: string;
  trainOwner: string;
  trainsiteId: string;
  trainRoute: TrainRoute;
  foodChoiceEnabled: string | null;
  availability: availabilityType[];
}

export interface TrainApiResponse {
  journeyDate: string | null;
  quotaList: string[];
  trainBtwnStnsList: TrainType[];
}

export interface TrainFilters {
  trainName: string;
  departureStart: string;
  departureEnd: string;
  trainTypes: Record<string, boolean>;
  classes: Record<string, boolean>;
  runningDays: Record<string, boolean>;
}

export interface TrainState {
  quotaList: string[];
  trainBtwnStnsList: TrainType[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  journeyDate: string | null,
  filters: TrainFilters,
  sortConfig: {
    key: keyof TrainType | '';
    direction: 'asc' | 'desc' | 'default';
  };
}
