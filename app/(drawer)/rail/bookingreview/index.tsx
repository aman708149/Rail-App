import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Linking,
  Platform,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { showMessage } from "@/src/utils/showMessage";
import {
  railTicketreviewData,
  RailPayrequestservice,
  GetVerifiedContactservice,
  GetVerifiedEmailervice,
  SendOTPForMobileVerification,
  SendOTPForEmailVerification,
  VerifyOTPAndSaveMobile,
  VerifyOTPAndSaveEmail,
  RefreshBookingService,
} from "@/src/service/apiservice";
import { Ionicons } from "@expo/vector-icons";
import IPAddress from "@/src/components/Rail/bookingreview/IPAdress";
import MarqueeNotice from "@/src/components/Rail/bookingreview/MarqueeNotice";
import RevealIRCTC from "@/src/components/Rail/settings/RevealPassword";
import { WebView } from "react-native-webview";

// Helper Functions
const formatDateForAPI = (date: string) => {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const formatNumberToSouthAsian = (num: number) => {
  return num.toLocaleString("en-IN");
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const DateWithDayAndMonth = (dateStr: string) => {
  if (!dateStr) return "";

  // Convert YYYYMMDD → YYYY-MM-DD
  if (/^\d{8}$/.test(dateStr)) {
    dateStr = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }

  // Convert DD-MM-YYYY → YYYY-MM-DD
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split("-");
    dateStr = `${yyyy}-${mm}-${dd}`;
  }

  // Convert DD/MM/YYYY → YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split("/");
    dateStr = `${yyyy}-${mm}-${dd}`;
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    console.warn("⚠ Invalid Arrival Date:", dateStr);
    return "Invalid Date";
  }

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};



const getReservationChoice = (choice: string) => {
  const choices: { [key: string]: string } = {
    "5": "Book if Confirm",
    "6": "Book if Confirm",
    "7": "Book if Confirm",
  };
  return choices[choice] || "None";
};

const getFoodValue = (food: string) => {
  const foodValues: { [key: string]: string } = {
    V: "Veg",
    N: "Non Veg",
    D: "No Food",
    J: "Jain Meal",
    F: "Veg (Diabetic)",
    G: "Non Veg (Diabetic)",
    T: "Tea/Coffee",
    E: "Evening Snacks (Veg)",
  };
  return foodValues[food] || food || "No food";
};

