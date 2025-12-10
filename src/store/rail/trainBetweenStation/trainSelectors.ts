import { TrainType } from "@/src/components/Rail/trainbetweenstation/trainTypes";
import { createSelector } from "@reduxjs/toolkit";
import { RootStore } from "../../../store";


// Utility function to convert time string to minutes
const convertTimeToMinutes = (time: string) => {
    if (!time) return 0; // Prevent errors on empty strings
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
};

// Selectors
const selectTrainData = (state: RootStore) => state.trainBetweenStation.trainBtwnStnsList;
const selectFilters = (state: RootStore) => state.trainfilters;
export const selectTrainTypes = createSelector([selectTrainData], (trains) => {
    // Extract unique train types
    const trainTypesSet = new Set(trains.map((train: any) => train.trainType));
    return Array.from(trainTypesSet).sort(); // Return sorted array of train types
});
export const selectUniqueTrainClasses = createSelector(
    [selectTrainData],
    (trainList) => {
        const trainClassesSet = new Set();
        trainList.forEach((train: { avlClasses: any[]; }) => {
            train.avlClasses.forEach(cls => trainClassesSet.add(cls));
        });
        return Array.from(trainClassesSet);
    }
);
export const selectUniqueFromStations = createSelector([selectTrainData], (trains) => {
    const fromStationSet = new Set(trains.map((train: { fromStnCode: any; }) => train.fromStnCode));
    return Array.from(fromStationSet).sort(); // Sorted list of unique From Stations
});

export const selectUniqueToStations = createSelector([selectTrainData], (trains) => {
    const toStationSet = new Set(trains.map((train: { toStnCode: any; }) => train.toStnCode));
    return Array.from(toStationSet).sort(); // Sorted list of unique To Stations
});

export const selectFilteredTrains = createSelector(
    [selectTrainData, selectFilters],
    (trains, filters) => {
        return trains.filter((train: TrainType) => {
            const departureTimeInMinutes = convertTimeToMinutes(train.departureTime);
            const arrivalTimeInMinutes = convertTimeToMinutes(train.arrivalTime);

            // Running days filter logic
            const runsOnSelectedDays = filters?.runningDaysFilter?.length === 0 ||
                filters?.runningDaysFilter.every((day: any) =>
                    train[`running${day}` as keyof TrainType] === 'Y'
                );

            const passesViaStation = !filters.viaStationFilter ||
                train.trainRoute?.stationList?.some(
                    station => filters.viaStationFilter !== undefined &&
                        station.stationCode.includes(filters.viaStationFilter)
                );


            return (
                // Train Name or Number Filter
                (filters.trainNameFilter === "" ||
                    train.trainName.toLowerCase().includes(filters.trainNameFilter.toLowerCase()) ||
                    train.trainNumber.includes(filters.trainNameFilter)) &&
                // Departure time filter
                departureTimeInMinutes >= filters.departureTimeRange[0] &&
                departureTimeInMinutes <= filters.departureTimeRange[1] &&
                // Arrival time filter
                arrivalTimeInMinutes >= filters.arrivalTimeRange[0] &&
                arrivalTimeInMinutes <= filters.arrivalTimeRange[1] &&
                // Train type filter
                (filters.trainTypeFilter.length === 0 ||
                    filters.trainTypeFilter.includes(train.trainType[0])) &&
                // Class filter
                (filters.trainClassFilter.length === 0 ||
                    train.avlClasses.some(cls => filters.trainClassFilter.includes(cls))) &&
                // From station filter
                (filters.fromStationFilter.length === 0 ||
                    filters.fromStationFilter.includes(train.fromStnCode)) &&
                // To station filter
                (filters.toStationFilter.length === 0 ||
                    filters.toStationFilter.includes(train.toStnCode)) &&
                // Running days filter
                runsOnSelectedDays &&
                // Via station filter
                passesViaStation
            );
        });
    }
);


