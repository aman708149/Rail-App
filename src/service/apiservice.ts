import axios from "axios";
import axiosInstance from "../utils/axios";

const BASE_URL = process.env.EXPO_PUBLIC_RAIL_API_URL;
const userapiurl = process.env.EXPO_PUBLIC_BACKEND_API_URL;

// ✅ Common pattern for GET requests
export const GetCurrentTimestamp = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/timestamp/getcurrenttimestamp`);
  return response.data;
};

// ✅ Station suggestions
export const stationService = {
  async fetchStationSuggestions(searchType: string, searchString: string) {
    const response = await axiosInstance.get(`${BASE_URL}/stationlist/`, {
      params: { searchString },
    });
    return response.data;
  },
};

// ✅ Train availability
export async function fetchTrainAvailability({
  trainNo,
  formattedSeachDate,
  frmStn,
  toStn,
  jClass,
  jQuota,
  paymentEnqFlag,
  source,
  daylimit,
  formaterunningDaystring,
}: {
  trainNo: string;
  formattedSeachDate: string;
  frmStn: string;
  toStn: string;
  jClass: string;
  jQuota: string;
  paymentEnqFlag: string;
  source: string;
  daylimit: string;
  formaterunningDaystring: string;
}) {
  const url = `${BASE_URL}/trainavailability/${trainNo}/${formattedSeachDate}/${frmStn}/${toStn}/${jClass}/${jQuota}/${paymentEnqFlag}/${source}/${daylimit}/${formaterunningDaystring}`;
  const response = await axiosInstance.post(url);
  return response.data;
}

// trainavailability is a function that fetches train availability from the backend API'
export async function trainavailability(
  trainno: string,
  journeydate: string,
  fromstation: string,
  tostation: string,
  classcode: string,
  quota: string,
  source: string,
  paymentEnqFlag: string,  // Additional parameter
  daylimit: Number,        // Additional parameter
  formaterunningDaystring: string, // Additional parameter
  trainIndex: number,      // Additional parameter
  classIndex: number,      // Additional parameter
  jQuota: string           // Additional parameter
) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/trainavailability/${trainno}/${journeydate}/${fromstation}/${tostation}/${classcode}/${quota}/${source}/${paymentEnqFlag}/${daylimit}/${formaterunningDaystring}/${trainIndex}/${jQuota}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching train availability:", error);
    throw error;
  }
}

export async function trainavailabilitys(trainNo: string, formattedSeachDate: string, frmStn: string, toStn: string, jClass: string, jQuota: string, paymentEnqFlag: string, source: string, daylimit: any, formaterunningDaystring: string) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/trainavailability/${trainNo}/${formattedSeachDate}/${frmStn}/${toStn}/${jClass}/${jQuota}/${paymentEnqFlag}/${source}/${daylimit}/${formaterunningDaystring}`
      , null)
    return response;
  } catch (error) {
    console.error("Error fetching train availability:", error);
    throw error;
  }
}

// ✅ Upload certificate (React Native safe)
// export async function uploadCertificate(file: any) {
//   const formData = new FormData();
//   formData.append("file", {
//     uri: file.uri,
//     type: file.type || "application/octet-stream",
//     name: file.name || "certificate.dat",
//   } as any);

//   const response = await fetch(`${BASE_URL}/apiutils/checkcertificate`, {
//     method: "POST",
//     body: formData,
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }

//   return await response.json();
// }

// ✅ Train between stations
export async function trainbetweenstations(
  fromstation: string,
  tostation: string,
  journeydate: string,
  source: string
) {
  const url = `${BASE_URL}/trainbetweenstation/${journeydate}/${source}`;
  const response = await axiosInstance.get(url, {
    params: { fromstation, tostation },
  });
  return response.data;
}

// ✅ Pincode service
export async function pincodeService(pincode: string) {
  const response = await axiosInstance.get(`${BASE_URL}/pincode/${pincode}`);
  return response.data;
}

// ✅ Rail ticket review
export async function railTicketreviewData(railBookingID: string, journeydate: string) {
  const response = await axiosInstance.get(
    `${BASE_URL}/railtktreviewdata/${railBookingID}/${journeydate}`
  );
  return response
}

// ✅ Refresh Rail Profile
export async function RefreshRailProfileService() {
  return await axiosInstance.get(
    `${userapiurl}/agent/rail/railprofile/refresh`
  );
}

