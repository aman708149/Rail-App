import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import axiosInstance from "../utils/axios";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;
const apiUrl = (path: string) => `${BASE_URL}${path}`;

/* ----------------------------- Get User Profile ----------------------------- */
export async function getUserProfileDataApi(): Promise<any> {
  try {
    const response = await axiosInstance.get(apiUrl("/userprofile"));
    return response.data;
  } catch (error) {
    console.error("getUserProfileDataApi error:", error);
    throw error;
  }
}

/* ----------------------------- Upload Images ----------------------------- */
async function uploadImageApi(endpoint: string, imageUri: string): Promise<any> {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "upload.jpg",
      type: "image/jpeg",
    } as any);

    const response = await axios.post(apiUrl(endpoint), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export const uploadCompanyLogoApi = (uri: string) =>
  uploadImageApi("/userprofile/upload-company-logo", uri);

export const uploadLargeCompanyLogoApi = (uri: string) =>
  uploadImageApi("/userprofile/upload-large-company-logo", uri);

export const uploadUserProfileImageApi = (uri: string) =>
  uploadImageApi("/userprofile/upload-profile-image", uri);

/* ----------------------------- Download Images ----------------------------- */
async function downloadImage(endpoint: string, filename: string): Promise<string> {
  const downloadPath = `${FileSystem.cacheDirectory}${filename}`;
  const { uri } = await FileSystem.downloadAsync(apiUrl(endpoint), downloadPath);
  return uri;
}

export const getProfileImageApi = () =>
  downloadImage("/userprofile/get-profile-image", "profile.jpg");

export const getCompanyLogoApi = () =>
  downloadImage("/userprofile/get-company-logo", "company-logo.jpg");

export const getLargeCompanyLogoApi = () =>
  downloadImage("/userprofile/get-large-company-logo", "large-company-logo.jpg");

/* ----------------------------- Two-Factor Auth ----------------------------- */
export async function updateTwoFactorApi(status: boolean, otpCode?: string): Promise<any> {
  try {
    const otp = status && otpCode?.length === 6 ? otpCode : "";
    const response = await axiosInstance.post(apiUrl("/userprofile/update-two-factor"), {
      twoFactorStatus: status,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error("updateTwoFactorApi error:", error);
    throw error;
  }
}

export async function sendTwoFactorOtpApi(): Promise<any> {
  try {
    const response = await axiosInstance.post(apiUrl("/userprofile/two-factor-otp"));
    return response.data;
  } catch (error) {
    console.error("sendTwoFactorOtpApi error:", error);
    throw error;
  }
}

/* ----------------------------- Login Activity ----------------------------- */
export async function getLastLoginActivity(limit: number, page: number): Promise<any> {
  try {
    const response = await axiosInstance.get(apiUrl("/userprofile/login-activity"), {
      params: { limit, page },
    });
    return response.data;
  } catch (error) {
    console.error("getLastLoginActivity error:", error);
    throw error;
  }
}

/* ----------------------------- Balance Alert ----------------------------- */
export async function updateMinimumBalanceAlertValueApi(
  minBalanceAlertValue: number
): Promise<any> {
  try {
    const response = await axiosInstance.post(
      apiUrl("/userprofile/update-min-balance-alert"),
      { minBalanceAlertValue }
    );
    return response.data;
  } catch (error) {
    console.error("updateMinimumBalanceAlertValueApi error:", error);
    throw error;
  }
}

export async function updateMinBalanceAlertStatus(
  isMinBalanceAlertEnabled: boolean
): Promise<any> {
  try {
    const response = await axiosInstance.post(
      apiUrl("/userprofile/update-min-balance-alert-status"),
      { isMinBalanceAlertEnabled }
    );
    return response.data;
  } catch (error) {
    console.error("updateMinBalanceAlertStatus error:", error);
    throw error;
  }
}

/* ----------------------------- Booking Mode Access ----------------------------- */
export const updateBookingModeAccessApi = async (
  partnerId: string,
  modeType: string,
  status: boolean
) => {
  try {
    const response = await axiosInstance.post(
      apiUrl(`/booking-mode/update-booking-mode-access/${partnerId}`),
      { modeType, status }
    );
    return response.data;
  } catch (error) {
    console.error("updateBookingModeAccessApi error:", error);
    throw error;
  }
};

/* ----------------------------- User Preferences ----------------------------- */
export const getUserPreferences = async () => {
  try {
    const response = await axiosInstance.get(apiUrl("/user/user-preferences/get"));
    return response.data;
  } catch (error) {
    console.error("getUserPreferences error:", error);
    throw error;
  }
};
