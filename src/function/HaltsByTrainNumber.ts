import { TrainType } from "../components/Rail/trainbetweenstation/trainTypes";
import { trainTimings } from "../components/Rail/traintiming";


export const FetchHaltsDetails = async (train: TrainType, journeyDate: string, intialfromstation :string) => {
    const details: any = {};
    const runningdays = [
        train.runningMon,
        train.runningTue,
        train.runningWed,
        train.runningThu,
        train.runningFri,
        train.runningSat,
        train.runningSun,
    ];
    // const intialfromstation = train.fromStnCode;
    details[train.trainNumber] = await trainTimings(
        train.fromStnCode,
        train.toStnCode,
        train.trainRoute,
        runningdays,
        intialfromstation,
        journeyDate
    );
    return (details[train.trainNumber]);
};