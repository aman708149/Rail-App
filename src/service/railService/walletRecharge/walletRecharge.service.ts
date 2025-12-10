
import axiosInstance from "@/src/utils/axios";


const baseUrl = process.env.EXPO_PUBLIC_BACKEND_API_URL;

/**
 * ✅ Check Wallet Balance
 */
export const CheckWalletBalanceService = async () => {
  return axiosInstance.get(`${baseUrl}/agent/wallet/wallet-recharge/get-balance`);
};

/**
 * ✅ Generate Dynamic QR Code for Wallet Recharge
 */
export const GenerateDynamicQRCodeService = async (
  transactionId: string,
  amountforQR: number
) => {
  return axiosInstance.post(
    `${baseUrl}/agent/wallet/wallet-recharge/generate-qr-code/${transactionId}`,
    { amountforQR }
  );
};

/**
 * ✅ Check Payment Status of QR Transaction
 */
export const CheckPaymentStatusService = async (
  transactionId: string,
  railBookingId: string
) => {
  return axiosInstance.get(
    `${baseUrl}/agent/wallet/wallet-recharge/checkpayment-status/${transactionId}/${railBookingId}`
  );
};
