// apiServices.ts  (React Native / Expo Version)

import axiosInstance from "@/src/utils/axios";

// React Native uses EXPO_PUBLIC_ instead of NEXT_PUBLIC_
const RAIL_BASE_URL = process.env.EXPO_PUBLIC_RAIL_APP_BASE_URL;
const USER_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

// 1️⃣ Save Base Error
export const SaveBaseError = (error: string, railbookingID: string) => {
  return axiosInstance.post(`${RAIL_BASE_URL}/raikpayrequest/savebaseerror`, {
    error,
    railbookingID,
  });
};

// 2️⃣ Get Requisition Details
export const GetRequisitionDetailService = (railbookingID: string) => {
  return axiosInstance.get(
    `${RAIL_BASE_URL}/railtktbookingstatus/requisition-details/${railbookingID}`
  );
};

// 3️⃣ Booking Chart (Simple Filter)
export const GetRailBookingChartDetailViaFilterService = (filter: string) => {
  return axiosInstance.get(
    `${RAIL_BASE_URL}/rail/booking-chart/getBookingChart?chartType=${filter}`
  );
};

// 4️⃣ Booking Chart (With Date Range)
export const GetRailBookingChartDetailViaCustomFilterService = (
  filter: string,
  startDate: string = "",
  endDate: string = ""
) => {
  const dateRangeParam =
    startDate && endDate ? `&fromDate=${startDate}&toDate=${endDate}` : "";

  return axiosInstance.get(
    `${RAIL_BASE_URL}/rail/booking-chart/getBookingChart?chartType=${filter}${dateRangeParam}`
  );
};

export const DownloadSelectedBookingService = (bookingIDs: string[]) => {
  return axiosInstance.post(
    `${USER_BASE_URL}/apiutils/downloadSelectedBooking`,
    {
      bookingIDs: bookingIDs,
    },
    {
      responseType: 'blob',
    }
  );
};
