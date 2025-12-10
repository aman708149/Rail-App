import axiosInstance from "@/src/utils/axios";
import { generateFingerprint } from "@/src/utils/generate-fingerprint";

// ✅ Base URLs from Expo env vars (use EXPO_PUBLIC_ prefix)
const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;
const RAIL_URL = process.env.EXPO_PUBLIC_RAIL_APP_BASE_URL;

// ✅ Common JSON headers
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ===================================================
// Admin creation
// ===================================================
export async function createAdmin(formDataObject: any) {
  const response = await axiosInstance.post(`${BASE_URL}/initializeapp/admin`, formDataObject, {
    headers: JSON_HEADERS,
  });
  return response.data;
}

// ===================================================
// OTP: Request new OTP for reset password
// ===================================================
export async function otpForResetPassword(formDataObject: any) {
  const response = await axiosInstance.post(`${BASE_URL}/otpverification/request-otp-reset`, formDataObject, {
    headers: JSON_HEADERS,
  });
  return response.data;
}

// ===================================================
// OTP: Verify OTP for reset password
// ===================================================
export async function verifyOtpForResetPassword(formDataObject: any) {
  const response = await axiosInstance.post(`${BASE_URL}/otpverification/verify-otp-reset`, formDataObject, {
    headers: JSON_HEADERS,
  });
  return response.data;
}

// ===================================================
// Check if admin user exists
// ===================================================
export async function checkUserExist() {
  const response = await axiosInstance.get(`${BASE_URL}/initializeapp/admin`);
  return response.data;
}

// ===================================================
// Login (Authenticate)
// ===================================================
export async function authenticate(formDataObject:any) {
  const fingerprint = await generateFingerprint();
  formDataObject.f_token = fingerprint;

  const response = await axiosInstance.post(`${BASE_URL}/auth/login`, formDataObject, {
    headers: JSON_HEADERS,
  });

  return response.data;
}

// ===================================================
// Login with OTP
// ===================================================
export async function authenticateWithOtp(formDataObject: any) {
  const fingerprint = await generateFingerprint();
  formDataObject.f_token = fingerprint;

  const response = await axiosInstance.post(`${BASE_URL}/auth/loginWithOtp`, formDataObject, {
    headers: JSON_HEADERS,
    withCredentials: true,
  });

  return response.data;
}

// ===================================================
// Logout user
// ===================================================
export async function logoutUser() {
  const fingerprint = await generateFingerprint();

  const response = await axiosInstance.post(`${BASE_URL}/auth/logout`, { f_token: fingerprint }, {
    headers: JSON_HEADERS,
    withCredentials: true,
  });

  return response.data;
}

// ===================================================
// Reset password (decrypt data)
// ===================================================
export const fetchAndDecryptDataForReset = async (encrypted: string) => {
  const decoded = decodeURIComponent(encrypted);
  const response = await axiosInstance.post(`${BASE_URL}/otpverification/decrypt-data-reset`, {
    encryptedData: decoded,
  });
  return response.data;
};

// ===================================================
// Reset password (final step)
// ===================================================
export const resetPassword = async (newPassword: any, token: any) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/resetpassword/reset-password`,
    { newPassword, token },
    {
      headers: {
        ...JSON_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ===================================================
// Forget password: find user by username or email
// ===================================================
export async function findUserByUsernameOrEmail(identifier: any) {
  const response = await axiosInstance.post(`${BASE_URL}/forgetpassword/${identifier}`);
  return response.data;
}

// ===================================================
// Send reset password mail
// ===================================================
export async function sendResetPasswordMail(userID: any) {
  const response = await axiosInstance.post(`${BASE_URL}/forgetpassword/sendemail/${userID}`);
  return response.data;
}

// ===================================================
// Authenticate with magic link
// ===================================================
export async function authenticateWithMagicLink(encdata: any) {
  const f_token = await generateFingerprint();

  const response = await axiosInstance.post(
    `${BASE_URL}/auth/magiclinklogin`,
    { encdata, f_token },
    { withCredentials: true }
  );

  return response.data;
}

// ===================================================
// Magic link login with OTP
// ===================================================
export async function magicLinkLoginWithOtp(encdata: any, otp = "") {
  const f_token = await generateFingerprint();

  const response = await axiosInstance.post(
    `${BASE_URL}/auth/magiclinkloginWithOtp`,
    { encdata, f_token, otp },
    { withCredentials: true }
  );

  return response.data;
}

// ===================================================
// Get requisition details (rail API)
// ===================================================
export async function getRequisitionDetailsService(requisitionId: any) {
  const response = await axiosInstance.get(`${RAIL_URL}/raikpayrequest/getrequisition/${requisitionId}`);
  return response.data;
}

// ===================================================
// Emulate login
// ===================================================
export const emulateLoginService = async (token: any) => {
  const response = await axiosInstance.post(`${BASE_URL}/auth/emulate-login`, { token });
  return response.data;
};
