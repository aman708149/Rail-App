import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { UserPreferences } from "../types/UserPreferences";
import { getUserPreferences } from "../service/profileservice";

// 🧠 Async thunk to fetch user preferences
export const fetchUserPreferences = createAsyncThunk<
  UserPreferences,
  void,
  { rejectValue: string }
>("userPreferences/fetchUserPreferences", async (_, thunkAPI) => {
  try {
    const response = await getUserPreferences();
    return response?.data?.data;
  } catch (error: any) {
    // In React Native, no `error.response?.data` if offline
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to fetch preferences";
    return thunkAPI.rejectWithValue(message);
  }
});

// 🎯 Define slice state shape
interface UserPreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

// 🏁 Initial state
const initialState: UserPreferencesState = {
  preferences: null,
  loading: false,
  error: null,
};

// 🧩 Create slice
const userPreferencesSlice = createSlice({
  name: "userPreferences",
  initialState,
  reducers: {
    // Optional: local updates
    setPreferences(state, action: PayloadAction<UserPreferences>) {
      state.preferences = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserPreferences.fulfilled,
        (state, action: PayloadAction<UserPreferences>) => {
          state.loading = false;
          state.preferences = action.payload;
        }
      )
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch preferences";
      });
  },
});

export const { setPreferences } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
