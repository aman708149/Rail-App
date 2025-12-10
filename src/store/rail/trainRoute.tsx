// src/store/trainAvailabilitySlice.ts
import { TrainScheduleService } from '@/src/service/apiservice';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface TrainRoute {
    trainNumber: string;
    name: string;
    availability: any[]; // Define specific types based on your backend response
}

export interface TrainRouteState {
    data: any;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null | undefined;
}

// Async thunk for fetching train availability
export const FetchTrainRoute = createAsyncThunk<
    TrainRoute[],
    { journeyDate: string, trainNumber: string, fromStation: string },
    { rejectValue: string }
>(
    'trainRoute/fetchTrainRoute',
    async ({ journeyDate, trainNumber, fromStation }, { rejectWithValue }) => {
        try {
            // Make sure the API endpoint and data being sent are structured as needed
            const response = await TrainScheduleService(trainNumber, journeyDate, fromStation);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch train data');
        }
    }
);

const initialState: TrainRouteState = {
    data: [],
    status: 'idle',
    error: null
};

const TrainRouteSlice = createSlice({
    name: 'trainRoute',
    initialState,
    reducers: {
        setTrainRoute: (state, action: PayloadAction<any>) => {
            state.data = action.payload;
            state.status = 'succeeded'; // Since data is set manually, mark it as succeeded
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(FetchTrainRoute.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(FetchTrainRoute.fulfilled, (state, action: PayloadAction<TrainRoute[]>) => {
                state.status = 'succeeded';
                // Fix: Update to action.payload instead of action.payload.state
                state.data = action.payload;
            })
            .addCase(FetchTrainRoute.rejected, (state, action: PayloadAction<string | undefined>) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

// ✅ Export the setTrainRoute action
export const { setTrainRoute } = TrainRouteSlice.actions;

// ✅ Export the reducer
export default TrainRouteSlice.reducer;
