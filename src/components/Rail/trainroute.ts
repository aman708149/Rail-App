export enum TrainOwnerEnum {
    IRCTC_TRAIN = '1',
    INDIAN_RAILWAY = '0'
}

type Station = {
    _id: string;
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
};
export interface trainRoute {
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
};