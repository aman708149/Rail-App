import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { avlDayList } from '@/src/components/Rail/trainbetweenstation/avlDayList';
import { GetTrainBetWeenStationService } from '@/src/service/railService/trainbetweestation.service';
import { TrainApiResponse, TrainFilters, TrainState, TrainType } from '@/src/components/Rail/trainbetweenstation/trainTypes';


// Initial state


const initialState: TrainState = {
  quotaList: [],
  trainBtwnStnsList: [],
  status: 'idle',
  journeyDate: null, // Add journeyDate to the initial state
  error: null,
  filters: {  // ✅ Initialize filters
    trainName: "",
    departureStart: "00:00",
    departureEnd: "23:59",
    trainTypes: {},
    classes: {},
    runningDays: {},
  },
  sortConfig: {
    key: '',
    direction: 'default'
  }
};

// Async thunk to fetch trains between stations
export const fetchTrainsBetweenStations = createAsyncThunk<
  TrainApiResponse,
  { fromStation: string; toStation: string, date: string, source: string }, // Added source as optional parameter
  { rejectValue: string }
>(
  'trains/fetchTrainsBetweenStations',
  async ({ fromStation, toStation, date, source }, { rejectWithValue }) => {
    try {
      const response = await GetTrainBetWeenStationService(fromStation, toStation, date, source);
      if (response?.data?.trainBtwnStnsList) {
        response.data.journeyDate = date;
        return response.data;
      }
      return rejectWithValue(response?.data?.error)
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.error || 'Failed to fetch train data');
    }
  }
);

const sortString = (a: string | undefined, b: string | undefined, direction: 'asc' | 'desc') => {
  const aa = (a ?? '').trim();
  const bb = (b ?? '').trim();

  if (!aa && !bb) return 0;
  if (!aa) return direction === 'asc' ? 1 : -1; // put empty at end for asc
  if (!bb) return direction === 'asc' ? -1 : 1;

  const comparison = aa.localeCompare(bb, undefined, { sensitivity: 'base', numeric: true });
  return direction === 'asc' ? comparison : -comparison;
};


const sortNumber = (a: number | undefined, b: number | undefined, direction: 'asc' | 'desc') => {
  if (a === undefined || a === null) return direction === 'asc' ? 1 : -1;
  if (b === undefined || b === null) return direction === 'asc' ? -1 : 1;

  return direction === 'asc' ? a - b : b - a;
};

const sortTime = (a: string | undefined, b: string | undefined, direction: 'asc' | 'desc') => {
  if (!a) return direction === 'asc' ? 1 : -1;
  if (!b) return direction === 'asc' ? -1 : 1;

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const aMinutes = timeToMinutes(a);
  const bMinutes = timeToMinutes(b);

  return direction === 'asc' ? aMinutes - bMinutes : bMinutes - aMinutes;
};

