import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrainRouteState {
  departureCode?: string;
  arrivalCode?: string;
  boardingAtCode?: string;
}

const initialState: TrainRouteState = {
  departureCode: 'select-departureCode',
  arrivalCode: 'select-arrivalCode',
  boardingAtCode: 'select-boardingAtCode',
};

const trainRouteSlice = createSlice({
  name: 'trainRoute',
  initialState,
  reducers: {
    setDepartureCode: (state, action: PayloadAction<string>) => {
      state.departureCode = action.payload;
    },
    setArrivalCode: (state, action: PayloadAction<string>) => {
      state.arrivalCode = action.payload;
    },
    setBoardingAtCode: (state, action: PayloadAction<string>) => {
      state.boardingAtCode = action.payload;
    },
  },
});

export const { setDepartureCode, setArrivalCode, setBoardingAtCode } = trainRouteSlice.actions;
export default trainRouteSlice.reducer;