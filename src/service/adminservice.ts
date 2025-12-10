import axiosInstance from "../utils/axios";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;
const TRANSACTION_SERVICE = process.env.EXPO_PUBLIC_TRANSACTION_SERVICE;
const REPORTING_API_URL = process.env.EXPO_PUBLIC_REPORTING_API_URL;
const RAIL_API_URL = process.env.EXPO_PUBLIC_RAIL_API_URL;

/**
 * ============================
 * PARTNER MANAGEMENT SERVICES
 * ============================
 */

// Invite partner
export const invitePartner = async (
  email: string,
  mobile: string,
  status: string,
  userID: string
) => {
  const response = await axiosInstance.post(`${BASE_URL}/invitepartner`, {
    email,
    mobile,
    status,
    userID,
  });
  return response.data;
};

// Get all pending partners
export const GetallPendingPartner = async (page: number, limit: number) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/partnerlist/pending/${page}/${limit}`
  );
  return response.data;
};

// Get partner by ID
export const fetchPartnerbyID = async (partnerid: string) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/partnerlist/partnerdetails/${partnerid}`
  );
  return response.data;
};

// Approve Partner
export const AprrovePartnerStatus = async (partnerid: string) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/partnerlist/approvepartner/${partnerid}`
  );
  return response.data;
};

// Reject Partner
export const RejectPartnerStatus = async (partnerid: string, message: string) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/partnerlist/rejectpartner/${partnerid}`,
    { message }
  );
  return response.data;
};

// Search Partner
export const SearchPartnerService = async (searchitem: string) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/partnerlist/search/${searchitem}`
  );
  return response.data;
};

// Get all partners (paginated)
export const getAllPartnerApi = async (
  page: number,
  limit: number,
  search: string
) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/partnerlist/allPartner?page=${page}&limit=${limit}&search=${search}`
  );
  return response.data;
};

/**
 * ============================
 * DEFINE FUNCTION SERVICES
 * ============================
 */
export const GetDefineFunctionBYID = async (id: string) => {
  const response = await axiosInstance.get(`${BASE_URL}/definefunction/${id}`);
  return response.data;
};

export const PostDefineFunction = async (data: any) => {
  const response = await axiosInstance.post(`${BASE_URL}/definefunction`, data);
  return response.data;
};

export const UpdateDefineFunction = async (id: string, data: any) => {
  const response = await axiosInstance.put(
    `${BASE_URL}/definefunction/${id}`,
    data
  );
  return response.data;
};

export const DeleteDefineFunction = async (id: string) => {
  const response = await axiosInstance.delete(`${BASE_URL}/definefunction/${id}`);
  return response.data;
};

export const GetallDefineFunction = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/definefunction`);
  return response.data;
};

/**
 * ============================
 * DYNAMIC MENU SERVICES
 * ============================
 */
export const GetItemsService = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/dynamicmenu`);
  return response.data;
};

export const UpdateItemsservice = async (data: any) => {
  const response = await axiosInstance.post(`${BASE_URL}/dynamicmenu`, data);
  return response.data;
};

export const AddNewItemService = async (data: any) => {
  const response = await axiosInstance.post(
    `${BASE_URL}/dynamicmenu/additem`,
    data
  );
  return response.data;
};

export const DisableItemService = async (id: string) => {
  const response = await axiosInstance.put(`${BASE_URL}/dynamicmenu/disable/${id}`);
  return response.data;
};

/**
 * ============================
 * RAIL CHARGE PLAN SERVICES
 * ============================
 */
export const GetallRailChargePlan = async () => {
  const response = await axiosInstance.get(
    `${BASE_URL}/railchargeplan/getplans`
  );
  return response.data;
};

export const getPlanURL = (editMode: boolean, currentPlanId: any) =>
  editMode
    ? `${BASE_URL}/railchargeplan/updateplan/${currentPlanId}`
    : `${BASE_URL}/railchargeplan/addplan`;

/**
 * ============================
 * REGULATORY VALUE SERVICES
 * ============================
 */