const sortDuration = (a: string | undefined, b: string | undefined, direction: 'asc' | 'desc') => {
  if (!a) return direction === 'asc' ? 1 : -1;
  if (!b) return direction === 'asc' ? -1 : 1;

  const durationToMinutes = (duration: string) => {
    const [hours, minutes] = duration.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const aMinutes = durationToMinutes(a);
  const bMinutes = durationToMinutes(b);

  return direction === 'asc' ? aMinutes - bMinutes : bMinutes - aMinutes;
};


// Create train slice
const trainBetweenStationSlice = createSlice({
  name: 'trainBetweenStation',
  initialState,
  reducers: {
    clearTrainData: (state) => {
      state.quotaList = [];
      state.trainBtwnStnsList = [];
      state.status = 'idle';
      state.error = null;
    },
    sortTrains: (state, action: PayloadAction<{ key: keyof TrainType; direction: 'asc' | 'desc' }>) => {
      const { key, direction } = action.payload;
      state.sortConfig = { key, direction };

      // Perform the actual sorting with null checks
      state.trainBtwnStnsList = [...state.trainBtwnStnsList].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        // Special handling for different data types
        if (key === 'departureTime' || key === 'arrivalTime') {
          return sortTime(aValue as string | undefined, bValue as string | undefined, direction);
        } else if (key === 'distance') {
          const aNum = aValue ? parseFloat(aValue as string) : undefined;
          const bNum = bValue ? parseFloat(bValue as string) : undefined;
          return sortNumber(aNum, bNum, direction);
        } else if (key === 'duration') {
          return sortDuration(aValue as string | undefined, bValue as string | undefined, direction);
        } else {
          // Default string comparison
          return sortString(aValue as string | undefined, bValue as string | undefined, direction);
        }
      });
    },
    setFilters: (state, action: PayloadAction<Partial<TrainFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };  // ✅ Update filters dynamically
    },
    updateTrainAvailability: (state, action: PayloadAction<{
      trainNumber: string; enqClass: string; quota: string; avlDayList: avlDayList,
      fare?: number; // Assuming fare is a number
      agentFee?: string; // Assuming agentFee is a string
      pgCharge?: string; // Assuming pgCharge is a string
      totalFare?: string; // Assuming totalFare is a string
      wpServiceCharge?: string; // Assuming wpServiceCharge is a string
      wpServiceTax?: string; // Assuming wpServiceTax is a string
    }>) => {
      const { trainNumber, enqClass, quota, avlDayList, fare, agentFee, pgCharge, totalFare, wpServiceCharge, wpServiceTax } = action.payload;
      state.trainBtwnStnsList = state.trainBtwnStnsList.map((train: { trainNumber: string; availability: any[]; }) => {
        if (train.trainNumber === trainNumber) {
          let availabilityUpdated = false; // Track if availability was updated

          const updatedAvailability = train.availability.map((avl) => {
            if (avl.enqClass === enqClass && avl.quota === quota) {
              availabilityUpdated = true;
              return {
                ...avl,
                availability: avlDayList,
                ...(fare !== undefined && { fare }),
                ...(agentFee !== undefined && { agentFee }),
                ...(pgCharge !== undefined && { pgCharge }),
                ...(totalFare !== undefined && { totalFare }),
                ...(wpServiceCharge !== undefined && { wpServiceCharge }),
                ...(wpServiceTax !== undefined && { wpServiceTax })
              };
            }
            return avl;
          });

          // If no matching availability was found, create a new one
          if (!availabilityUpdated) {
            updatedAvailability.push({
              enqClass,
              quota,
              availability: avlDayList, // Add new entry
              fare: 0,
              agentFee: "0",
              pgCharge: "0",
              totalFare: "0",
              wpServiceCharge: "0",
              wpServiceTax: "0"
            });
          }

          return {
            ...train,
            availability: updatedAvailability
          };
        }
        return train;
      }) as TrainType[];
    },
    updateFromStnCode: (state, action: PayloadAction<{ trainNumber: string; fromStnCode: string }>) => {
      const { trainNumber, fromStnCode } = action.payload;
      const train = state.trainBtwnStnsList.find((train: { trainNumber: string; }) => train.trainNumber === trainNumber);
      if (train) {
        train.fromStnCode = fromStnCode; // ✅ Directly update state (Immer takes care of immutability)
      }
    },
    updateToStnCode: (state, action: PayloadAction<{ trainNumber: string; toStnCode: string }>) => {
      const { trainNumber, toStnCode } = action.payload;

      state.trainBtwnStnsList = state.trainBtwnStnsList.map((train: { trainNumber: string; }) =>
        train.trainNumber === trainNumber ? { ...train, toStnCode } : train
      ) as TrainType[];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainsBetweenStations.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.journeyDate = null;
      })
      .addCase(fetchTrainsBetweenStations.fulfilled, (state, action: PayloadAction<TrainApiResponse>) => {
        state.status = 'succeeded';
        state.quotaList = action.payload.quotaList;
        state.journeyDate = action.payload.journeyDate;
        // Build trains array first
        let trains = action.payload.trainBtwnStnsList.map((train: { fromStnCode: any; toStnCode: any; }) => ({
          ...train,
          initialFromStnCode: train.fromStnCode, // ✅ Set initial value
          initialToStnCode: train.toStnCode      // ✅ Set initial value
        })) as TrainType[];

        // 🔑 Default sort by departureTime ASC
        trains = [...trains].sort((a, b) => {
          const timeToMinutes = (time: string | undefined) => {
            if (!time) return Number.MAX_SAFE_INTEGER;
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
          };
          return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
        });

        state.trainBtwnStnsList = trains;
        // Save sortConfig so SortingCard stays in sync
        state.sortConfig = { key: 'departureTime', direction: 'asc' }; // ✅
      })
      .addCase(fetchTrainsBetweenStations.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { clearTrainData, sortTrains, setFilters, updateTrainAvailability, updateToStnCode, updateFromStnCode } = trainBetweenStationSlice.actions;
export default trainBetweenStationSlice.reducer;
