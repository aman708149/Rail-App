import React, { useEffect, useState } from 'react';
import { View, Text, useColorScheme, ActivityIndicator, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Colors } from '@/constants/theme';
// import "../../../global.css"
import { useLocalSearchParams, useRouter } from "expo-router";
import { showMessage } from '@/src/utils/showMessage';
import { DateTime } from 'luxon';
import { BoardingStationservice, Cancellationservice, ChangeBoardingPointservice, FileTDRService, GetPNrDetailsService, GetTicketbookingresponse, PNRHistoryService, SendOTPForCancellationService, SendOTPRailCancellationService, TDRReasonService, TrainScheduleService, VerifyOTPRailCancellationService } from '@/src/service/apiservice';
import { RBTktres } from '@/src/components/Rail/transactionsummary/RailPayRequest';
import useStationNames from '@/src/hooks/useStationNames';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, FontAwesome6, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { trainRoute } from '@/src/components/Rail/trainroute';
import { useDispatch } from 'react-redux';
import { formatDuration } from '@/src/utils/DateFormate/formatDuration';
import formatDate from '@/src/components/Rail/trainavailability/irctcformateDate';
import { handleAxiosError } from '@/src/utils/handleAxiosError';
import { BoardingAtChange } from '@/src/components/form/boarding-change';
import PnrStatusCheck from '@/src/components/Rail/transactionsummary/PnrStatusCheck';
import Checkbox from 'expo-checkbox';
import { PassengerStatus } from '@/src/components/Rail/transactionsummary/PassengerStatus';
import { formatNumberToSouthAsian } from '@/src/utils/Number';
import LastBookingStatus from '@/src/components/Rail/transactionsummary/LastBookingStatus';
import { useRole } from '@/src/context/RoleProvider';
import { Roles } from '@/src/types/loginActivityType';
import OTPVerificationModal from '@/src/components/Rail/transactionsummary/OTPVerificationModal';
import { Picker } from '@react-native-picker/picker';
import { tdrEFTDontAllow } from '@/src/components/Rail/transactionsummary/tdrResons';
import { setArrivalCode, setBoardingAtCode, setDepartureCode } from '@/src/store/rail/train-route/trainRouteSlices';


