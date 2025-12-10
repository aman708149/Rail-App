// src/services/railApi.ts

import axiosInstance from "@/src/utils/axios";


// ✅ Using your Expo env vars
const reportingurl = process.env.EXPO_PUBLIC_REPORTING_API_URL as string;
const railurl = process.env.EXPO_PUBLIC_RAIL_API_URL as string;
const transactionurl = process.env.EXPO_PUBLIC_TRANSACTION_SERVICE as string;
const reportingUploadUrl = process.env.EXPO_PUBLIC_REPORTING_UPLOAD_API_URL as string;
const reconciliationUrl = process.env.EXPO_PUBLIC_REPORTING_RECONCILIATION_API as string;

// =========================
// RAIL BOOKINGS / REPORTING
// =========================

export function GetRailBookingsService(data: any) {
  return axiosInstance.post(`${reportingurl}/railbookingreport`, data, {
  });
}

export function GetinitialReportService(data: any) {
  return axiosInstance.post(`${reportingurl}/railbookingreport/report`, data, {
  });
}

// =========================
// CANCELLATION & REFUND
// =========================

export function GetRailCancellationService(
  fromdate: string,
  todate: string,
  page: number,
  limit: number,
  OTPstatus: string,
  RefundStatus: string,
  searchoption?: string
) {
  const params = {
    fromdate,
    todate,
    page,
    limit,
    OTPstatus,
    RefundStatus,
    searchoption,
  };

  return axiosInstance.get(`${railurl}/cancellation/getCancelationDetails`, {
    params,
  });
}

export function GetRailRefundService(
  fromdate: string,
  todate: string,
  page: number,
  limit: number,
  OTPstatus: string,
  RefundStatus: string,
  searchoption: string,
  sortField: string,
  sortDirection: string
) {
  const params = {
    searchoption,
    sortField,
    sortDirection,
  };

  return axiosInstance.get(
    `${railurl}/cancellation/getrefunddetails/${fromdate}/${todate}/${page}/${limit}/${OTPstatus}/${RefundStatus}`,
    {
      params,
    }
  );
}

// =========================
// RAIL BOOKINGS (MONGO)
// =========================

export async function GetRailBookingsMongo(
  fromDate: string,
  toDate: string,
  page: number,
  limit: number,
  filter: string = "",
  status: string = ""
) {
  return await axiosInstance.get(`${railurl}/raikpayrequest/railbookings`, {
    params: { fromDate, toDate, page, limit, filter, status },
  });
}

// =========================
// TRANSACTION WEBHOOKS
// =========================

export async function SendWebHookService(journalID: number) {
  return await axiosInstance.get(`${transactionurl}/webhook/${journalID}`, {
  });
}

export async function SendWebHookOrderService(txnId: string) {
  return await axiosInstance.get(`${transactionurl}/webhook/order/${txnId}`, {
  });
}

// =========================
// LEDGER / REPORT LINKS
// =========================

export async function GetallLinksService(limit: number, currentPage: number) {
  return await axiosInstance.get(
    `${reportingurl}/ledgerreport/allreportgenerated/${limit}/${currentPage}`,
  );
}

// =========================
// EXCEL FILE DOWNLOAD
// =========================

export async function GetExelFileByKey(reportKey: string) {
  try {
    const response = await axiosInstance.get(
      `${reportingurl}/ledgerreport/download`,
      {
        params: { reportKey },
        responseType: "arraybuffer",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Failed to download the file:", error);
    throw error;
  }
}

// =========================
// SEND REPORT IN EMAIL
// =========================

export async function sendReportInEmailByKey(
  reportKey: string,
  reportType: string
) {
  return await axiosInstance.post(
    `${reportingurl}/apiutils/reports/send-to-email`,
    { reportKey, reportType },
  );
}

// =========================
// GENERATE REPORTS
// =========================

export async function GenerateOrderReport(
  FromDate: string,
  ToDate: string,
  userortxn?: string
) {
  return await axiosInstance.post(
    `${reportingurl}/orders/generateexel`,
    { FromDate, ToDate, userortxn }
  );
}

export async function GenerateRailBookingsReport(
  FromDate: string,
  ToDate: string,
  filter: string
) {
  return await axiosInstance.get(`${reportingurl}/railbookingreport/generate`, {
    params: { FromDate, ToDate, filter },
  });
}

export async function GenerateRailCancellationReport(
  FromDate: string,
  ToDate: string,
  OTPstatus: string,
  RefundStatus: string
) {
  return await axiosInstance.get(
    `${reportingurl}/cancellationreport/generate/${FromDate}/${ToDate}/${OTPstatus}/${RefundStatus}`,
  );
}

// =========================
// (OPTIONAL) RECONCILIATION / UPLOAD APIs
// If you use EXPO_PUBLIC_REPORTING_RECONCILIATION_API or UPLOAD_API_URL
// =========================

export async function UploadReconciliationFile(formData: FormData) {
  // only if you actually call this somewhere
  return await axiosInstance.post(
    `${reportingUploadUrl}/reconciliation/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
}

export async function GetReconciliationStatus(reportId: string) {
  return await axiosInstance.get(`${reconciliationUrl}/reconciliation/${reportId}`, {
  });
}