export const GetallRegularityvalue = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/regulatoryvalue`);
  return response.data;
};

export const EditRegularityvalueservice = async (variablename: string) => {
  const response = await axiosInstance.get(
    `${BASE_URL}/regulatoryvalue/${variablename}`
  );
  return response.data;
};

export const getRegularitoryUrl = (editMode: boolean, variablename: any) =>
  editMode
    ? `${BASE_URL}/regulatoryvalue/${variablename}`
    : `${BASE_URL}/regulatoryvalue`;

/**
 * ============================
 * BANK SERVICES
 * ============================
 */
export const AddnewBankService = async (data: any) => {
  const response = await axiosInstance.post(`${TRANSACTION_SERVICE}/addbank`, data);
  return response.data;
};

export const GetallBankservice = async () => {
  const response = await axiosInstance.get(`${TRANSACTION_SERVICE}/addbank`);
  return response.data;
};

export const GetBankByIDservice = async (bankid: number) => {
  const response = await axiosInstance.get(
    `${TRANSACTION_SERVICE}/addbank/${bankid}`
  );
  return response.data;
};

export const UpdateBankService = async (data: any, bankid: number) => {
  const response = await axiosInstance.put(
    `${TRANSACTION_SERVICE}/addbank/${bankid}`,
    data
  );
  return response.data;
};

/**
 * ============================
 * DEPOSIT REQUEST SERVICES
 * ============================
 */
export const Getalldepositrequests = async (data: any) => {
  const response = await axiosInstance.post(
    `${TRANSACTION_SERVICE}/depositrequest/getall`,
    data
  );
  return response.data;
};

export const ApproveDepositrequestservice = async (data: any) => {
  const response = await axiosInstance.put(
    `${TRANSACTION_SERVICE}/depositrequest/approve/${data.RequestID}`,
    data
  );
  return response.data;
};

export const RejectDepositrequestservice = async (data: any) => {
  const response = await axiosInstance.put(
    `${TRANSACTION_SERVICE}/depositrequest/reject/${data.RequestID}`,
    data
  );
  return response.data;
};

export const GetDepositRequestbyrequestId = async (requestid: string) => {
  const response = await axiosInstance.get(
    `${TRANSACTION_SERVICE}/depositrequest/${requestid}`
  );
  return response.data;
};

/**
 * ============================
 * GST & DEBIT NOTE SERVICES
 * ============================
 */
export const CalculateGstService = async (
  amount: number,
  partnerstate: string,
  gstInclusion: string
) => {
  const response = await axiosInstance.get(
    `${TRANSACTION_SERVICE}/debitnote/${amount}/${partnerstate}/${gstInclusion}`
  );
  return response.data;
};

export const SubmitDebitNoteService = async (data: any) => {
  const response = await axiosInstance.post(
    `${TRANSACTION_SERVICE}/debitnote`,
    data
  );
  return response.data;
};

/**
 * ============================
 * CREDIT NOTE SERVICES
 * ============================
 */
export const AddCreditNoteService = async (data: any) => {
  const response = await axiosInstance.post(
    `${TRANSACTION_SERVICE}/creditnote`,
    data
  );
  return response.data;
};

export const GetallCreditNoteService = async () => {
  const response = await axiosInstance.get(`${TRANSACTION_SERVICE}/creditnote`);
  return response.data;
};

/**
 * ============================
 * REPORTING SERVICES
 * ============================
 */
export const GetirctcupreportService = async (
  fromDate: string,
  toDate: string,
  page: number,
  pagecount: number,
  search: string
) => {
  const response = await axiosInstance.get(
    `${REPORTING_API_URL}/admin/irctcupreport/${pagecount}/${page}/${fromDate}/${toDate}/${search}`
  );
  return response.data;
};

export const GenerateDepositRequestFile = async (from: string, to: string) => {
  const response = await axiosInstance.get(
    `${REPORTING_API_URL}/admin/depositrequest/generatefile/${from}/${to}`
  );
  return response.data;
};

export const GetNotificationsService = async () => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/notifications`);
    return response;
  } catch (error) {
    // Throw an error which can be caught and handled where GetNotificationsService is called
    throw error;
  }
};

/**
 * ============================
 * RAIL SERVICES
 * ============================
 */
export const GetRDSBalanceservice = async () => {
  const response = await axiosInstance.post(
    `${RAIL_API_URL}/rdsbalance-enquery`
  );
  return response.data;
};

export const GetRDSBalanceAlertservice = async () => {
  const response = await axiosInstance.get(
    `${RAIL_API_URL}/rdsbalance-enquery/get-alert`
  );
  return response.data;
};

export const SetRDSBalanceAlertService = async (minBalanceAlert: number) => {
  const response = await axiosInstance.post(
    `${RAIL_API_URL}/rdsbalance-enquery/set-alert`,
    { alertAmount: minBalanceAlert }
  );
  return response.data;
};
