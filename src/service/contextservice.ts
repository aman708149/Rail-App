import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../utils/axios";

const userservice = process.env.EXPO_PUBLIC_BACKEND_API_URL;

export async function GetuserRoleService() {
  try {
    // 🔐 Get token from AsyncStorage if you’re storing login tokens there
    const token = await AsyncStorage.getItem("auth-token");

    const response = await axiosInstance.get(`${userservice}/auth/roles`);
    console.log("user role data is ", response.data)

    return response.data;
    
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw error;
  }
}
