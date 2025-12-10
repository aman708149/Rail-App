import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TimestampState {
  value: string | null;
}

const initialState: TimestampState = {
  value: null,
};

const timestampSlice = createSlice({
  name: 'timestamp',
  initialState,
  reducers: {
    updateTimestamp: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
  },
});

export const { updateTimestamp } = timestampSlice.actions;
export default timestampSlice.reducer;
