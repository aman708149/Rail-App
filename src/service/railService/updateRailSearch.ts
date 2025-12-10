import axiosInstance from "@/src/utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use Expo env variable instead of Next.js one
const baseurl = process.env.EXPO_PUBLIC_BACKEND_API_URL;

// Function to update rail search preferences
export const updateRailSearchPreferences = async (pref: number) => {
  try {
    // Save to AsyncStorage (persistent storage)
    await AsyncStorage.setItem("searchType", String(pref));

    // Make API request
    const response = await axiosInstance.put(
      `${baseurl}/user/user-preferences/rail/update-search-prefrences`,
      { pref }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error updating rail search preferences:", error);
    throw error;
  }
};