// ✅ Get Profile
export async function getProfileData(data: any) {
  const response = await axiosInstance.post(`${userapiurl}/auth/getprofile`, data);
  return response;
}

// ✅ Post Rail Query
export async function PostRailQuery(data: any) {
  const response = await axiosInstance.post(`${userapiurl}/customers/railquery`, data);
  return response.data;
}

// ✅ Get Last Mobile Service
export async function GetLastMobileservice(mobile: string) {
  const response = await axiosInstance.get(`${userapiurl}/customers/lastmobile/${mobile}`);
  return response.data;
}

export async function GetWsUserlogin() {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/railformbuilder/wsUserLogin`);
    return response;
  } catch (error) {
    throw error;
  }
}

//railformbuilder is a function that fetches railformbuilder from the backend API'
export async function railformbuilder(trainNo: string, jDate: string, Sfrom: string, Sto: string, JClass: string, JQuota: string, paymentEnqFlag: string, source: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/railformbuilder/${trainNo}/${jDate}/${Sfrom}/${Sto}/${JClass}/${JQuota}/${paymentEnqFlag}/${source}`,);
    return response;
  } catch (error) {
    console.error(":", error);
    throw error;
  }
}

export async function Railavconfig(data: any, url: string) {
  try {
    const response = axiosInstance.post(`${BASE_URL}/initiaterailbooking/${url}`, data);
    return response;
  } catch (error) {
    console.error("Error fetching Railavconfig:", error);
    throw error;
  }
}

export async function GetAvailabilityDateWise(enqparam: string[]) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/trainavailability/datewiseavailability`, { enqparam });
    return response;
  } catch (error) {
    console.error("Error fetching GetAvailabilityDateWise:", error);
    throw error;
  }
}

export async function RailFareCalculationService(className: string, fare: number) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/railfarecalc`, { class: className, fare });
    return response;
  } catch (error) {
    console.error("Error fetching RailFareCalculationService:", error);
    throw error;
  }
}


// ✅ Rail booking session
export async function Railbookingsession(data: any) {
  const response = await axiosInstance.post(`${BASE_URL}/railbookingsession`, data);
  return response.data;
}

// ✅ Rail charge calc
export async function RailchargecalcService(data: any) {
  const response = await axiosInstance.post(`${userapiurl}/railchargecalc`, data);
  return response.data;
}

// ✅ Get company logo (for RN, returns blob as base64)
export async function GetAgentAgencyLogo() {
  const response = await axiosInstance.get(`${userapiurl}/userprofile/get-company-logo`, {
    responseType: "arraybuffer",
  });
  const base64 = `data:image/png;base64,${Buffer.from(response.data, "binary").toString("base64")}`;
  return base64;
}

// ✅ Send OTP for mobile verification
export async function SendOTPForMobileVerification(mobile: string) {
  const response = await axiosInstance.post(`${userapiurl}/verifiedcontacts/sendotp/${mobile}`);
  return response.data;
}

// ✅ Get Station Name by Code
export async function GetStationNameByCode(stationCode: string) {
  const response = await axiosInstance.get(
    `${BASE_URL}/stationlist/stationName-by-code`,
    { params: { stationCode } }
  );
  return response.data;
}

export async function GetVerifiedContactservice(mobile: string) {
  try {
    const response = await axiosInstance.get(`${userapiurl}/verifiedcontacts/getverifiedmobile/${mobile}`);
    return response;
  } catch (error) {
    console.error("Error fetching GetVerifiedContacts:", error);
    throw error;
  }
}

export async function GetVerifiedEmailervice(email: string) {
  try {
    const response = await axiosInstance.get(`${userapiurl}/verifiedcontacts/getverifiedemail/${email}`);
    return response;
  } catch (error) {
    console.error("Error fetching GetVerifiedEmailervice:", error);
    throw error;
  }
}

// ✅ Verify OTP and Save Mobile
export async function VerifyOTPAndSaveMobile(mobile: string, otp: string) {
  const response = await axiosInstance.get(`${userapiurl}/verifiedcontacts/${mobile}/${otp}`);
  return response;
}

export async function VerifyOTPAndSaveEmail(email: string, otp: string) {
  try {
    const response = await axiosInstance.get(`${userapiurl}/verifiedcontacts/verifyemail/${email}/${otp}`);
    return response;
  } catch (error) {
    console.error("Error fetching VerifyOTPAndSaveEmail:", error);
    throw error;
  }
}

