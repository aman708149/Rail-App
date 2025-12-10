// import axios from 'axios';
// import CryptoJS from 'crypto-js';
// import * as Device from 'expo-device';
// import * as Localization from 'expo-localization';
// import * as Network from 'expo-network';
// import Constants from 'expo-constants';

// const encryptData = (data: string) => {
//   const secretKey = process.env.EXPO_PUBLIC_FINGER_PRINT_TOKEN || '';
//   return CryptoJS.AES.encrypt(data, secretKey).toString();
// };

// function customDecode(encoded: string) {
//   const octets = encoded.split('_');
//   return octets.map((octet: string) => octet.split('').reverse().join('')).join('.');
// }

// export async function generateFingerprint() {
//   try {
//     // Normalize URL
//     const apiBase = process.env.EXPO_PUBLIC_FRONTEND_API_URL || '';
//     const normalizedUrl = `${apiBase}/api/get-ip`.replace(/([^:]\/)\/+/g, '$1');

//     // Get public IP
//     const response = await axios.get(normalizedUrl, {
//       headers: { Accept: 'application/json' },
//     });
//     const userIp = customDecode(response.data.ip);

//     // Locale info
//     const locales = Localization.getLocales();
//     const calendars = Localization.getCalendars();
//     const primaryLocale = locales[0] || {};
//     const primaryCalendar = calendars[0] || {};

//     // Device + system info
//     const clientInfo = {
//       device: {
//         manufacturer: Device.manufacturer || 'Unknown',
//         modelName: Device.modelName || 'Unknown',
//         osName: Device.osName,
//         osVersion: Device.osVersion,
//         brand: Device.brand,
//         deviceType: Device.deviceType === 1 ? 'Phone' : 'Tablet',
//       },
//       system: {
//         appOwnership: Constants.appOwnership,
//         appVersion: Constants.nativeAppVersion,
//         appBuild: Constants.nativeBuildVersion,
//       },
//       network: await Network.getNetworkStateAsync(),
//       locale: {
//         languageTag: primaryLocale.languageTag || 'unknown',
//         languageCode: primaryLocale.languageCode || 'unknown',
//         regionCode: primaryLocale.regionCode || 'unknown',
//         timezone: primaryCalendar.timeZone || 'unknown',
//       },
//     };

//     const fingerprintData = {
//       f_token: clientInfo,
//       ip: userIp,
//       generatedAt: new Date().toISOString(),
//     };

//     return encryptData(JSON.stringify(fingerprintData));
//   } catch (error) {
//     console.error('Error generating fingerprint:');
//     throw error;
//   }
// }


import axios from "axios";
import * as Device from "expo-device";
import * as Localization from "expo-localization";
import * as Network from "expo-network";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";

// ------------------------------
// SECURE HASH FUNCTION
// ------------------------------
async function encryptData(data: string) {
  try {
    const secretKey = process.env.EXPO_PUBLIC_FINGER_PRINT_TOKEN || "";

    // SHA256 hash (Stable in Expo Go)
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      secretKey + ":" + data
    );

    return hash;
  } catch (err) {
    console.log("❌ Encryption error:", err);
    return "encryption_failed";
  }
}

// ------------------------------
// CUSTOM IP DECODER
// ------------------------------
function customDecode(encoded: string) {
  const octets = encoded.split("_");
  return octets.map((oct) => oct.split("").reverse().join("")).join(".");
}

// ------------------------------
// MAIN FINGERPRINT FUNCTION
// ------------------------------
export async function generateFingerprint() {
  try {
    // Normalize URL
    const apiBase = process.env.EXPO_PUBLIC_FRONTEND_API_URL || "";
    const normalizedUrl = `${apiBase}/api/get-ip`.replace(/([^:]\/)\/+/g, "$1");

    let userIp = "unknown";

    // --------------------------
    // TRY FETCH PUBLIC IP
    // --------------------------
    try {
      const response = await axios.get(normalizedUrl);
      if (response?.data?.ip) {
        userIp = customDecode(response.data.ip);
      }
    } catch (err) {
      console.log("⚠️ Failed to fetch IP:", err);
    }

    // --------------------------
    // LOCALE INFORMATION
    // --------------------------
    const locales = Localization.getLocales() || [{}];
    const calendars = Localization.getCalendars() || [{}];

    const primaryLocale = locales[0] || {};
    const primaryCalendar = calendars[0] || {};

    // --------------------------
    // NETWORK STATE
    // --------------------------
    let networkState = {};
    try {
      networkState = await Network.getNetworkStateAsync();
    } catch (err) {
      console.log("⚠️ Network state failed:", err);
    }

    // --------------------------
    // DEVICE + SYSTEM INFO
    // --------------------------
    const clientInfo = {
      device: {
        manufacturer: Device.manufacturer || "Unknown",
        modelName: Device.modelName || "Unknown",
        osName: Device.osName || "Unknown",
        osVersion: Device.osVersion || "Unknown",
        brand: Device.brand || "Unknown",
        deviceType: Device.deviceType === 1 ? "Phone" : "Tablet",
      },
      system: {
        appOwnership: Constants.appOwnership || "unknown",
        appVersion: Constants.nativeAppVersion || "unknown",
        appBuild: Constants.nativeBuildVersion || "unknown",
      },
      network: networkState,
      locale: {
        languageTag: primaryLocale.languageTag || "unknown",
        languageCode: primaryLocale.languageCode || "unknown",
        regionCode: primaryLocale.regionCode || "unknown",
        timezone: primaryCalendar.timeZone || "unknown",
      },
    };

    // --------------------------
    // FINAL FINGERPRINT DATA
    // --------------------------
    const fingerprintData = {
      f_token: clientInfo,
      ip: userIp,
      generatedAt: new Date().toISOString(),
    };

    // --------------------------
    // ENCRYPT / HASH IT
    // --------------------------
    return await encryptData(JSON.stringify(fingerprintData));
  } catch (error) {
    console.log("🔥 REAL FINGERPRINT ERROR:", error);
    throw error;
  }
}


