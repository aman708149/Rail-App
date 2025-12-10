// import axios from 'axios';
// import { Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { router } from 'expo-router'; // if you’re using expo-router
// import displayNetworkError from '@/components/Layout/displayNetworkError';

// const axiosInstance = axios.create({
//   timeout: 30000,
//   withCredentials: true,
// });

// // ✅ Add interceptors for handling responses and errors
// axiosInstance.interceptors.response.use(
//   response => response,
//   async error => {
//     // Handle network errors
//     if (!error.response) {
//       displayNetworkError(error);
//       return Promise.reject(error);
//     }

//     const status = error.response.status;

//     // ✅ Handle unauthorized (401) case
//     if (status === 401) {
//       try {
//         // Check if a referrer exists (you can store it in AsyncStorage if needed)
//         const referrer = await AsyncStorage.getItem('referrer');
//         if (referrer) {
//         //   router.replace(referrer); // redirect back if referrer found
//           return;
//         }

//         // Otherwise redirect to login screen
//         // router.replace('/auth/login');
//         return;
//       } catch (storageError) {
//         console.error('Error accessing AsyncStorage:', storageError);
//       }
//     }

//     // ✅ Handle forbidden (403) case
//     if (status === 403) {
//       Alert.alert('Access Denied', 'You do not have permission to access this resource.');
//       // You can optionally redirect
//       // router.replace('/auth/forbidden');
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;


import axios from "axios";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import displayNetworkError from "../components/Layout/displayNetworkError";
import { showMessage } from "./showMessage";

const axiosInstance = axios.create({
  timeout: 30000,
  withCredentials: true,
});

// 🚫 Endpoints that should NOT include the token
const NO_AUTH_PATHS = [
  "/auth/login",
  "/auth/loginWithOtp",
  "/auth/magiclinklogin",
  "/auth/magiclinkloginWithOtp",
  "/auth/register",
  "/otpverification/request-otp-reset",
  "/otpverification/verify-otp-reset",
  "/forgetpassword",
  "/initializeapp/admin",
];

// ✅ Request Interceptor → attach token except for excluded paths
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Skip adding token for public endpoints
      const shouldSkip = NO_AUTH_PATHS.some((path) => config.url?.includes(path));
      if (!shouldSkip) {
        const token = await AsyncStorage.getItem("auth-token");
        // console.log("Auth token is", token)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error("Error reading auth-token from storage:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor → handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      displayNetworkError(error);
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🔒 Handle unauthorized (401)
    if (status === 401) {
      try {
        // Clear invalid token
        // await AsyncStorage.removeItem("auth-token");

        // Optionally store referrer before redirect
        // const currentRoute = router?.asPath || "";
        const referrer = await AsyncStorage.getItem('referrer');

        // Redirect to login (uncomment in production)
        // router.replace("/auth/login");
      } catch (storageError) {
        console.error("Error clearing AsyncStorage:", storageError);
      }
    }

    // 🚫 Handle forbidden (403)
    if (status === 403) {
    showMessage("Access Denied", "You do not have permission to access this resource.");
      // router.replace("/auth/forbidden"); // optional
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

