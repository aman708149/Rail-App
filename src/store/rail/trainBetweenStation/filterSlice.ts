import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TrainFilters {
    trainNameFilter: string;
    trainTypeFilter: string[]; // Array of selected train types
    departureTimeRange: [number, number]; // [start, end] in minutes
    arrivalTimeRange: [number, number]; // [start, end] in minutes
    trainClassFilter: string[]; // ✅ Added train class filter
    fromStationFilter: string []; // ✅ New filter
    toStationFilter: string [];   // ✅ New filter
    runningDaysFilter: string[];
    viaStationFilter?: string; // Optional filter for via station
}

const initialState: TrainFilters = {
    trainNameFilter: "",
    trainTypeFilter: [], // Initially, no filters applied
    departureTimeRange: [0, 1439], // Full day range
    arrivalTimeRange: [0, 1439], // Full day range
    trainClassFilter: [], // ✅ Initially, no class filters applied
    fromStationFilter: [], // ✅ Ensure this is an array
    toStationFilter: [],   // ✅ Ensure this is an array
    runningDaysFilter: [], // Initially, no running days filter applied
    viaStationFilter: undefined, // Optional filter for via station
};

const trainfiltersSlice = createSlice({
    name: "trainfilters",
    initialState,
    reducers: {
        setTrainNameFilter: (state, action: PayloadAction<string>) => {
            state.trainNameFilter = action.payload; // ✅ Update train name/number filter
        },
        setTrainTypeFilter: (state, action: PayloadAction<string>) => {
            if (state.trainTypeFilter.includes(action.payload)) {
                state.trainTypeFilter = state.trainTypeFilter.filter(type => type !== action.payload);
            } else {
                state.trainTypeFilter.push(action.payload);
            }
        },
        setDepartureTimeRange: (state, action: PayloadAction<[number, number]>) => {
            state.departureTimeRange = action.payload;
        },
        setArrivalTimeRange: (state, action: PayloadAction<[number, number]>) => {
            state.arrivalTimeRange = action.payload;
        },
        setTrainClassFilter: (state, action: PayloadAction<string>) => {  // ✅ New action
            if (state.trainClassFilter.includes(action.payload)) {
                state.trainClassFilter = state.trainClassFilter.filter(cls => cls !== action.payload);
            } else {
                state.trainClassFilter.push(action.payload);
            }
        },
        setFromStationFilter: (state, action: PayloadAction<string[]>) => {  
            state.fromStationFilter = action.payload;
        },
        
        setToStationFilter: (state, action: PayloadAction<string[]>) => {  
            state.toStationFilter = action.payload;
        },
        setRunningDaysFilter: (state, action: PayloadAction<string[]>) => {
            state.runningDaysFilter = action.payload;
        },
        setViaStationFilter: (state, action: PayloadAction<string>) => {
            state.viaStationFilter = action.payload || undefined;
        },
    },
});

export const {
    setTrainNameFilter,
    setTrainTypeFilter,
    setDepartureTimeRange,
    setArrivalTimeRange,
    setTrainClassFilter,
    setFromStationFilter,
    setToStationFilter,
    setRunningDaysFilter,
    setViaStationFilter,
} = trainfiltersSlice.actions;

export default trainfiltersSlice.reducer;
