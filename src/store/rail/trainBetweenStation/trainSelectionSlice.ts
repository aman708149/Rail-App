import { RouteDetails } from '@/src/components/Rail/routeDetails';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the structure of a single train selection
export interface TrainSelection {
  _id: string;
  reqEnqParam: string; // Unique identifier
  baseFare: string;
  cateringCharge: string;
  distance: string;
  dynamicFare: string;
  enqClass: string;
  from: string;
  to: string;
  quota: string;
  totalFare: string | undefined;
  trainName: string;
  trainNo: string;
  wpServiceCharge: string;
  wpServiceTax: string;
  fare: number | undefined;
  agentfee :string | undefined;
  pgcharge : string | undefined;
  journeyDate : string;
  originalJourneyDate: string; // Original Journey Date
  availabilityStatus : string;
  routeDetails : RouteDetails;
  initialToStnCode: string; // Initial To Station Code
  initialFromStnCode: string; // Initial From Station Code
}

// Define the structure of Redux State
interface TrainSelectionState {
  selectedTrain: TrainSelection | null; // The last clicked train option
}

// Initial state
const initialState: TrainSelectionState = {
  selectedTrain: null,
};

// Create the slice
const trainSelectionSlice = createSlice({
  name: 'trainSelection',
  initialState,
  reducers: {
    // Set the selected train data when clicking on "Book Now"
    setSelectedTrain: (state, action: PayloadAction<TrainSelection>) => {
      state.selectedTrain = action.payload;
    },
    // Clear selection when needed
    clearSelectedTrain: (state) => {
      state.selectedTrain = null;
    },
  },
});

// Export actions
export const { setSelectedTrain, clearSelectedTrain } = trainSelectionSlice.actions;

// Export reducer
export default trainSelectionSlice.reducer;