export default function transactionsummary() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'dark'];

    const searchParams = useLocalSearchParams();
    const { user } = useRole();
    const router = useRouter();   // 👈 Get router instance


    // --- STATE (names NOT changed) ----
    const [railbookingID, setRailbookingID] = useState<any>(null);
    //   const [transactionsummary, setTransactionsummary] = useState<any>(null);
    const [lastStatus, setLastStatus] = useState<any>(null);
    const [statusWhileCancel, setStatusWhileCancel] = useState<any>(null);
    const [RBresponse, setRBresponse] = useState<any>(null);
    const [passengerList, setPassengerList] = useState<any[]>([]);
    const [BPChange, setBPChange] = useState<any>(null);
    const [ownerID, setOwnerID] = useState<any>(null);
    const [reffID, setReffID] = useState<any>(null);
    const [bookedAt, setBookedAt] = useState<string>("");
    const [updatedAt, setupdatedAt] = useState<string>("");
    const [bookingStatus, setBookingStatus] = useState<any>(null);
    const [infantdetails, setInfantdetails] = useState<any[]>([]);
    const [mobile, setMobile] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [wsUserLogin, setWsUserLogin] = useState<string>("");
    const [commercials, setCommercials] = useState<any>(null);
    const [routeDetails, setRouteDetails] = useState<any>(null);
    const [customerMobileNumber, setCustomerMobileNumber] = useState<string>("");
    const [trainTiming, setTrainTiming] = useState<any>(null);
    const [railCancellation, setRailCancellation] = useState<any[]>([]);
    const [RBrequest, setRBrequest] = useState<any>(null);
    const [pnrStatus, setPnrStatus] = useState<any>(null);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<number>(0); // example
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [transactionsummary, setTransactionsummary] = useState<RBTktres>({} as RBTktres);
    const { stationNames, fetchStationNames } = useStationNames();
    const [trainSchedule, setTrainSchedule] = useState<trainRoute>();
    const dispatch = useDispatch();
    const [selectedPassengers, setSelectedPassengers] = useState<{
        [key: string]: boolean;
    }>({});
    const [boardingStation, setBoardingStation] = useState<any>([]);
    const [boardingStationList, setBoardingStationList] = useState<any[]>([]);
    const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>('');
    const [stationName, setStationName] = useState<any>([]);
    const [newboardingStn, setNewboardingStn] = useState<string>('');
    const [newBoardingDetails, setNewBoardingDetails] = useState<any>([]);
    const [modal, setModal] = useState(false);
    const [boardinginfo, setBoardinginfo] = useState<boolean>(false);
    const [emailModal, setEmailModal] = useState<boolean>(false);
    const [ticketemail, setTicketemail] = useState<string>('');
    const [whatsappModal, setWhatsappModal] = useState<boolean>(false);
    const [travelInsuranceModal, setTravelInsuranceModal] = useState<boolean>(false);
    const [isCancel, setisCancel] = useState<boolean>(false);
    const [pnrDetail, setPnrDetail] = useState<any>(null);
    const [tdrreason, settdrreason] = useState<any>();
    const [filetdr, setfiletdr] = useState<boolean>(false);
    const [useCurrentBookingDetails, setUseCurrentBookingDetails] =
        useState<boolean>(false);

    const toggleCancel = () => setisCancel(!isCancel);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const [cancellationId, setCancellationId] = useState<string>('');
    const [successModal, setSuccessModal] = useState<boolean>(false);
    const [otpModal, setotpModal] = useState<boolean>(false);
    const [partnerotpModal, setpartnerotpModal] = useState<boolean>(false);
    const [messageInfo, setMessageInfo] = React.useState<string>('');
    const [otpTimers, setOtpTimers] = React.useState<Record<string, { timeLeft: number, isDisabled: boolean }>>({});
    const [alreadyVerified, setAlreadyVerified] = useState<boolean>(false);
    const [selectedTDRReason, setSelectedTDRReason] = useState<string>('');
    const [eftAmount, setEftAmount] = useState<string>('');
    const [eftNumber, setEftNumber] = useState<string>('');
    const [eftDate, setEftDate] = useState<string>('');





    const fetchRailBookingSession = async () => {
        try {
            // SAVE VALUES FIRST
            await AsyncStorage.setItem("currentDetails", "false");
            await AsyncStorage.setItem("re-use-filter", "false");

            // READ BOOKING ID
            const railbookingIDParam =
                searchParams.railbookingId ||
                (await AsyncStorage.getItem("railBookingid")) ||
                searchParams.ticketID;

            if (!railbookingIDParam) return;

            setRailbookingID(railbookingIDParam);

            // API CALL
            const response = await GetTicketbookingresponse(
                JSON.parse(String(railbookingIDParam))
            );

            if (response?.data) {
                const data = response.data;

                // STORE railBookingid for future use
                // await AsyncStorage.setItem("railBookingid", railbookingIDParam);

                setTransactionsummary(data.RBTktres);
                setLastStatus(data.LastStatus);
                setStatusWhileCancel(data.StatusWhileCancell);
                fetchStationNames(data.RBTktres.fromStn, data.RBTktres.destStn);
                setRBresponse(data.RBresponse);
                setPassengerList(data.RBrequest.passengerList);
                setBPChange(data.BPChange);
                settdrreason(data.tdrReasonList);
                setOwnerID(data.ownerID);
                setReffID(data.refID);
                setBookedAt(DateTime.fromISO(data.RBTktres.bookingDate).toFormat("dd-LLL-yyyy 'at' hh:mm a"));
                setupdatedAt(DateTime.fromISO(data.updatedAt).toFormat("dd-LLL-yyyy 'at' hh:mm a"));
                setBookingStatus(data.booking_Status);
                setInfantdetails(data.RBrequest?.infantList);
                setMobile(data.contactdetails.mobileNumber);
                setEmail(data.contactdetails.email);
                setWsUserLogin(data.contactdetails.wsUserLogin);
                setCommercials(data.commercials);
                setRouteDetails(data.RouteDetails);
                setCustomerMobileNumber(data.RBrequest.customerMobileNumber);
                setTrainTiming(data.RouteDetails);
                setRailCancellation(data.railCancellation);
                setRBrequest(data.RBrequest);
                setPnrStatus(data.PnrStatus?.[0]);
                setSelectAll(false);

                if (data.railCancellation?.length > 0) {
                    setActiveTab(1);
                }
            } else {
                showMessage("Error", "Data not found in response");
            }
        } catch (error: any) {
            setError(error?.response?.data?.message || "Something went wrong");
            showMessage("Error", error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchRailBookingSession();
    }, []);

    React.useEffect(() => {
        if (transactionsummary?.psgnDtlList) {
            const initialSelection: { [key: string]: boolean } = {};
            transactionsummary.psgnDtlList.forEach((passenger: any) => {
                initialSelection[passenger._id] = false;
            });
            setSelectedPassengers(initialSelection);
        }
    }, [transactionsummary]);

    // ⛔ NO event.target — React Native does NOT allow this!
    const handleSelectAll = (checked: boolean) => {
        const newSelectedPassengers: any = { ...selectedPassengers };

        transactionsummary?.psgnDtlList?.forEach((passenger: any) => {
            if (passenger?.currentStatus !== "CAN") {
                newSelectedPassengers[passenger._id] = checked;
            } else {
                newSelectedPassengers[passenger._id] = false; // cancel passengers not selectable
            }
        });

        setSelectedPassengers(newSelectedPassengers);

        // Check if ALL non-canceled passengers are selected
        const allNonCanceledSelected = transactionsummary?.psgnDtlList?.every(
            (p: any) => p.currentStatus === "CAN" || newSelectedPassengers[p._id]
        );

        setSelectAll(allNonCanceledSelected);
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelectedPassengers = { ...selectedPassengers, [id]: checked };
        setSelectedPassengers(newSelectedPassengers);

        const allChecked = transactionsummary?.psgnDtlList?.every(
            (p: any) => p.currentStatus === "CAN" || newSelectedPassengers[p._id]
        );

        setSelectAll(allChecked);
    };


    const GetTrainSchedule = async (sidebar?: boolean) => {
        try {
            const response = await TrainScheduleService(
                transactionsummary?.trainNumber,
                DateTime.fromISO(transactionsummary?.journeyDate).toFormat("yyyyMMdd"),
                transactionsummary?.fromStn
            );

            if (response?.data) {
                setTrainSchedule(response.data);

                // if (sidebar) setActiveTab("trainroute");

                dispatch(setDepartureCode(transactionsummary?.fromStn));
                dispatch(setArrivalCode(transactionsummary?.destStn));
                dispatch(setBoardingAtCode(transactionsummary?.boardingStn));
            }
        } catch (error: any) {
            showMessage(
                "Error",
                error?.response?.data?.message || "Something went wrong"
            );
        }
    };

    const ChangeBoardingpoint = async () => {
        // Get selected passenger status
        const isSelectedValues = Object.values(selectedPassengers);

        const anySelected = isSelectedValues.some((isSelected) => isSelected);
        const allSelected = isSelectedValues.every((isSelected) => isSelected);

        // ❌ React Native does NOT support toast.warning
        if (anySelected && !allSelected) {
            showMessage(
                "Warning",
                "Boarding point change is not allowed for selected passengers."
            );
            return;
        }

        try {
            const response = await BoardingStationservice(
                transactionsummary?.trainNumber,
                formatDate(transactionsummary?.boardingDate),
                transactionsummary?.boardingStn,
                transactionsummary?.destStn,
                transactionsummary?.journeyClass,
                "live"
            );

            if (response?.data?.error) {
                showMessage("Error", response.data.error); // REPLACEMENT OF toast.error
                return;
            }

            setBoardingStation(response.data);
            setBoardingStationList(response.data?.BoardingStation || []);
        } catch (error: any) {
            handleAxiosError(error); // if already defined, keep same
        }
    };

    const ChangeConfirmBoarding = async () => {
        try {
            const response = await ChangeBoardingPointservice(
                transactionsummary?.pnrNumber,
                newboardingStn,
                stationName
            );

            if (response?.status === 200 || response?.status === 201 || response?.data) {
                setTransactionsummary(response?.data?.RBTktres);
                setRBresponse(response?.data?.RBresponse);
                setInfantdetails(response?.data?.RBrequest?.infantList);
                setMobile(response?.data?.contactdetails?.mobileNumber);
                setEmail(response?.data?.contactdetails?.email);
                setWsUserLogin(response?.data?.contactdetails?.wsUserLogin);

                showMessage(
                    "Success",
                    `Boarding Point Changed Successfully to ${stationName}`
                );

                await FetchPNRHistory();
            }
        } catch (error: any) {
            if (error?.response?.data?.response?.error) {
                showMessage("Error", error?.response?.data?.response?.error);
            } else {
                showMessage("Error", "Something went wrong");
            }
        } finally {
            setModal(false);
        }
    };

    // const initialBooking = {
    //     value: `${transactionsummary?.boardingStn}`,
    //     label: `${transactionsummary?.boardingStn} - 
    //   ${transactionsummary?.boardingStnName ?? ''} | 
    //   ${transactionsummary?.departureTime} 
    //   ${DateTime.fromISO(transactionsummary?.boardingDate)
    //             .setZone('Asia/Kolkata', { keepLocalTime: false })
    //             .toFormat('EEE dd LLL')}`,
    // };

    const labelText = `${transactionsummary?.boardingStn} - ${transactionsummary?.boardingStnName ?? ''} | ${transactionsummary?.departureTime} ${DateTime.fromISO(transactionsummary?.boardingDate)
        .setZone('Asia/Kolkata', { keepLocalTime: false })
        .toFormat('EEE dd LLL')}`.trim();

    const initialBooking = {
        value: `${transactionsummary?.boardingStn}`,
        label: labelText,
    };



    const OnBoardingPointselect = (e: { target: { value: string } }) => {

        if (e.target.value === transactionsummary?.boardingStn) {
            showMessage("Warning", "Please select different Boarding Point to Change");
            return;
        }

        // Find station by code
        const selectedStation = boardingStation?.BoardingStation?.find(
            (station: { stationCode: string; stationName: string }) =>
                station.stationCode === e.target.value
        );

        const stationName = selectedStation ? selectedStation.stationName : "";
        setStationName(stationName);
        setNewboardingStn(e.target.value);

        // Find full details of the station
        const newBoardingDetails = boardingStation?.BoardingStation?.find(
            (station: {
                stationCode: string;
                stationName: string;
                boardingDate: string;
                departureTime: string;
            }) =>
                station.stationCode === e.target.value &&
                station.stationName === stationName
        );

        // Format details
        if (newBoardingDetails) {
            const formattedBoardingDetails = `${newBoardingDetails.stationName} (${newBoardingDetails.stationCode}) | ${DateTime.fromISO(
                newBoardingDetails.boardingDate
            ).toFormat("EEE dd LLL")} at ${newBoardingDetails.departureTime}`;

            setNewBoardingDetails(formattedBoardingDetails);
        }

        // Open Confirm Modal
        setModal(true);
    };

    const FetchPNRHistory = async () => {
        // Ensure wsUserLogin and transactionsummary?.pnrNumber are available before making the API call
        if (wsUserLogin && transactionsummary?.reservationId) {
            const response = await PNRHistoryService(
                wsUserLogin,
                transactionsummary.reservationId
            );
            if (response && response.data) {
                await fetchRailBookingSession();
            }
        }
    };

    const handlePrintTicketClick = () => {
        //hit pnr history api
        FetchPNRHistory();
        // Open a new window with the specific page URL containing the ticket ID (PNR)
        const url = `/print-train-ticket/?ticketID=${railbookingID}`;
        const options =
            'noopener,noreferrer,width=1000,height=700,left=100,top=100';
        // window.open(url, 'printTicket', options);
    };

    const OpenCancellationCard = (name: string) => {
        const item = railCancellation?.find((item: { name: string | string[] }) =>
            item.name.includes(name)
        );
        // setActiveTab('Booking Ticket Details');
        // setActiveId(item?.cancellationid ?? '');
        // setOpencontinue(true);
    };

    const GetClassByStatus = (name: string) => {
        const item = railCancellation?.find((item: { name: string | string[] }) =>
            item.name.includes(name)
        );
        return item?.RefundStatus === true ? 'text-success' : 'text-warning';
    };
    const GetStatusByName = (name: string) => {
        const item = railCancellation?.find((item: { name: string | string[] }) =>
            item.name.includes(name)
        );
        return item?.RefundStatus === true ? 'Refunded' : 'Pending';
    };

    const toggleTravelInsuranceModal = () => {
        setTravelInsuranceModal(!travelInsuranceModal);
    };

    const onCacellationClick = async () => {
        setisCancel(true);

        try {
            const response = await GetPNrDetailsService(transactionsummary?.pnrNumber);

            if (
                (response?.status === 200 || response?.status === 201) &&
                !response?.data?.errorMessage
            ) {
                setPnrDetail(response.data);
            } else {
                showMessage("Error", response?.data?.errorMessage || "Something went wrong");
            }
        } catch (error: any) {
            // const axiosError = error as AxiosError;
            showMessage("Error", error || "Failed to fetch PNR details");
        }
    };


    const FileTDRHandelAndReason = async () => {
        try {
            const reason = await TDRReasonService(transactionsummary?.reservationId);

            if (reason?.data?.tdrReasonList) {
                settdrreason(reason.data.tdrReasonList);
                setfiletdr(true);
            } else if (reason?.data?.errorMsg) {
                showMessage("Error", reason.data.errorMsg);
                // OR showMessage("Error", reason.data.errorMsg);
            }
        } catch (error: any) {
            showMessage(
                "Error",
                error?.response?.data?.message || "Something went wrong"
            );
            // OR showMessage("Error", error?.response?.data?.message || "Something went wrong");
        }
    };


    const HandlefileTDR = async () => {
        try {
            const response = await FileTDRService({
                reservationId: transactionsummary?.reservationId,
                codestring,
                rsnInde: selectedTDRReason,
                eftAmount,
                eftNumber,
                eftDate,
                tdrreason: tdrreason.find(
                    (item: { reasonIndex: string }) => item.reasonIndex === selectedTDRReason
                ),
            });

            // SUCCESS 🚀
            if (response?.status === 200 || response?.status === 201) {
                showMessage("Success", response?.data?.message || "TDR Filed Successfully");
            }
        } catch (error: any) {
            // ERROR ❌
            showMessage(
                "Error",
                error?.response?.data?.message || "Something went wrong"
            );
        } finally {
            setfiletdr(false); // Close Modal
        }
    };


    const OPTVikalpHandel = async () => {
        // setActiveTab('optvikalp');
    };


    const NewBookingInitiate = async () => {
        try {
            if (useCurrentBookingDetails) {
                await AsyncStorage.setItem("currentDetails", "true");

                const dataToPass = {
                    fromStation: `${stationNames?.toStation} - ${transactionsummary?.destStn}`,
                    toStation: `${stationNames?.fromStation} - ${transactionsummary?.fromStn}`,
                    journeyDate: new Date(transactionsummary?.destArrvDate)
                        .toISOString()
                        .split("T")[0],
                    mobileNumber: mobile,
                };

                await AsyncStorage.setItem("searchInitData", JSON.stringify(dataToPass));

                await AsyncStorage.setItem(
                    "initialBooking",
                    JSON.stringify({
                        passengerList,
                        infantList: infantdetails,
                        gstDetails: transactionsummary?.gstDetailsDTO,
                        email,
                        mobileNumber: mobile,
                    })
                );
            } else {
                await AsyncStorage.setItem("currentDetails", "false");
            }

            // ⏩ Navigate to new booking screen
            router.push("/rail/searchTrain" as any);
        } catch (error) {
            console.error("Error saving data:", error);
            // optionally:
            // showMessage("Error", "Failed to start new booking");
        }
    };


    const RefreshHandel = async () => {
        setLoading(true);
        if (wsUserLogin && transactionsummary?.reservationId) {
            const response = await PNRHistoryService(
                wsUserLogin,
                transactionsummary.reservationId
            );
            if (response && response?.data) {
                await fetchRailBookingSession();
            }
        }
        setLoading(false);
    };

    const maxPassengerCount = 6;
    const codestring =
        transactionsummary?.psgnDtlList?.reduce(
            (acc: any, passenger: any, index: any) => {
                // Append 'Y' or 'N' based on whether the passenger is selected.
                return acc + (selectedPassengers[passenger._id] ? 'Y' : 'N');
            },
            ''
        ) + 'N'.repeat(maxPassengerCount - transactionsummary?.psgnDtlList?.length);


    const Cancellation = async () => {
        try {
            setIsCancelling(true);

            const response = await Cancellationservice(
                transactionsummary?.reservationId,
                codestring
            );

            if (
                response?.status === 200 ||
                (response?.status === 201 && response?.data?.success === true)
            ) {
                await PNRHistoryService(wsUserLogin, transactionsummary.reservationId);
                await fetchRailBookingSession();

                setCancellationId(response.data.canclienttxnid);
                setisCancel(false);
                setSuccessModal(true);
                setotpModal(true);

                // 👇 React Native replacement for toast.success
                showMessage("Success", "Ticket Cancelled Successfully");
                // OR showMessage("Success", "Ticket Cancelled Successfully");
            }
        } catch (error: any) {
            showMessage(
                "Error",
                error?.response?.data?.message || "Something went wrong"
            );
            setisCancel(false);
        } finally {
            setIsCancelling(false);
        }
    };

    const Handelcancellation = async (cancellationid: string) => {
        setCancellationId(cancellationid);

        if (cancellationid && transactionsummary?.pnrNumber) {
            try {
                const response = await SendOTPRailCancellationService(
                    cancellationid,
                    transactionsummary?.pnrNumber
                );

                if (response?.data) {
                    setMessageInfo(response.data.messageInfo);

                    // 📢 React Native replacement for toast.success
                    showMessage("Success", response.data.messageInfo || "OTP sent successfully");

                    setotpModal(true); // Open OTP Modal

                    // Start timer for OTP resend button
                    setOtpTimers((prev) => ({
                        ...prev,
                        [cancellationid]: { timeLeft: 180, isDisabled: true },
                    }));
                }
            } catch (error: unknown) {
                const err = error as any;

                showMessage(
                    "Error",
                    err?.response?.data?.message || err?.message || "Something went wrong"
                );
            }
        }
    };

    // 🟢 Just open the OTP Modal
    const HandelcancellationClick = (cancellationid: string) => {
        setCancellationId(cancellationid);
        setotpModal(true);
    };


    const HandleSendOTP = async () => {
        try {
            setIsCancelling(true);

            const response = await SendOTPForCancellationService(
                ownerID,
                transactionsummary?.reservationId
            );

            if (response?.status === 200 || response?.status === 201) {
                showMessage("Success", "OTP Sent Successfully"); // 🚀 Replaced toast
                // showMessage("Success", "OTP Sent Successfully"); // Optional

                setisCancel(false);
                setpartnerotpModal(true);
            }
        } catch (error: any) {
            showMessage(
                "Error",
                error?.response?.data?.message || "Something went wrong"
            );
            // showMessage("Error", error?.response?.data?.message || "Something went wrong");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleClick = () => {
        Handelcancellation(cancellationId);
    };

    const VerifyOTP = async (otp: string) => {
        try {
            const response = await VerifyOTPRailCancellationService(
                cancellationId,
                transactionsummary?.pnrNumber,
                alreadyVerified ? "12345" : otp
            );

            const message = response?.data?.messageInfo || "";

            if (message === "OTP verified") {
                showMessage("Success", message || "OTP verified successfully");
                setotpModal(false);
                await fetchRailBookingSession();
            }
            else if (message === "OTP already verified") {
                showMessage("Success", message || "OTP already verified");
                setotpModal(false);
                setAlreadyVerified(false);
                await fetchRailBookingSession();
            }
            else {
                showMessage("Error", message || "OTP verification failed");
            }

        } catch (error: unknown) {
            const err = error as any;
            showMessage(
                "Error",
                err?.response?.data?.message || err?.message || "Something went wrong"
            );
        }
    };

    const selectedReasonObj = tdrreason?.find(
        (rsn: any) => rsn?.reasonIndex === selectedTDRReason
    );

    const eftNotAllowed = tdrEFTDontAllow?.some(
        (rsn: any) => rsn?.tdrReason === selectedReasonObj?.tdrReason
    );




    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-700">
                <ActivityIndicator size="large" />
                <Text className="text-gray-600 mt-2">Fetching Data...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-900 p-1">

            {/* ===== HEADER (TOP BAR LIKE SCREENSHOT) ===== */}
            <View className="flex-row justify-between items-center py-3 bg-gray-700 rounded-lg px-4 mb-1">
                <View >
                    <TouchableOpacity
                        onPress={() => router.push("/(drawer)/rail/railbookings")}   // 🟢 FUNCTION CALL
                        className="bg-red-500 p-2 rounded-full"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <Text className="text-white mr-24 text-base font-semibold">
                    Transaction Summary
                </Text>

            </View>

            {/* ===== MAIN CONTENT ===== */}
            {loading ? (
                <View className="flex-1 justify-center items-center mt-20">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white mt-2">Fetching Data...</Text>
                </View>
            ) : error ? (
                <Text className="text-red-500 text-center mt-20">{error}</Text>
            ) : (
                <>
                    {/* ===== RAIL BOOKING ID CARD ===== */}
                    <View className="bg-gray-800 rounded-lg p-4 mb-1 items-center">
                        <Text className="text-gray-400 text-xs mb-1">RAIL BOOKING ID</Text>
                        <View className="flex-row items-center">
                            <Text className="text-green-500 text-sm font-bold">
                                {railbookingID && railbookingID !== "null" ? String(railbookingID) : "N/A"}
                            </Text>

                            <Ionicons name="information-circle-outline" size={18} color="#22c55e" className="ml-1" />
                        </View>
                    </View>

                    {/* ===== IRCTC TRANSACTION ID ===== */}
                    <View className="bg-gray-800 rounded-lg p-4 mb-1 items-center">
                        <Text className="text-gray-400 text-xs mb-1">IRCTC TRANSACTION ID</Text>
                        <Text className="text-green-500 text-sm  font-bold">
                            {transactionsummary?.reservationId || "N/A"}
                        </Text>
                    </View>

                    {/* ===== PNR ===== */}
                    <View className="bg-gray-800 rounded-lg p-4 mb-1 items-center">
                        <Text className="text-gray-400 text-xs mb-1">PNR</Text>
                        <Text className="text-green-500 text-sm  font-bold">
                            {transactionsummary?.pnrNumber || "N/A"}
                        </Text>
                    </View>

                    {/* ===== STATUS ===== */}
                    <View className="bg-gray-800 rounded-lg p-4 mb-1 items-center">
                        <Text className="text-gray-400 text-xs mb-1">STATUS</Text>
                        <Text
                            className={`text-lg font-bold ${bookingStatus === "Booked"
                                ? "text-green-500"
                                : bookingStatus === "Cancelled"
                                    ? "text-red-500"
                                    : "text-yellow-500"
                                }`}
                        >
                            {bookingStatus || "N/A"}
                        </Text>
                    </View>

                    <View className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">

                        {/* TOP ROW */}
                        <View className="flex-row items-center justify-between flex-wrap">

                            {/* CLASS & QUOTA BADGE */}
                            <View className="flex flex-row gap-3 items-center">
                                <View className="flex-row rounded-lg overflow-hidden">
                                    <Text className="bg-blue-500 text-white px-3 py-1 text-sm">
                                        {transactionsummary?.journeyClass || "Set Class"}
                                    </Text>
                                    <Text className="bg-red-500 text-white px-3 py-1 text-sm">
                                        {transactionsummary?.journeyQuota || "Set Quota"}
                                    </Text>
                                </View>

                                {/* TRAIN BADGE */}
                                <TouchableOpacity onPress={() => GetTrainSchedule(true)}>
                                    <View className="bg-gray-300 dark:bg-gray-600 flex-row items-center rounded-md px-3 py-1">
                                        <View className="w-8 h-8 bg-red-500 rounded justify-center items-center">
                                            <FontAwesome6 name="train-subway" size={18} color="white" />
                                        </View>
                                        <Text className="text-black dark:text-white text-sm ml-2">
                                            {transactionsummary?.trainNumber || "Train No"}
                                            {transactionsummary?.trainName
                                                ? ` - ${transactionsummary?.trainName}`
                                                : ""}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* TRAIN NAME BELOW – MOBILE VIEW */}
                        <View className="items-center mt-3">
                            <Text className="text-lg font-semibold text-white">
                                {transactionsummary?.trainName}
                            </Text>
                        </View>

                        {/* MAIN DETAILS */}
                        <View className="flex-row justify-between items-start mt-4">

                            {/* DEPARTURE */}
                            <View className="items-center w-1/3">
                                <Text className="text-blue-400 text-sm font-medium">Departure</Text>
                                <Text className="text-white text-sm">
                                    {transactionsummary?.departureTime} -{" "}
                                    {DateTime.fromISO(transactionsummary?.journeyDate)
                                        .setZone("Asia/Kolkata")
                                        .toFormat("EEE dd LLL")}
                                </Text>
                                <Text className="text-blue-400 text-sm">
                                    {transactionsummary?.fromStn} - {stationNames?.fromStation}
                                </Text>
                            </View>

                            {/* DISTANCE + HALTS */}
                            <View className="items-center w-1/3">
                                <Text className="text-white text-sm">{routeDetails?.distance} Km</Text>
                                <Text className="text-white text-sm">
                                    - {routeDetails?.halt} Halts -
                                </Text>
                                <Text className="text-white text-sm">
                                    {routeDetails?.duration ? formatDuration(routeDetails?.duration) : ""}
                                </Text>
                            </View>

                            {/* ARRIVAL */}
                            <View className="items-center w-1/3">
                                <Text className="text-red-400 text-sm font-medium">Arrival</Text>
                                <Text className="text-white text-sm">
                                    {transactionsummary?.arrivalTime} -{" "}
                                    {DateTime.fromISO(transactionsummary?.destArrvDate)
                                        .setZone("Asia/Kolkata")
                                        .toFormat("EEE dd LLL")}
                                </Text>
                                <Text className="text-red-400 text-sm">
                                    {transactionsummary?.destStn} - {stationNames?.toStation}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="w-full bg-white dark:bg-gray-800 rounded-lg p-3 mt-1">

                        {/* FIRST ROW */}
                        <View className="flex flex-col md:flex-row items-center justify-start w-full gap-4">

                            {/* BOARDING AT ROW */}
                            <View className="flex flex-col md:flex-row gap-2 items-center">
                                <Text className="font-semibold text-base text-black dark:text-white">
                                    Boarding At:
                                </Text>

                                {/* Touchable wrapper like input-with-edit */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        if (
                                            DateTime.fromISO(transactionsummary?.journeyDate)
                                                .startOf("day") < DateTime.now().startOf("day")
                                        ) {
                                            showMessage("Error", "Oops! You can’t select a boarding point that has already passed.");
                                            return;
                                        }
                                        if (BPChange?.success === "true") {
                                            showMessage("Error", "You can’t change a boarding point that was already changed.");
                                            return;
                                        }
                                        ChangeBoardingpoint();
                                    }}
                                    className={` dark:border-gray-600 rounded-lg px-3 py-2  w-full whitespace-nowrap`}
                                >
                                    <BoardingAtChange
                                        initialBooking={initialBooking}
                                        boardingStationList={boardingStationList}
                                        disabled={
                                            BPChange?.success === 'true'
                                                ? true
                                                : false ||
                                                DateTime.fromISO(
                                                    transactionsummary?.journeyDate
                                                ).startOf('day') <
                                                DateTime.now().startOf('day')
                                        }
                                        selectedBoardingPoint={selectedBoardingPoint}
                                        handleSelectChange={(item) => {
                                            OnBoardingPointselect({ target: { value: item.value } });
                                        }}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* PREVIOUS BOARDING POINT */}
                            {BPChange?.success === "true" && (
                                <View>
                                    <Text className="text-black dark:text-white">
                                        Previous Boarding was at{" "}
                                        <Text className="text-red-500 font-bold">
                                            {BPChange?.oldBoardingPoint}
                                        </Text>
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* WARNING / INFO BUTTON */}
                        <View className="mt-3 w-full items-center">   {/* ✔ Centers in screen */}
                            <TouchableOpacity
                                onPress={() => setBoardinginfo(true)}
                                activeOpacity={0.7}
                                className="w-10 h-10 border border-yellow-500 rounded-lg items-center justify-center"
                            >
                                <Text className="text-yellow-500 text-lg font-bold">!</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View className="w-full bg-gray-800 rounded-lg p-3 mt-2">

                        <View className="flex-row flex-wrap justify-between items-center w-full gap-2">

                            {/* PRINT TICKET */}
                            <TouchableOpacity
                                onPress={handlePrintTicketClick}
                                className="bg-blue-600 px-3 py-2 rounded-lg"
                                activeOpacity={0.7}
                            >
                                <FontAwesome5 name="print" size={18} color="white" />
                            </TouchableOpacity>

                            {/* SEND EMAIL */}
                            <TouchableOpacity
                                onPress={() => {
                                    setEmailModal(true);
                                    setTicketemail(email);
                                }}
                                className="bg-blue-600 px-3 py-2 rounded-lg"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="mail" size={18} color="white" />
                            </TouchableOpacity>

                            {/* SEND WHATSAPP */}
                            <TouchableOpacity
                                onPress={() => setWhatsappModal(true)}
                                className="bg-green-600 px-3 py-2 rounded-lg"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="logo-whatsapp" size={20} color="white" />
                            </TouchableOpacity>

                            {/* PNR STATUS BUTTON (already in RN) */}
                            <PnrStatusCheck
                                pnrNumber={transactionsummary?.pnrNumber}
                                quota={RBresponse?.quota}
                            />

                        </View>
                    </View>

                    {/* Passennger Details */}
                    <View className="w-full mt-1">

                        {/* Card Container */}
                        <View className="bg-gray-800 rounded-lg p-2">

                            {/* Header */}
                            <View className="flex-row justify-between items-center w-full p-2 bg-blue-600 rounded">
                                <View className="flex-row items-center">
                                    <Text className="text-white font-bold text-base">Passenger Details</Text>
                                    <Ionicons name="people" size={20} color="white" style={{ marginLeft: 6 }} />
                                </View>

                                {/* SELECT ALL CHECKBOX */}
                                <Checkbox
                                    value={selectAll}
                                    onValueChange={handleSelectAll} // already defined by you ✔
                                    disabled={transactionsummary?.psgnDtlList?.every(
                                        (p: any) => p.currentStatus === "CAN"
                                    )}
                                    className="mr-2"
                                />
                            </View>

                            {/* PASSENGER LIST */}
                            <ScrollView style={{ flexGrow: 1 }} className="mt-2">
                                {transactionsummary?.psgnDtlList?.map((passenger: any, index: number) => (
                                    <View key={passenger._id} className="bg-gray-700 rounded-lg p-3 mb-2">

                                        {/* NAME + AGE + GENDER */}
                                        <View className="flex-row justify-between">
                                            <View className="w-1/3">
                                                <Text className="text-gray-400 text-xs">Name</Text>
                                                <Text className="text-white font-bold">{passenger.passengerName}</Text>
                                            </View>
                                            <View className="w-1/6">
                                                <Text className="text-gray-400 text-xs">Age</Text>
                                                <Text className="text-white font-bold">{passenger.passengerAge}</Text>
                                            </View>
                                            <View className="w-1/4">
                                                <Text className="text-gray-400 text-xs">Gender</Text>
                                                <Text className="text-white font-bold">
                                                    {passenger.passengerGender === "M"
                                                        ? "Male"
                                                        : passenger.passengerGender === "F"
                                                            ? "Female"
                                                            : "Transgender"}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* BOOKING STATUS */}
                                        <View className="mt-2">
                                            <Text className="text-gray-400 text-xs">Booking Status</Text>
                                            <Text className="text-white font-bold">
                                                {passenger.bookingStatus}
                                                {passenger.bookingCoachId ? ` / ${passenger.bookingCoachId}` : ""}
                                                {passenger.bookingBerthNo ? ` / ${passenger.bookingBerthNo}` : ""}
                                                {passenger.bookingBerthCode ? ` / ${passenger.bookingBerthCode}` : ""}
                                            </Text>
                                        </View>

                                        {/* CURRENT STATUS */}
                                        <View className="mt-2">
                                            <Text className="text-gray-400 text-xs">Current Status</Text>
                                            <Text
                                                className={`font-bold text-sm ${passenger.currentStatus === "CAN" ? "text-red-500" : "text-white"
                                                    }`}
                                            >
                                                {lastStatus?.passengerList.find(
                                                    (pax: any) => Number(pax.passengerSerialNumber) === Number(passenger.passengerSerialNumber)
                                                )?.currentStatus ||
                                                    pnrStatus?.passengerList.find(
                                                        (pax: any) =>
                                                            Number(pax.passengerSerialNumber) === Number(passenger.passengerSerialNumber)
                                                    )?.currentStatus ||
                                                    passenger?.currentStatus}

                                                {/* clickable extra status */}
                                                <Text
                                                    className="text-blue-400"
                                                    onPress={() => OpenCancellationCard(passenger?.passengerName)}
                                                >
                                                    {passenger?.currentStatus === "CAN"
                                                        ? ` / ${GetStatusByName(passenger?.passengerName)}`
                                                        : ""}
                                                </Text>

                                                {pnrStatus && passenger?.currentStatus !== "CAN"
                                                    ? PassengerStatus(
                                                        lastStatus?.passengerList?.find(
                                                            (pax: any) => Number(pax.passengerSerialNumber) === Number(passenger.passengerSerialNumber)
                                                        ),
                                                        pnrStatus
                                                    )
                                                    : PassengerStatus(passenger, pnrStatus)}
                                            </Text>
                                        </View>

                                        {/* FARE + CHECKBOX */}
                                        <View className="flex-row justify-between items-center mt-3">
                                            <Text className="text-green-400 font-bold">
                                                ₹ {formatNumberToSouthAsian(passenger?.passengerNetFare ?? 0)}
                                            </Text>

                                            <Checkbox
                                                value={selectedPassengers[passenger._id] && passenger.currentStatus !== "CAN"}
                                                onValueChange={(checked) => handleSelectOne(passenger._id, checked)}  // ✔ your function
                                                disabled={passenger.currentStatus === "CAN"}
                                            />
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Fare Details */}
                    <View className="w-full mt-2">

                        <View className="bg-gray-800 rounded-lg p-3 w-full  shadow-md">

                            {/* HEADER */}
                            <Text className="text-white text-base font-bold bg-blue-600 text-center rounded py-2">
                                Fare Details
                            </Text>

                            {RBresponse && (
                                <View className="mt-3">

                                    {/* TICKET FARE */}
                                    <View className="flex-row justify-between py-1">
                                        <Text className="text-gray-300 text-sm">Ticket Fare</Text>
                                        <Text className="text-gray-300 text-sm">
                                            ₹ {formatNumberToSouthAsian(
                                                Number(RBresponse?.totalFare) -
                                                Number(RBresponse?.cateringCharge)
                                            )}
                                        </Text>
                                    </View>

                                    {/* CATERING CHARGE */}
                                    {RBresponse?.cateringCharge != "0" && (
                                        <View className="flex-row justify-between py-1">
                                            <Text className="text-gray-300 text-sm">Catering Charge</Text>
                                            <Text className="text-gray-300 text-sm">
                                                ₹ {formatNumberToSouthAsian(RBresponse?.cateringCharge ?? 0)}
                                            </Text>
                                        </View>
                                    )}

                                    {/* IRCTC FEE */}
                                    <View className="flex-row justify-between py-1">
                                        <Text className="text-gray-300 text-sm">IRCTC Fee</Text>
                                        <Text className="text-gray-300 text-sm">
                                            ₹ {formatNumberToSouthAsian(
                                                Number(RBresponse?.wpServiceTax) +
                                                Number(RBresponse?.wpServiceCharge)
                                            )}
                                        </Text>
                                    </View>

                                    {/* TRAVEL INSURANCE */}
                                    {transactionsummary?.insuranceCharge > 0 && (
                                        <TouchableOpacity
                                            onPress={toggleTravelInsuranceModal}
                                            className="flex-row justify-between items-center py-1"
                                        >
                                            <Text className="text-gray-300 text-sm flex-row">
                                                Travel Insurance
                                                <Ionicons
                                                    name="information-circle"
                                                    size={16}
                                                    className="ml-1 text-blue-400"
                                                />
                                            </Text>
                                            <Text className="text-gray-300 text-sm">
                                                ₹ {formatNumberToSouthAsian(
                                                    Number(transactionsummary?.insuranceCharge ?? 0)
                                                )}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* TOTAL RAIL FARE */}
                                    <View className="flex-row justify-between border-t border-gray-600 py-1 mt-2">
                                        <Text className="text-white font-semibold">Total Rail Fare</Text>
                                        <Text className="text-white font-semibold">
                                            ₹ {formatNumberToSouthAsian(
                                                Number(RBresponse?.totalCollectibleAmount)
                                            )}
                                        </Text>
                                    </View>

                                    {/* PG CHARGE */}
                                    <View className="flex-row justify-between py-1">
                                        <Text className="text-gray-300 text-sm">PG Charge</Text>
                                        <Text className="text-gray-300 text-sm">
                                            ₹ {formatNumberToSouthAsian(commercials?.pgCharge ?? 0)}
                                        </Text>
                                    </View>

                                    {/* TRAVEL AGENT FEE */}
                                    <View className="flex-row justify-between py-1">
                                        <Text className="text-gray-300 text-sm">Travel Agent Fee</Text>
                                        <Text className="text-gray-300 text-sm">
                                            ₹ {formatNumberToSouthAsian(commercials?.TravelAgentFee ?? 0)}
                                        </Text>
                                    </View>

                                    {/* TOTAL FARE */}
                                    <View className="flex-row justify-between py-2 mt-2 bg-green-700 rounded-lg px-2">
                                        <Text className="text-white font-bold">Total Fare</Text>
                                        <Text className="text-white font-bold">
                                            ₹{" "}
                                            {RBresponse?.totalFare &&
                                                (
                                                    Number(RBresponse?.totalCollectibleAmount) +
                                                    Number(commercials?.TravelAgentFee) +
                                                    Number(commercials?.pgCharge)
                                                ).toFixed(2)}
                                        </Text>
                                    </View>

                                </View>
                            )}
                        </View>
                    </View>

                    {typeof infantdetails === "undefined" || infantdetails === null ? (
                        // ⏳ Loading Spinner
                        <View className="flex-1 justify-center items-center my-5">
                            <ActivityIndicator size="large" color="#2196F3" />
                            <Text className="text-white mt-2">Loading...</Text>
                        </View>
                    ) : (
                        <View className="w-full mt-2">
                            <View className="bg-gray-800 rounded-lg p-3">

                                {/* HEADER */}
                                <Text className="bg-blue-600 text-white font-bold text-center rounded py-2">
                                    Child below 5 year without berth
                                </Text>

                                {/* TABLE / LIST */}
                                {infantdetails?.length > 0 ? (
                                    infantdetails.map((infant: any) => (
                                        <View
                                            key={infant._id}
                                            style={{
                                                flexDirection: "row",
                                                justifyContent: "space-between",
                                                padding: 8,
                                                borderBottomWidth: 1,
                                                borderColor: "#374151",
                                            }}
                                        >
                                            <Text style={{ color: "white", width: "33%" }}>{infant.name}</Text>
                                            <Text style={{ color: "white", width: "33%", textAlign: "center" }}>
                                                {infant.gender}
                                            </Text>
                                            <Text style={{ color: "white", width: "33%", textAlign: "right" }}>
                                                {infant.age}
                                            </Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ textAlign: "center", color: "#d1d5db", paddingVertical: 12 }}>
                                        No Infant Details
                                    </Text>
                                )}

                            </View>
                        </View>
                    )}

                    {/* CONTACT DETAILS */}
                    <View className="w-full mt-3">
                        <View className="bg-gray-800 rounded-lg p-3 ">

                            <Text className="bg-blue-600 text-white font-bold text-center py-2 rounded">
                                Contact Details
                            </Text>

                            <View className="flex-row items-center mt-2" style={{ alignItems: "center" }}>
                                <Ionicons
                                    name="call"
                                    size={20}
                                    color="white"
                                    style={{ marginRight: 8 }} // NO className
                                />

                                <Text
                                    className="text-white flex-1"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {mobile || "N/A"}
                                </Text>

                                <MaterialCommunityIcons
                                    name="close-circle"
                                    size={20}
                                    color="red"
                                />
                            </View>


                            <View className="flex-row items-center mt-2">

                                {/* Email */}
                                <Ionicons name="mail" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white flex-1" numberOfLines={1}>
                                    {email}
                                </Text>
                                <MaterialCommunityIcons name="check-circle" size={20} color="green" />

                            </View>
                        </View>
                    </View>


                    {/* GST DETAILS */}
                    <View className="w-full mt-3">
                        <View className="bg-gray-800 rounded-lg p-3">

                            <Text className="bg-blue-600 text-white font-bold text-center py-2 rounded">
                                GST Details
                            </Text>

                            <View className="flex items-center justify-center mt-3">
                                {transactionsummary?.gstDetailsDTO?.gstIn ? (
                                    <View className="bg-gray-700 rounded-lg p-3 w-[95%]">
                                        <Text className="text-white text-center">
                                            {transactionsummary?.gstDetailsDTO?.gstIn}
                                        </Text>
                                        <Text className="text-white text-center mt-1">
                                            {transactionsummary?.gstDetailsDTO?.nameOnGst}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-gray-300 text-center">No GST Details</Text>
                                )}
                            </View>

                        </View>
                    </View>


                    {/* BOOKING OPTION BLOCK */}
                    <View className="w-full mt-3">
                        <View className="bg-gray-800 rounded-lg p-3">

                            {/* HEADER */}
                            <Text className="bg-blue-600 text-white text-center font-bold py-2 rounded">
                                Booking Option
                            </Text>

                            {/* BUTTONS */}
                            <View className="flex-row flex-wrap justify-center items-center gap-2 mt-2">

                                {/* CANCEL BUTTON */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={onCacellationClick}
                                    disabled={
                                        !codestring.includes("Y") ||
                                        DateTime.fromISO(transactionsummary?.journeyDate)
                                            .diffNow("days").days < -7
                                    }
                                    className={`px-4 py-2 rounded-lg ${!codestring.includes("Y") ||
                                        DateTime.fromISO(transactionsummary?.journeyDate)
                                            .diffNow("days").days < -7
                                        ? "bg-gray-600"
                                        : "bg-red-600"
                                        }`}
                                >
                                    <Text className="text-white font-bold">Cancel</Text>
                                </TouchableOpacity>

                                {/* FILE TDR BUTTON */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={FileTDRHandelAndReason}
                                    disabled={
                                        !codestring.includes("Y") ||
                                        DateTime.fromISO(transactionsummary?.journeyDate)
                                            .diffNow("days").days < -15
                                    }
                                    className={`px-4 py-2 rounded-lg ${!codestring.includes("Y") ||
                                        DateTime.fromISO(transactionsummary?.journeyDate)
                                            .diffNow("days").days < -15
                                        ? "bg-gray-600"
                                        : "bg-blue-500"
                                        }`}
                                >
                                    <Text className="text-white font-bold">FILE TDR</Text>
                                </TouchableOpacity>

                                {/* OPT VIKALP BUTTON */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={OPTVikalpHandel}
                                    className="bg-green-600 px-4 py-2 rounded-lg"
                                >
                                    <Text className="text-white font-bold">OPT Vikalp</Text>
                                </TouchableOpacity>

                                {/* ADMIN ONLY BUTTON */}
                                {user?.role === Roles.ADMIN && lastStatus && (
                                    <LastBookingStatus
                                        lastStatus={lastStatus}
                                        quota={transactionsummary?.journeyQuota}
                                    />
                                )}
                            </View>
                        </View>
                    </View>


                    {/* BOOKED & UPDATED SECTION */}
                    <View className="w-full mt-2 bg-gray-800 rounded-lg p-3">
                        <View className="flex-row flex-wrap justify-between items-center w-full">

                            {/* BOOKED AT */}
                            <Text className="text-white font-semibold">
                                Booked At: <Text className="text-green-500">{bookedAt}</Text>
                            </Text>

                            {/* REFRESH BUTTON */}
                            <TouchableOpacity
                                onPress={RefreshHandel}
                                disabled={
                                    !!(
                                        user &&
                                        user?.role !== "admin" &&
                                        DateTime.fromISO(transactionsummary?.journeyDate)
                                            .diffNow("days").days < -31
                                    )
                                }
                                className={`px-4 py-2 rounded-lg ${user &&
                                    user?.role !== "admin" &&
                                    DateTime.fromISO(transactionsummary?.journeyDate)
                                        .diffNow("days").days < -31
                                    ? "bg-gray-600"
                                    : "bg-blue-600"
                                    }`}
                            >
                                <Text className="text-white font-bold text-center">Refresh</Text>
                            </TouchableOpacity>

                            {/* UPDATED AT */}
                            <Text className="text-white font-semibold">
                                Updated At: <Text className="text-green-500">{updatedAt}</Text>
                            </Text>
                        </View>
                    </View>


                    {/* SECOND CARD */}
                    <View className="w-full mt-2 bg-gray-800 rounded-lg px-4 py-3">

                        {/* RESERVATION STATUS (LEFT) */}
                        {transactionsummary?.resvDetails?.reservationStatus && (
                            <View className="flex-row items-center mb-2">
                                <Text className="text-white font-bold">Reservation Status: </Text>
                                <Text className="text-gray-300">
                                    {transactionsummary.resvDetails.reservationStatus}
                                </Text>
                            </View>
                        )}

                        {/* CHECKBOX + NEW BOOKING BUTTON (RIGHT) */}
                        <View className="flex-row items-center justify-between w-full">

                            {/* CHECKBOX */}
                            <View className="flex-row items-center">
                                <Checkbox
                                    value={useCurrentBookingDetails}
                                    onValueChange={() => setUseCurrentBookingDetails(!useCurrentBookingDetails)}
                                    className="mr-2"
                                />
                                <Text className="text-white">Use Current Booking Details</Text>
                            </View>

                            {/* NEW BOOKING BUTTON */}
                            <TouchableOpacity
                                onPress={NewBookingInitiate}
                                className="bg-green-600 px-4 py-2 rounded-lg"
                                activeOpacity={0.7}
                            >
                                <Text className="text-white font-bold text-center">New Booking</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </>
            )}

            {/* ======= CONFIRM BOARDING CHANGE MODAL ======= */}
            <Modal visible={modal} transparent animationType="fade">
                {/* Overlay */}
                <View className="flex-1 bg-black/50 justify-center items-center px-4">

                    {/* Modal Content */}
                    <View className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-4 shadow-xl">

                        {/* Title */}
                        <Text className="text-center text-white text-lg font-semibold">
                            Want To Change your Boarding Point?
                        </Text>

                        {/* DETAILS CARD SECTION */}
                        <View className="flex flex-col justify-center items-center gap-3 p-3">

                            {/* OLD BOARDING */}
                            <View className="w-full rounded-xl border border-gray-300 dark:border-gray-700 p-3 shadow-sm">
                                <Text className="text-blue-600 font-bold text-center dark:text-blue-400">
                                    {transactionsummary?.boardingStn}-{transactionsummary?.boardingStnName} |
                                    {" "}
                                    {transactionsummary?.departureTime} {" "}
                                    {DateTime.fromISO(transactionsummary?.boardingDate).toFormat("EEE dd LLL")} at{" "}
                                    {transactionsummary?.departureTime}
                                </Text>
                            </View>

                            {/* Arrow */}
                            <Ionicons name="arrow-down" size={26} style={{ marginRight: 8 }} />

                            {/* NEW BOARDING */}
                            <View className="w-full rounded-xl border border-gray-300 dark:border-gray-700 p-3 shadow-sm">
                                <Text className="text-red-600 font-bold text-center dark:text-red-400">
                                    {newBoardingDetails}
                                </Text>
                            </View>
                        </View>

                        {/* Note */}
                        <View style={{ marginTop: 8 }}>
                            <Text style={{ textAlign: "center" }}>
                                <Text style={{ color: "#facc15", fontWeight: "bold" }}>Note: </Text>
                                <Text style={{ color: "white" }}>
                                    The boarding point can only be changed once and must be applied to all passengers.
                                </Text>
                            </Text>
                        </View>


                        {/* Buttons */}
                        <View className="flex-row justify-end gap-3 mt-6">
                            <TouchableOpacity
                                onPress={ChangeConfirmBoarding}
                                className="bg-blue-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Confirm</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setModal(false)}
                                className="bg-gray-500 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

            {/* BordingInfo modal */}
            <Modal visible={boardinginfo} transparent animationType="fade">

                {/* Background */}
                <View className="flex-1 bg-black/50 justify-center items-center">

                    {/* FULL SCREEN CARD */}
                    <View className="bg-gray-900 w-[95%] h-[80%] rounded-2xl p-5">

                        {/* HEADER */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white text-lg font-semibold">
                                Change of Boarding Point
                            </Text>

                            <TouchableOpacity onPress={() => setBoardinginfo(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* CONTENT (SCROLLABLE) */}
                        <ScrollView className="flex-1">
                            <Text className="text-white leading-relaxed mb-3">
                                Passenger who has booked e-tickets can change his Boarding station
                                online before 24 hours of the scheduled departure of the train
                                w.e.f. 28-Jan-2016. In case a passenger has changed the boarding
                                point, he will lose all the rights to board the train from the
                                original boarding point. If found travelling without any proper
                                authority to travel, the passenger will have to pay fare with
                                penalty between original boarding point to changed boarding point.
                            </Text>

                            <Text className="text-white leading-relaxed mb-3">
                                Boarding point change is allowed only once.
                            </Text>

                            <Text className="text-white leading-relaxed mb-3">
                                Boarding station can be changed before 24 hours of the scheduled
                                departure of train.
                            </Text>

                            <Text className="text-white leading-relaxed mb-3">
                                Boarding point change is not allowed if ticket is seized.
                            </Text>

                            <Text className="text-white leading-relaxed mb-3">
                                Boarding point change is not allowed for the PNRs with VIKALP
                                option.
                            </Text>

                            <Text className="text-white leading-relaxed mb-3">
                                Online boarding point change is not allowed for I-Ticket.
                            </Text>

                            <Text className="text-white leading-relaxed mb-3">
                                Boarding point change is not allowed for current booking ticket.
                            </Text>
                        </ScrollView>

                        {/* CLOSE BUTTON */}
                        <TouchableOpacity
                            onPress={() => setBoardinginfo(false)}
                            className="mt-4 bg-red-600 py-2 rounded-lg"
                        >
                            <Text className="text-white text-center font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ====== Cancell Modal ====== */}
            <Modal
                visible={isCancel}
                transparent
                animationType="slide"
                onRequestClose={toggleCancel}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-3">
                    <View className="bg-gray-800 rounded-xl p-4 w-full max-h-[90%]">

                        {/* 🔹 Title */}
                        <Text className="text-center text-red-500 text-lg font-semibold">
                            Cancel Booking for Selected Passengers
                        </Text>

                        <Text className="text-center text-sm text-white mt-2">Are you sure you want to cancel the below passengers?</Text>
                        {/* 🔹 Passenger List */}
                        <ScrollView className="mt-3">
                            {transactionsummary?.psgnDtlList
                                ?.filter((p) => selectedPassengers[p._id])
                                .map((passenger, index) => {
                                    const detail =
                                        pnrDetail?.passengerList?.find(
                                            (p: any) =>
                                                Number(p.passengerSerialNumber) ===
                                                Number(passenger.passengerSerialNumber)
                                        ) || {};

                                    return (
                                        <View
                                            key={index}
                                            className="bg-gray-700 rounded-lg p-3 mb-2"
                                        >
                                            <Text className="text-white">
                                                <Text className="font-bold">S. No: </Text>
                                                {detail?.passengerSerialNumber}
                                            </Text>

                                            <Text className="text-white">
                                                <Text className="font-bold">Name: </Text>
                                                {passenger.passengerName}
                                            </Text>

                                            <Text className="text-white">
                                                <Text className="font-bold">Age: </Text>
                                                {detail?.passengerAge}
                                            </Text>

                                            <Text className="text-white">
                                                <Text className="font-bold">Booking Status: </Text>
                                                {`${detail?.bookingStatus || ""}${detail?.bookingCoachId
                                                    ? `/${detail?.bookingCoachId}`
                                                    : ""
                                                    }${detail?.bookingBerthNo
                                                        ? `/${detail?.bookingBerthNo}`
                                                        : ""
                                                    }${detail?.bookingBerthCode
                                                        ? `/${detail?.bookingBerthCode}`
                                                        : ""
                                                    }${pnrDetail?.quota ? `/${pnrDetail?.quota}` : ""
                                                    }`}
                                            </Text>

                                            <Text className="text-white">
                                                <Text className="font-bold">Current Status: </Text>
                                                {[
                                                    detail?.currentStatus,
                                                    detail?.currentCoachId,
                                                    detail?.currentBerthNo,
                                                    detail?.currentBerthCode,
                                                ]
                                                    .filter((prop) => prop !== "0" && Boolean(prop))
                                                    .join("/")}
                                            </Text>
                                        </View>
                                    );
                                })}
                        </ScrollView>

                        {/* 🔹 Train Details */}
                        {pnrDetail && (
                            <View className="bg-gray-700 mt-3 p-3 rounded-lg">
                                <Text className="text-green-500 font-bold mb-2">
                                    Train Details:
                                </Text>
                                <Text className="text-white">Train No: {pnrDetail?.trainNumber}</Text>
                                <Text className="text-white">Train Name: {pnrDetail?.trainName}</Text>
                                <Text className="text-white">
                                    Boarding Date:{" "}
                                    {DateTime.fromISO(pnrDetail?.dateOfJourney).toFormat("d-L-yyyy")}
                                </Text>
                                <Text className="text-white">From: {pnrDetail?.sourceStation}</Text>
                                <Text className="text-white">To: {pnrDetail?.destinationStation}</Text>
                                <Text className="text-white">Boarding Point: {pnrDetail?.boardingPoint}</Text>
                                <Text className="text-white">Class: {pnrDetail?.journeyClass}</Text>
                            </View>
                        )}

                        {/* 🔹 Additional Details */}
                        {pnrDetail && (
                            <View className="bg-gray-700 p-3 mt-3 rounded-lg">
                                <Text className="text-green-500 font-bold mb-2">
                                    Additional Details:
                                </Text>
                                <Text className="text-white">Total Fare: {pnrDetail?.bookingFare}</Text>
                                <Text className="text-white">Charting Status: {pnrDetail?.chartStatus}</Text>
                                <Text className="text-white">Train Status: {pnrDetail?.trainCancelStatus}</Text>
                            </View>
                        )}

                        {/* 🔹 Footer Buttons */}
                        <View className="flex-row justify-between mt-5">
                            {user?.role === "agent" || user?.role === "admin" ? (
                                <>
                                    <TouchableOpacity
                                        onPress={Cancellation}
                                        disabled={isCancelling}
                                        className={`bg-green-500 p-3 rounded-lg w-[45%] items-center ${isCancelling ? "opacity-50" : ""
                                            }`}
                                    >
                                        <Text className="text-white font-bold">
                                            {isCancelling ? "Cancelling..." : "Yes"}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={toggleCancel}
                                        disabled={isCancelling}
                                        className="bg-red-500 p-3 rounded-lg w-[45%] items-center"
                                    >
                                        <Text className="text-white font-bold">No</Text>
                                    </TouchableOpacity>
                                </>
                            ) : user?.role === "partner" ? (
                                <>
                                    <TouchableOpacity
                                        onPress={HandleSendOTP}
                                        disabled={isCancelling}
                                        className="bg-green-500 p-3 rounded-lg w-[45%] items-center"
                                    >
                                        <Text className="text-white font-bold">
                                            {isCancelling ? "Sending OTP..." : "Yes"}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={toggleCancel}
                                        disabled={isCancelling}
                                        className="bg-red-500 p-3 rounded-lg w-[45%] items-center"
                                    >
                                        <Text className="text-white font-bold">No</Text>
                                    </TouchableOpacity>
                                </>
                            ) : null}
                        </View>

                    </View>
                </View>
            </Modal>

            <OTPVerificationModal
                isOpen={otpModal}
                toggle={() => setotpModal(false)}
                mobile={mobile}
                messageInfo={messageInfo}
                isDisabled={otpTimers[cancellationId]?.isDisabled ?? false}
                cancellationId={cancellationId}
                railCancellation={railCancellation}
                pnrNumber={transactionsummary?.pnrNumber}
                handleResendOTP={handleClick}
                handleVerifyOTP={(otp) => VerifyOTP(otp)}
                timeLeftnumber={otpTimers[cancellationId]?.timeLeft ?? 0}
            />

            {/* SUCCESS Message MODAL for cancell ticket */}
            <Modal visible={successModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center">

                    {/* Modal Card */}
                    <View className="bg-white dark:bg-gray-800 rounded-2xl w-[90%] p-5 shadow-lg">

                        {/* Header */}
                        <View className="flex-row items-center border-b border-gray-300 dark:border-gray-700 pb-2 mb-3">
                            <Ionicons name="checkmark-circle-outline" size={24} color="green" />
                            <Text className="text-lg font-bold ml-2 text-green-600 dark:text-green-400">
                                Success
                            </Text>
                        </View>

                        {/* Body */}
                        <View className="items-center justify-center my-4">
                            <MaterialCommunityIcons
                                name="ticket-confirmation-outline"
                                size={70}
                                color="green"
                            />

                            <Text className="text-green-600 font-bold text-lg mt-2">
                                Ticket Cancelled Successfully!
                            </Text>

                            <Text className="text-center text-gray-700 dark:text-gray-300 mt-1">
                                Please verify OTP for refund.
                            </Text>
                        </View>

                        {/* Footer */}
                        <TouchableOpacity
                            onPress={() => setSuccessModal(false)}
                            className="bg-green-600 py-2 rounded-lg"
                            activeOpacity={0.7}
                        >
                            <Text className="text-white text-center font-bold">OK</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

            {/* ----- FILE TDR MODAL ----- */}
            <Modal visible={filetdr} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center px-4">
                    <View className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-5">

                        {/* 🔹 Title */}
                        <Text className="text-center text-lg font-bold text-black dark:text-white">
                            File TDR
                        </Text>

                        {/* 🔹 Message */}
                        <Text className="text-center mt-2 text-black dark:text-white">
                            Are you sure you want to file TDR for the selected passengers?
                        </Text>

                        {/* 🔹 Passenger List */}
                        <ScrollView className="max-h-[200px] mt-3">
                            {transactionsummary?.psgnDtlList
                                ?.filter((p) => selectedPassengers[p._id])
                                .map((passenger) => (
                                    <View
                                        key={passenger._id}
                                        className="flex-row justify-between bg-gray-200 dark:bg-gray-700 rounded-lg px-3 py-2 mb-2"
                                    >
                                        <Text className="text-black dark:text-white w-1/4">{passenger.passengerName}</Text>
                                        <Text className="text-black dark:text-white w-1/4">{passenger.passengerAge}</Text>
                                        <Text className="text-black dark:text-white w-1/4">{passenger.passengerGender}</Text>
                                        <Text className="text-black dark:text-white w-1/4">{passenger.currentStatus}</Text>
                                    </View>
                                ))}
                        </ScrollView>

                        {/* 🔹 Dropdown (Picker) */}
                        <View className="mt-2 border border-gray-400 rounded-lg">
                            <Picker
                                selectedValue={selectedTDRReason}
                                onValueChange={(value) => setSelectedTDRReason(value)}
                            >
                                <Picker.Item label="Select TDR Reason" value="" />
                                {tdrreason?.map((reason: any) => (
                                    <Picker.Item
                                        key={reason.reasonIndex}
                                        label={reason.tdrReason}
                                        value={reason.reasonIndex}
                                    />
                                ))}
                            </Picker>
                        </View>

                        {/* 🔹 EFT Input Fields */}
                        {selectedTDRReason && !eftNotAllowed && (
                            <View className="mt-4">
                                <Text className="text-black dark:text-white font-semibold mb-2">
                                    EFT Details
                                </Text>

                                <TextInput
                                    placeholder="Enter EFT Amount"
                                    keyboardType="numeric"
                                    value={eftAmount}
                                    onChangeText={setEftAmount}
                                    className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 mb-2 text-black dark:text-white"
                                />

                                <TextInput
                                    placeholder="Enter EFT Number"
                                    value={eftNumber}
                                    onChangeText={setEftNumber}
                                    className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 mb-2 text-black dark:text-white"
                                />

                                <TextInput
                                    placeholder="Enter EFT Date (YYYY-MM-DD)"
                                    value={eftDate}
                                    onChangeText={setEftDate}
                                    className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 mb-2 text-black dark:text-white"
                                />
                            </View>
                        )}

                        {/* 🔹 Buttons */}
                        <View className="flex-row justify-between mt-6">
                            <TouchableOpacity
                                onPress={HandlefileTDR}
                                className="bg-blue-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-bold">File TDR</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setfiletdr(false)}
                                className="bg-red-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>



        </ScrollView>
    );
}
