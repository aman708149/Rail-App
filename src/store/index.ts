'use client'
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
// import menuReducer from './menu/menuSlice';
// import logoReducer from './menu/logoSlice';
// import birdeyeReducer from './rail/birdeyeview'; // Import your birdeyeview reducer
// import trainAvailabilityReducer from './rail/trainAvailability'; // Import your trainAvailabilityReducer
// import availabilityReducer from './rail/fetchAvailabilityByClass'; // Import your fetchAvailabilityByClass reducer
// import trainRouteReducer from './rail/trainRoute'; // Import your trainRoute reducer
// import raildashboardReducer from './rail/admin/rail/dashboard'; // Import your raildashboard reducer
// import trainDataReducer from './rail/groupbooking/railconfig'; // Import your trainData reducer
// import passengersReducer from './rail/groupbooking/passengerlist'; // Import your passengerlist reducer
// import activeGroupReducer from './rail/groupbooking/activeGroup'; // Import your activeGroup reducer
// import bookingOptionsReducer from './rail/groupbooking/bookingOptionsSlice'; // Import your bookingOptions reducer
// import refreshReducer from './reloaddata/refreshSlice'; // Import your refresh reducer
// import ExelFilePaxListReducer from './rail/groupbooking/ExelFilePaxList'; // Import your ExelFilePaxList reducer
import notificationReducer from './notificationSlice';
// import filterOptionReducer from './filterOption';
// import FiltersSliceReducer from './filters';
import trainRouteSliceReducer from './rail/train-route/trainRouteSlices';
import trainBetweenStationReducer from './rail/trainBetweenStation/trainSlice'
import timestampReducer from './timestampSlice';
import trainfiltersReducer from './rail/trainBetweenStation/filterSlice';
import trainSelectionReducer from './rail/trainBetweenStation/trainSelectionSlice';
import ActiveTrainSliceReducer from './rail/trainBetweenStation/ActiveTrainSlice';
import userPreferencesReducer from './userPreferencesSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    // menu: menuReducer,
    // logo: logoReducer,
    // birdeye: birdeyeReducer,
    // trainAvailability: trainAvailabilityReducer,
    // availability: availabilityReducer,
    // trainRoute: trainRouteReducer,
    // raildashboard: raildashboardReducer,
    // GroupBookingConfig: trainDataReducer, // Add your trainData reducer to the root reducer
    // groupList: passengersReducer,
    // activeGroup: activeGroupReducer,
    // bookingOptions: bookingOptionsReducer,
    // refresh: refreshReducer,
    // ExelFilepaxlist: ExelFilePaxListReducer,
    notification: notificationReducer,
    // filterOption: filterOptionReducer,
    // Filters: FiltersSliceReducer,
    trainRouteReducer: trainRouteSliceReducer,
    trainBetweenStation: trainBetweenStationReducer,
    timestamp: timestampReducer,
    trainfilters: trainfiltersReducer,
    trainSelection: trainSelectionReducer,
    ActiveTrainSlice: ActiveTrainSliceReducer,
     userPreferences: userPreferencesReducer,
});

export const store = configureStore({
    reducer: rootReducer,

});
export type RootStore = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