export default function BookingReviewDetails() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [selectedTDate, setSelectedTDate] = useState<string | null>(null);
  const [RBbookingID, setRBbookingID] = useState("");
  const [RBrequest, setRBrequest] = useState<any>(null);
  const [RBresponse, setRBresponse] = useState<any>(null);
  const [commercials, setCommercials] = useState<any>(null);
  const [boardingStationList, setBoardingStationList] = useState<any[]>([]);
  const [trainTiming, setTrainTiming] = useState<any>(null);
  const [railprofile, setRailprofile] = useState<any>(null);
  const [remainingTime, setRemainingTime] = useState(300);
  const [customerMobile, setCustomerMobile] = useState("");
  const [quota, setQuota] = useState("");

  // Fare states
  const [ticketFare, setTicketFare] = useState(0);
  const [irctcFee, setIrctcFee] = useState(0);
  const [travelAgentFee, setTravelAgentFee] = useState(0);
  const [pgCharge, setPgCharge] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);

  // Verification states
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [aadhaarOTPVerified, setAadhaarOTPVerified] = useState(false);

  // Modal states
  const [otpModal, setOtpModal] = useState(false);
  const [emailOtpModal, setEmailOtpModal] = useState(false);
  const [whatsappModal, setWhatsappModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [userIp, setUserIp] = useState("");
  const userIpRef = useRef("");
  const [confirmIpModal, setConfirmIpModal] = useState(false);
  const { formData: formParam } = useLocalSearchParams();
  const [htmlContent, setHtmlContent] = useState("");
  const [formData, setFormData] = useState<any>(null);

  const formatDateForAPI = (date: string) => {

    if (!date) return null;

    // 1️⃣ Already YYYYMMDD → return as-is
    if (/^\d{8}$/.test(date)) {
      return date;           // 20251218
    }

    // 2️⃣ dd-mm-yyyy → convert to YYYYMMDD
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("-");
      return `${yyyy}${mm}${dd}`;   // 20251218
    }

    // 3️⃣ yyyy-mm-dd → convert to YYYYMMDD
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [yyyy, mm, dd] = date.split("-");
      return `${yyyy}${mm}${dd}`;
    }

    // 4️⃣ If it's a valid timestamp or ISO format
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;  // fallback
    }

    // 5️⃣ Fallback - invalid date
    console.warn("⚠️ Invalid date format received:", date);
    return null;
  };

  useEffect(() => {
    const fetchIp = async () => {
      const ip = await AsyncStorage.getItem("userIp");
      if (ip) setUserIp(ip);
    };
    fetchIp();
  }, []);



  // Fetch booking data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const sessionDataStr = await AsyncStorage.getItem("searchInitDataAll");
        const sessionData = sessionDataStr ? JSON.parse(sessionDataStr) : null;

        let SelectedTDate = sessionData?.date || null;

        if (SelectedTDate) {
          SelectedTDate = formatDateForAPI(SelectedTDate);
        }
        setSelectedTDate(SelectedTDate);
        setCustomerMobile(sessionData?.mobileNumber || "");
        setWhatsapp(sessionData?.mobileNumber || "");
        setQuota(sessionData?.JQuota || "");

        if (SelectedTDate) {
          SelectedTDate = formatDateForAPI(SelectedTDate);
        }

        const bookingIdStr = await AsyncStorage.getItem("railBookingid");
        const bookingId = bookingIdStr ? JSON.parse(bookingIdStr) : "";
        setRBbookingID(bookingId);

        const response = await railTicketreviewData(bookingId, SelectedTDate);
        // console.log("booking review data is ", response)

        if (response?.data?.createdAt) {
          const createdAt = new Date(response.data.createdAt);
          const diff =
            Math.abs(response?.data?.currentTime - createdAt.getTime()) / 1000;

          if (diff > 300) {
            router.push("/rail/bookingdetails?error=Session expired" as any);
            return;
          }

          setRemainingTime(
            Math.floor(
              (createdAt.getTime() + 300000 - response?.data?.currentTime) /
              1000
            )
          );
        }

        setAadhaarOTPVerified(response?.data?.aadharOTPVerified);
        setRBrequest(response?.data?.RBrequest);
        setRBresponse(response?.data?.RBresponse);
        setCommercials(response?.data?.commercials);
        setBoardingStationList(response?.data?.boardingStationList || []);
        setTrainTiming(response?.data?.trainTiming);
        setRailprofile(response?.data?.railProfile);
        setTravelAgentFee(response?.data?.commercials?.TravelAgentFee || 0);
        setPgCharge(response?.data?.commercials?.pgCharge || 0);
      } catch (err) {
        console.log("API ERROR:", err);
        showMessage("Error", "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      router.push("/rail/bookingdetails?error=Session expired" as any);
    }
  }, [remainingTime]);

  // Calculate fares
  useEffect(() => {
    if (RBresponse) {
      const wpServiceCharge = parseFloat(RBresponse.wpServiceCharge) || 0;
      const wpServiceTax = parseFloat(RBresponse.wpServiceTax) || 0;
      const agentFees2 = wpServiceCharge + wpServiceTax;
      setIrctcFee(agentFees2);

      let tiketfare =
        parseFloat(RBresponse.baseFare) +
        parseFloat(RBresponse.reservationCharge) +
        parseFloat(RBresponse.superfastCharge) +
        parseFloat(RBresponse.fuelAmount) -
        parseFloat(RBresponse.totalConcession) +
        parseFloat(RBresponse.tatkalFare) +
        parseFloat(RBresponse.serviceTax) +
        parseFloat(RBresponse.otherCharge) +
        parseFloat(RBresponse.cateringCharge) +
        parseFloat(RBresponse.dynamicFare);
      setTicketFare(tiketfare);

      let travelinsurance = parseFloat(
        (
          parseFloat(RBresponse.travelInsuranceCharge || "0") +
          parseFloat(RBresponse.travelInsuranceServiceTax || "0")
        ).toFixed(2)
      );

      const totalFare = parseFloat(RBresponse.totalFare) || 0;
      const totalfinal = parseFloat(
        (
          totalFare +
          agentFees2 +
          travelinsurance +
          travelAgentFee +
          pgCharge
        ).toFixed(2)
      );
      setTotalFinal(totalfinal);
    }
  }, [RBresponse, travelAgentFee, pgCharge]);

  // Verify mobile
  useEffect(() => {
    if (customerMobile.length > 9) {
      GetVerifiedContact();
    }
  }, [customerMobile]);

  // Verify email
  useEffect(() => {
    if (RBrequest?.email) {
      GetVerifiedEmail();
    }
  }, [RBrequest?.email]);

  const GetVerifiedContact = async () => {
    try {
      const response = await GetVerifiedContactservice(customerMobile);
      if (response.status === 200 || response.status === 201) {
        if (customerMobile && response.data.mobile === customerMobile) {
          setMobileVerified(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GetVerifiedEmail = async () => {
    try {
      if (!RBrequest) return;
      const response = await GetVerifiedEmailervice(RBrequest.email);
      if (response.status === 200 || response.status === 201) {
        if (RBrequest.email && response.data.email === RBrequest.email) {
          setEmailVerified(true);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendOtp = async () => {
    const response = await SendOTPForMobileVerification(customerMobile);
    if (response.status === 200 || response.status === 201) {
      showMessage("Success", "OTP sent successfully");
      setShowOtpInput(true);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.trim() === "") {
      showMessage("Error", "Please enter OTP");
      return;
    }
    try {
      const response = await VerifyOTPAndSaveMobile(customerMobile, otp);
      if (
        (response.status === 200 || response.status === 201) &&
        !response.data.message
      ) {
        showMessage("Success", "Mobile verified successfully");
        setOtpModal(false);
        setShowOtpInput(false);
        setOtp("");
        GetVerifiedContact();
      } else {
        showMessage("Error", response.data.message);
      }
    } catch (error: any) {
      showMessage("Error", error.response?.data?.error || "Verification failed");
    }
  };

  const sendOtpOnEmail = async () => {
    if (!RBrequest) return;
    const response = await SendOTPForEmailVerification(RBrequest.email);
    if (response.status === 200 || response.status === 201) {
      showMessage("Success", "OTP sent successfully");
      setShowOtpInput(true);
    }
  };

  const verifyOTPEmail = async () => {
    if (!otp || otp.trim() === "") {
      showMessage("Error", "Please enter OTP");
      return;
    }
    if (!RBrequest) return;
    try {
      const response = await VerifyOTPAndSaveEmail(RBrequest.email, otp);
      if (
        (response.status === 200 || response.status === 201) &&
        !response.data.message
      ) {
        showMessage("Success", "Email verified successfully");
        setEmailOtpModal(false);
        setShowOtpInput(false);
        setOtp("");
        GetVerifiedEmail();
      } else {
        showMessage("Error", response.data.message);
      }
    } catch (error: any) {
      showMessage("Error", error.response?.data?.error || "Verification failed");
    }
  };

  const handleBooking = async () => {
    if (!termsAccepted) {
      showMessage("Error", "Please accept terms and conditions");
      return;
    }

    try {
      setBookingLoading(true);
      const response = await RailPayrequestservice({
        railBookingID: RBbookingID,
        trainTiming,
        RBrequest,
      });

      if (response?.data?.redirectUrl) {
        router.push(response.data.redirectUrl as any);
        showMessage("Success", "Payment Initiated Successfully");
        return;
      }
      if (
        response?.data?.actionUrl &&
        response?.data?.wsReturnUrl &&
        response?.data?.wsloginId
      ) {
        setFormData(response.data);
        router.push({
          pathname: "/rail/PaymentRedirectScreen", // 👈 make sure folder is correct
          params: { formData: JSON.stringify(response.data) }
        });
        return;
      } else {
        showMessage(response?.data?.error);
        throw new Error(response.data.error);
      }

      showMessage("Error", response?.data?.error || "Booking failed");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Booking failed";
      showMessage("Error", errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (formData) {
      const parsed = typeof formData === "string" ? JSON.parse(formData) : formData;

      let html = `<form id="autoForm" method="POST" action="${parsed.actionUrl}">`;

      Object.keys(parsed).forEach((key) => {
        html += `<input type="hidden" name="${key}" value="${parsed[key]}" />`;
      });

      html += `
        </form>
        <script>document.getElementById('autoForm').submit();</script>
      `;

      setHtmlContent(html);
    }
  }, [formData]);

  // React.useEffect(() => {
  //   // Submit the form once formData is set and form is mounted in the DOM
  //   if (formData && formRef.current) {
  //     formRef.current.submit();
  //   }
  // }, [formData]);

  // // Dynamically create form fields based on formData
  // const renderFormFields = () => {
  //   return Object.keys(formData || {}).map((key) => (
  //     <input type='hidden' name={key} value={formData[key]} key={key} />
  //   ));
  // };
  const RefreshBooking = async () => {
    try {
      const response = await RefreshBookingService(RBbookingID);
      if (response.data.success === true) {
        setRefresh(!refresh);
        showMessage("Success", "Booking refreshed successfully");
      }
      if (response.data.error) {
        showMessage("Error", response.data.error || "Error refreshing booking");
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
    }
  };

  const sendWhatsappMessage = () => {
    if (!RBrequest || !RBresponse) return;

    let message = `Train Ticket Booking Details\n\nFrom: ${RBresponse?.from
      } - ${trainTiming?.fstationName} on ${DateWithDayAndMonth(
        selectedTDate || ""
      )} at ${trainTiming?.fdepartureTime}\nTrain No: ${RBresponse?.trainNo
      }\nTrain Name: ${RBresponse?.trainName}\nClass: ${RBresponse?.enqClass
      }\n\nPassenger Details:\n`;

    RBrequest?.passengerList?.forEach((passenger: any, index: number) => {
      message += `${index + 1}. ${passenger.passengerName}, ${passenger.passengerAge
        }, ${passenger.passengerGender}\n`;
    });

    message += `\nPassenger Mobile: ${RBrequest.customerMobileNumber}`;
    setWhatsappMessage(message);
  };

  const SendWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const url = `https://wa.me/91${whatsapp}?text=${encodedMessage}`;
    Linking.openURL(url);
    setWhatsappModal(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          Loading booking details...
        </Text>
      </View>
    );
  }

  if (!RBresponse) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <Text className="text-gray-600 dark:text-gray-400">
          No booking data found
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-bold text-center text-gray-800 dark:text-gray-200">
            Review Booking Details
          </Text>
        </View>

        {/* Train Info Card */}
        <View className="bg-white dark:bg-gray-800 m-2 p-4 rounded-lg shadow">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row gap-2">
              <View className="bg-red-500 px-2 py-1 rounded">
                <Text className="text-white font-semibold">
                  {RBresponse?.enqClass}
                </Text>
              </View>
              <View className="bg-blue-500 px-2 py-1 rounded">
                <Text className="text-white font-semibold">
                  {quota === "SS" ? "SC" : RBresponse?.quota}
                </Text>
              </View>
            </View>
            <View className="bg-red-500 px-3 py-1 rounded flex-row items-center">
              <Ionicons name="train" size={16} color="white" />
              <Text className="text-white font-semibold ml-1">
                {RBresponse?.trainNo}
              </Text>
            </View>
          </View>

          <Text className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
            {RBresponse?.trainName}
          </Text>

          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-blue-600 dark:text-blue-400 font-semibold text-center">
                Departure
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 text-center text-sm">
                {selectedTDate ? DateWithDayAndMonth(selectedTDate) : ""}
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 text-center text-sm">
                {trainTiming?.fdepartureTime}
              </Text>
              <Text className="text-blue-600 dark:text-blue-400 text-center text-xs mt-1">
                {RBresponse?.from} - {trainTiming?.fstationName}
              </Text>
            </View>

            <View className="items-center px-2">
              <Text className="text-gray-600 dark:text-gray-400 text-xs">
                {trainTiming?.distance} Km
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-xs">
                {trainTiming?.halt} {trainTiming?.halt === 1 ? "Halt" : "Halts"}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-red-600 dark:text-red-400 font-semibold text-center">
                Arrival
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 text-center text-sm">
                {trainTiming?.ArrivalDate
                  ? DateWithDayAndMonth(trainTiming.ArrivalDate)
                  : ""}
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 text-center text-sm">
                {trainTiming?.toarrivalTime}
              </Text>
              <Text className="text-red-600 dark:text-red-400 text-center text-xs mt-1">
                {RBresponse?.to} - {trainTiming?.tostationName}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-center items-center mt-3 gap-2">
            <View className="bg-green-500 px-3 py-1 rounded">
              <Text className="text-white font-semibold text-xs">
                {RBresponse?.avlDayList[0]?.availablityStatus}
              </Text>
            </View>
            <TouchableOpacity
              onPress={RefreshBooking}
              className="bg-blue-500 p-2 rounded"
            >
              <Ionicons name="refresh" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Boarding Info */}
        <View className="bg-white dark:bg-gray-800 m-2 p-4 rounded-lg shadow">
          <Text className="text-gray-700 dark:text-gray-300 text-sm">
            <Text className="font-semibold">Boarding at: </Text>
            {RBrequest?.boardingStation} -{" "}
            {boardingStationList.find(
              (station) => station.stationCode === RBrequest?.boardingStation
            )?.stationName}
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 text-sm mt-1">
            <Text className="font-semibold">Customer Mobile: </Text>
            {customerMobile}
          </Text>
        </View>

        {/* Passenger Details */}
        <View className="bg-white dark:bg-gray-800 m-2 p-4 rounded-lg shadow">
          <View className="bg-blue-500 p-2 rounded mb-3">
            <Text className="text-white font-bold text-center">
              Passenger Details
            </Text>
          </View>

          {RBrequest?.passengerList?.map((passenger: any, index: number) => (
            <View
              key={index}
              className="border-b border-gray-200 dark:border-gray-700 py-3"
            >
              <View className="flex-row justify-between">
                <Text className="text-gray-800 dark:text-gray-200 font-semibold">
                  {index + 1}. {passenger.passengerName}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400">
                  {passenger.passengerAge} yrs
                </Text>
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  {passenger.passengerGender === "M"
                    ? "Male"
                    : passenger.passengerGender === "F"
                      ? "Female"
                      : "Transgender"}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 text-sm">
                  {getFoodValue(passenger.passengerFoodChoice)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Fare Details */}
        <View className="bg-white dark:bg-gray-800 m-2 p-4 rounded-lg shadow">
          <View className="bg-blue-500 p-2 rounded mb-3">
            <Text className="text-white font-bold text-center">
              Fare Details
            </Text>
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between py-1">
              <Text className="text-gray-700 dark:text-gray-300">
                Ticket Fare
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">
                ₹{" "}
                {formatNumberToSouthAsian(
                  ticketFare - parseFloat(RBresponse?.cateringCharge || "0")
                )}
              </Text>
            </View>

            {parseFloat(RBresponse?.cateringCharge || "0") > 0 && (
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-700 dark:text-gray-300">
                  Catering Charge
                </Text>
                <Text className="text-gray-800 dark:text-gray-200 font-semibold">
                  ₹{" "}
                  {formatNumberToSouthAsian(
                    parseFloat(RBresponse?.cateringCharge || "0")
                  )}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between py-1">
              <Text className="text-gray-700 dark:text-gray-300">
                IRCTC Fee
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">
                ₹ {formatNumberToSouthAsian(irctcFee)}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-gray-700 dark:text-gray-300">
                PG Charge
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">
                ₹ {formatNumberToSouthAsian(pgCharge)}
              </Text>
            </View>

            <View className="flex-row justify-between py-1">
              <Text className="text-gray-700 dark:text-gray-300">
                Travel Agent Fee
              </Text>
              <Text className="text-gray-800 dark:text-gray-200 font-semibold">
                ₹ {formatNumberToSouthAsian(travelAgentFee)}
              </Text>
            </View>

            <View className="flex-row justify-between py-2 border-t border-gray-300 dark:border-gray-600 mt-2">
              <Text className="text-green-600 dark:text-green-400 font-bold">
                Total Fare
              </Text>
              <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                ₹ {formatNumberToSouthAsian(totalFinal)}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-1 mt-2">
          {/* Booking Options Card */}
          <View className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3">
            <Text className="bg-blue-600 p-2 text-white font-bold text-center rounded">
              Booking Options
            </Text>

            {RBrequest && (
              <View className="mt-3">
                {/* Book if Confirm */}
                {(Number(RBrequest.reservationChoice) === 5 ||
                  Number(RBrequest.reservationChoice) === 6 ||
                  Number(RBrequest.reservationChoice) === 7) && (
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                      <Text className="text-gray-800 dark:text-gray-200">Book if Confirm</Text>
                    </View>
                  )}

                {/* Travel Insurance */}
                {RBrequest?.travelInsuranceOpted === "true" && (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <Text className="text-gray-800 dark:text-gray-200">Travel Insurance</Text>
                  </View>
                )}

                {/* Auto Upgrade */}
                {RBrequest?.autoUpgradationSelected === "true" && (
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <Text className="text-gray-800 dark:text-gray-200">Auto Upgrade</Text>
                  </View>
                )}

                {/* Reservation Choice */}
                {getReservationChoice(RBrequest?.reservationChoice) !== "None" && (
                  <View className="flex-row items-center gap-2 mt-2">
                    <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    <Text className="text-gray-800 dark:text-gray-200">
                      {getReservationChoice(RBrequest?.reservationChoice)}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* GST Details Card */}
          <View className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <Text className="bg-blue-600 p-2 text-white font-bold text-center rounded">
              GST Details
            </Text>

            {RBrequest?.gstDetails ? (
              <View className="mt-3">
                <Text className="text-gray-800 dark:text-gray-200">
                  GSTIN: {RBrequest.gstDetails.gstIn}
                </Text>
                <Text className="text-gray-800 dark:text-gray-200">
                  Name: {RBrequest.gstDetails.nameOnGst}
                </Text>
                <Text className="text-gray-600 dark:text-gray-400 mt-1" style={{ fontSize: 10 }}>
                  Address:{" "}
                  {`${RBrequest.gstDetails.flat}, ${RBrequest.gstDetails.street}, ${RBrequest.gstDetails.area
                    }, ${RBrequest.gstDetails.city}, ${RBrequest.gstDetails.state} - ${RBrequest.gstDetails.pin
                    }`}
                </Text>
              </View>
            ) : (
              <View className="items-center justify-center mt-3">
                <Text className="text-gray-600 dark:text-gray-400">
                  No GST Details Entered
                </Text>
              </View>
            )}
          </View>

          {/* Child Below 5 Years Section */}
          <View className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-3">
            <Text className="bg-blue-600 p-2 text-white font-bold rounded text-center">
              Child Below 5 Years Without Berth
            </Text>

            {RBrequest?.infantList && RBrequest.infantList.length > 0 ? (
              <FlatList
                data={RBrequest.infantList}
                keyExtractor={(item, index) => item._id || index.toString()}
                renderItem={({ item, index }) => (
                  <View className="flex-row justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                    <Text className="text-gray-800 dark:text-gray-200 w-1/5">{index + 1}</Text>
                    <Text className="text-gray-800 dark:text-gray-200 w-2/5">{item.name}</Text>
                    <Text className="text-gray-800 dark:text-gray-200 w-1/5">{item.age}</Text>
                    <Text className="text-gray-800 dark:text-gray-200 w-1/5">
                      {item.gender === "M" ? "Male" : item.gender === "F" ? "Female" : "Other"}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <View className="items-center py-3">
                <Text className="text-gray-600 dark:text-gray-400">No Child Data Entered</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Verification */}
        <View className="bg-white dark:bg-gray-800 m-2 p-4 rounded-lg shadow">
          <View className="bg-blue-500 p-2 rounded mb-3">
            <Text className="text-white font-bold text-center">
              Contact Details
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center flex-1">
              <Ionicons
                name="call"
                size={18}
                color="#6b7280"
                style={{ marginRight: 8 }}
              />
              <Text className="text-gray-800 dark:text-gray-200">
                {RBrequest?.mobileNumber}
              </Text>
            </View>
            {mobileVerified ? (
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            ) : (
              <TouchableOpacity onPress={() => setOtpModal(true)}>
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          {RBrequest?.email && (
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name="mail"
                  size={18}
                  color="#6b7280"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-gray-800 dark:text-gray-200 flex-1" numberOfLines={1}>
                  {RBrequest?.email}
                </Text>
              </View>
              {emailVerified ? (
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
              ) : (
                <TouchableOpacity onPress={() => setEmailOtpModal(true)}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Terms and Conditions */}
        <View className="bg-white dark:bg-gray-800 m-2 p-4 rounded-lg shadow">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View
              className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${termsAccepted
                ? "bg-blue-500 border-blue-500"
                : "border-gray-400"
                }`}
            >
              {termsAccepted && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
            <Text className="text-gray-700 dark:text-gray-300 flex-1">
              I agree to the Terms and Conditions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="bg-white dark:bg-gray-800 m-2 p-4 rounded-lg shadow mb-6">
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 bg-gray-500 p-3 rounded-lg flex-row items-center justify-center"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-600 p-3 rounded-lg items-center justify-center"
              onPress={() => {
                sendWhatsappMessage();
                setWhatsappModal(true);
              }}
            >
              <Ionicons name="logo-whatsapp" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 p-3 rounded-lg flex-row items-center justify-center ${bookingLoading || !termsAccepted || remainingTime <= 0
                ? "bg-gray-400"
                : "bg-blue-600"
                }`}
              onPress={() => setConfirmIpModal(true)}
              disabled={bookingLoading || !termsAccepted || remainingTime <= 0}
            >
              {bookingLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    {RBresponse?.aadhaarOTPBasedBooking && !aadhaarOTPVerified
                      ? "Verify Aadhaar"
                      : "Proceed"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Remaining */}
        <View className="bg-yellow-50 dark:bg-yellow-900/20 m-2 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <Text className="text-center text-gray-700 dark:text-gray-300">
            Time remaining:{" "}
            <Text className="text-yellow-600 dark:text-yellow-400 font-bold">
              {formatTime(remainingTime)}
            </Text>
          </Text>
        </View>

        <View className="w-full items-center justify-center"
          onLayout={() => {
            // Wait 300ms then read IP text from UI
            setTimeout(async () => {
              const ip = await AsyncStorage.getItem("userIp");
              if (ip) userIpRef.current = ip;   // Store IP here
            }, 300);
          }}
        >
          <IPAddress />   {/* React Native Component */}
        </View>

        <View className="w-full mt-2">
          <MarqueeNotice />
        </View>


        {/* Reservation Mode Section */}
        <View className="w-full bg-white dark:bg-gray-900 rounded-lg shadow p-4 mt-3">

          <Text className="text-center text-gray-800 dark:text-gray-200">
            Reservation Mode Selected:{" "}
            <Text className="text-green-500 font-semibold">
              {RBrequest?.reservationMode === "B2B_WEB_OTP" ? "OTP" : "DSC"}
            </Text>
          </Text>

          {RBrequest?.reservationMode === "B2B_WEB_OTP" ? (
            <Text className="text-center text-gray-800 dark:text-gray-200 mt-2">
              OTP will be sent to{" "}
              <Text className="text-green-500 font-semibold">
                {railprofile?.uniqueMobileNumber}
              </Text>{" "}
              &{" "}
              <Text className="text-green-500 font-semibold">
                {railprofile?.UniqueEmail}
              </Text>
            </Text>
          ) : (
            <Text className="text-center text-gray-800 dark:text-gray-200 mt-2">
              Insert Dongle in the USB port of your computer & enter the PIN.
            </Text>
          )}

          <Text className="text-center text-gray-800 dark:text-gray-200 mt-2">
            You have to enter the password of your IRCTC ID{" "}
            <Text className="text-green-500 font-semibold">
              {RBrequest?.wsUserLogin ?? ""}
            </Text>{" "}
            on the next page. <RevealIRCTC />
          </Text>

        </View>

        {/* <View style={{ flex: 1 }}>
          <form
            ref={formRef}
            action={formData?.actionUrl || '#'} // Ensure actionUrl is part of the formData
            method='post'
          // style={{ display: 'none' }}
          >
            {formData && renderFormFields()}
          </form>
        </View> */}

        {/* <View style={{ flex: 1 }}>
          {htmlContent !== "" && (
            <WebView
              source={{ html: htmlContent }}
              javaScriptEnabled
              originWhitelist={["*"]}
            />
          )}
        </View> */}

      </ScrollView>

      {/* Mobile OTP Modal */}
      <Modal
        visible={otpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOtpModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Mobile OTP Verification
            </Text>

            {!showOtpInput ? (
              <View>
                <Text className="text-gray-600 dark:text-gray-400 mb-4">
                  Would you like to send the OTP?
                </Text>
                <TouchableOpacity
                  className="bg-blue-500 p-3 rounded-lg"
                  onPress={sendOtp}
                >
                  <Text className="text-white text-center font-semibold">
                    Send OTP
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2">
                  Enter OTP
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                  placeholder="Enter OTP"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-lg ${otp.length <= 3 ? "bg-gray-400" : "bg-blue-500"
                      }`}
                    onPress={verifyOTP}
                    disabled={otp.length <= 3}
                  >
                    <Text className="text-white text-center font-semibold">
                      Verify
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-500 p-3 rounded-lg"
                    onPress={() => {
                      setOtpModal(false);
                      setShowOtpInput(false);
                      setOtp("");
                    }}
                  >
                    <Text className="text-white text-center font-semibold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Email OTP Modal */}
      <Modal
        visible={emailOtpModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEmailOtpModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Email OTP Verification
            </Text>

            {!showOtpInput ? (
              <View>
                <Text className="text-gray-600 dark:text-gray-400 mb-4">
                  Would you like to send the OTP?
                </Text>
                <TouchableOpacity
                  className="bg-blue-500 p-3 rounded-lg"
                  onPress={sendOtpOnEmail}
                >
                  <Text className="text-white text-center font-semibold">
                    Send OTP
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-gray-700 dark:text-gray-300 mb-2">
                  Enter OTP
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                  placeholder="Enter OTP"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    className={`flex-1 p-3 rounded-lg ${otp.length <= 3 ? "bg-gray-400" : "bg-blue-500"
                      }`}
                    onPress={verifyOTPEmail}
                    disabled={otp.length <= 3}
                  >
                    <Text className="text-white text-center font-semibold">
                      Verify
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-gray-500 p-3 rounded-lg"
                    onPress={() => {
                      setEmailOtpModal(false);
                      setShowOtpInput(false);
                      setOtp("");
                    }}
                  >
                    <Text className="text-white text-center font-semibold">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* WhatsApp Modal */}
      <Modal
        visible={whatsappModal}
        transparent
        animationType="slide"
        onRequestClose={() => setWhatsappModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-11/12 max-w-md">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
              Send via WhatsApp
            </Text>

            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp Number
            </Text>
            <View className="flex-row mb-4">
              <View className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-lg p-3 justify-center">
                <Text className="text-gray-800 dark:text-gray-200">+91</Text>
              </View>
              <TextInput
                className="flex-1 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg p-3 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
                placeholder="Enter WhatsApp Number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                maxLength={10}
                value={whatsapp}
                onChangeText={setWhatsapp}
              />
            </View>

            <Text className="text-gray-700 dark:text-gray-300 mb-2">
              Message
            </Text>
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 mb-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
              placeholder="Enter Message"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              value={whatsappMessage}
              onChangeText={setWhatsappMessage}
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-green-600 p-3 rounded-lg flex-row items-center justify-center"
                onPress={SendWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-500 p-3 rounded-lg"
                onPress={() => setWhatsappModal(false)}
              >
                <Text className="text-white text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm IP Before Booking */}
      <Modal
        visible={confirmIpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmIpModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-white dark:bg-gray-800 w-11/12 max-w-md rounded-lg p-6">

            {/* SHOW IP FIRST 🚀 */}
            <View className="items-center mb-3">
              <IPAddress />   {/* IP fetched BEFORE booking */}
            </View>

            <Text className="text-gray-800 dark:text-gray-200 text-center mb-1">
              Are you booking from this IP?
            </Text>
            <Text className="text-red-500 font-bold text-center mb-3">
              Make sure this is NOT a Personal IRCTC ID!
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-500 p-3 rounded-lg"
                onPress={() => setConfirmIpModal(false)}
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-green-600 p-3 rounded-lg"
                onPress={async () => {
                  setConfirmIpModal(false); // Close modal
                  await handleBooking();     // 🔥 NOW CALL API
                }}
              >
                <Text className="text-white text-center font-semibold">Proceed</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>


      {/* Booking Loading Overlay */}
      {bookingLoading && (
        <View className="absolute inset-0 bg-black/70 justify-center items-center">
          <View className="bg-white dark:bg-gray-800 p-6 rounded-xl items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-4">
              Redirecting to
            </Text>
            <Text className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
              IRCTC OTP / Captcha Page
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Please wait while we complete the process…
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}