export async function SendOTPForEmailVerification(email: string) {
  try {
    const response = await axiosInstance.get(`${userapiurl}/verifiedcontacts/sendotponemail/${email}`);
    return response;
  } catch (error) {
    console.error("Error fetching SendOTPForEmailVerification:", error);
    throw error;
  }
}

export async function RailPayrequestservice(data: any) {
  try {
    return await axiosInstance.post(`${BASE_URL}/raikpayrequest`, data);
  } catch (error) {
    console.error("Error fetching FareDetailsService:", error);
    throw error;

  }
}

export async function RefreshBookingService(railbookingId: any) {
  try {
    return await axiosInstance.get(`${BASE_URL}/initiaterailbooking/refresh/${railbookingId}`);
  } catch (error) {
    console.error("Error fetching FareDetailsService:", error);
    throw error;
  }
}

export async function PendingBookingStatus(railBookingID: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/railtktbookingstatus/checkstatus/${railBookingID}`);
    return response;
  } catch (error) {
    console.error("Error fetching PendingBookingStatus:", error);
    throw error;
  }
}

export async function GetTicketbookingresponse(railBookingID: any) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/raikpayrequest/${railBookingID}`);
    return response;
  } catch (error) {
    console.error("Error fetching GetTicketbookingresponse:", error);
    throw error;
  }
}

export async function TrainScheduleService(trainNo: string, journeyDate: string, from: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/trainroute/${trainNo}/cache?jDate=${journeyDate}&sfrom=${from}`);
    return response;
  } catch (error) {
    console.error("Error fetching TrainScheduleService:", error);
    throw error;
  }
}

export async function ChangeBoardingPointservice(pnr: string, boardingPoint: string, stationName: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/changeboardingpoint/${pnr}/${boardingPoint}/${stationName}`);
    return response;
  } catch (error) {
    console.error("Error fetching ChangeBoardingPointservice:", error);
    throw error;
  }
}

export async function BoardingStationservice(trainNo: string, journeyDate: string, fromStation: string, toStation: string, classCode: string, source: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/boardingstation/${trainNo}/${journeyDate}/${fromStation}/${toStation}/${classCode}/${source}`);
    return response;
  } catch (error) {
    console.error("Error fetching BoardingStationservice:", error);
    throw error;
  }
}

export async function PNRHistoryService(wsUserLogin: string, pnr: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/historysearchbytxnid/${wsUserLogin}/${pnr}`);
    return response;
  } catch (error) {
    console.error("Error fetching PNRHistoryService:", error);
    throw error;
  }
}

export async function GetPNrDetailsService(pnr: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/pnrenquiry/${pnr}`);
    return response;
  } catch (error) {
    console.error("Error fetching GetPNrDetailsService:", error);
    throw error;
  }
}

export async function TDRReasonService(reservationId: string) {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/rail/filetdr/tdrreason/${reservationId}`);
    return response;
  } catch (error) {
    console.error("Error fetching TDRReasonService:", error);
    throw error;
  }
}

export async function Cancellationservice(reservationId: string, codestring: string) {
  const response = await axiosInstance.get(`${BASE_URL}/cancellation/${reservationId}/${codestring}`,
  )
  return response;
}

export async function SendOTPForCancellationService(ownerID: string, reservationId: string) {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/cancellation/partner/${ownerID}/${reservationId}`, {},);
    return response;
  } catch (error) {
    console.error("Error fetching SendOTPForCancellationService:", error);
    throw error;
  }
}

export async function SendOTPRailCancellationService(cancellationId: string, pnrNo: string) {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/otpauthentication/${pnrNo}/${cancellationId}`);
        return response;
    } catch (error) {
        console.error("Error fetching VerifyOTPRailCancellationService:", error);
        throw error;
    }
}

export async function VerifyOTPRailCancellationService(cancellationId: string, pnrNo: string, otp: string) {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/otpauthentication/${pnrNo}/${cancellationId}?otpcode=${otp}`);
        return response;
    } catch (error) {
        console.error("Error fetching VerifyOTPRailCancellationService:", error);
        throw error;
    }
}

export async function FileTDRService(data: any) {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/rail/filetdr`, data);
        return response;
    } catch (error) {
        console.error("Error fetching FileTDRService:", error);
        throw error;
    }
}



