// store/slices/trainSelectionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrainSelectionState {
    trainNumber: string | null;
    classQuota: { class: string; quota: string } | null;
}

const initialState: TrainSelectionState = {
    trainNumber: null,
    classQuota: null,
};

const ActiveTrainSlice = createSlice({
    name: 'ActiveTrain',
    initialState,
    reducers: {
        // Single action to set both train number and class/quota
        setActiveTrain: (
            state,
            action: PayloadAction<{
                trainNumber: string;
                class: string;
                quota: string;
            }>
        ) => {
            state.trainNumber = action.payload.trainNumber;
            state.classQuota = {
                class: action.payload.class,
                quota: action.payload.quota
            };
        },
    },
});

// Export actions
export const {
    setActiveTrain, // New combined action
} = ActiveTrainSlice.actions;

// Export reducer
export default ActiveTrainSlice.reducer;