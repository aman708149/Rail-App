import axiosInstance from "../utils/axios";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || "https://your-backend-url.com";

export const FetchDynamicMenu = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/dynamicmenu/getall`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching dynamic menu:", error);
    throw error;
  }
};
