
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, Platform, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { useNavigation, useRoute } from "@react-navigation/native";
import { showMessage } from "@/src/utils/showMessage";
import { GenerateRailBookingsReport, GetRailBookingsMongo } from "@/src/service/reports/reportservice";
import { handleAxiosError } from "@/src/utils/handleAxiosError";
import { DateTime } from "luxon";
import { PendingBookingStatus } from "@/src/service/apiservice";
import { useRole } from "@/src/context/RoleProvider";
import ComponentsChartsArea from "@/src/components/Rail/railBookings/ChartsArea";
import SearchFilterSection from "@/src/components/Rail/railBookings/SearchFilterSection";
import RDSBalanceDetails from "@/src/components/Rail/railBookings/RDSBalanceDetails";
import BookingsTable from "@/src/components/Rail/railBookings/BookingsTable";
import { useGlobalDateRange } from "@/src/hooks/useGlobalDateRange";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface IRailBooking {
    railBookingID: string;
    RBrequest?: {
        passengerList?: any[];
        infantList?: any[];
        gstDetails?: any;
    };
}





export default function RailBookings() {

    const navigation = useNavigation();
    const route = useRoute();

    // ---------------- STATE ----------------
    const [isLoadingStatus, setIsLoadingStatus] = useState({
        isUniversalSearchLoading: false,
        isSearchLoading: false,
        isRefreshLoading: false,
        isGenerateExelLoading: false,
    });

    const setLoadingFor = (key: string, value: boolean) => {
        setIsLoadingStatus(prev => ({ ...prev, [key]: value }));
    };

    const isLoading = Object.values(isLoadingStatus).some(Boolean);

    const [AllBookings, setAllBookings] = useState([]);
    const [page, setPage] = useState(1);
    const [searchItem, setSearchItem] = useState("");
    const [status, setStatus] = useState("");
    const [limit, setLimit] = useState(20);
    const [newBookingModal, setNewBookingModal] = useState(false);

    const [booked, setBooked] = useState(true);
    const [Cancelled, setCancelled] = useState(true);
    const [Failed, setFailed] = useState(true);
    const [Pending, setPending] = useState(true);
    const [partialycancelled, setPartialycancelled] = useState(true);

    const [loadingstatus, setLoadingStatus] = useState({
        loadingStatus: false,
        railBookingId: "",
    });

    const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
    const [pageCount, setPageCount] = React.useState(0);
    const [furtherFilter, setFurtherFilter] = React.useState(false);
    const [clickTime, setClickTime] = useState<number | null>(null);
    const [formattedTime, setFormattedTime] = useState<string>('');

    // REQUIRED STATES
    const { FromDate, ToDate, setFromDate, setToDate, minDate, maxDate } = useGlobalDateRange({ fromDaysAgo: 0 });
    // const [ToDate, setToDate] = useState("");
    const [railTotalDetails, setRailTotalDetails] = useState<any>(null);
    const [bookingFilter, setBookingFilter] = useState({});
    const { user } = useRole();
    const [isChartVisible, setIsChartVisible] = useState(false);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [railBookingId, setRailBookingId] = React.useState('');
    const [RailBookings, setRailBookings] = useState<IRailBooking[]>([]);
    const [searchType, setSearchType] = React.useState("");




    const toggleChartVisibility = () => {
        setIsChartVisible(!isChartVisible);
    };


    // ---------------- FETCH BOOKING DATA ----------------
    const GetAllRailBookings = async (page: number, FromDate: string, ToDate: string, append = false) => {
        try {
            const data = { fromDate: FromDate, toDate: ToDate, page, limit, status, searchItem, searchType: 'simple' }
            await AsyncStorage.setItem(
                "bookingFilter",
                JSON.stringify(data)
            );
            setLoadingFor("isRefreshLoading", true);

            const response = await GetRailBookingsMongo(
                searchItem ? "" : FromDate,
                searchItem ? "" : ToDate,
                page,
                limit,
                searchItem,
                status
            );

            setRailBookings(prev =>
                append ? [...prev, ...response.data.bookings] : response.data.bookings
            );
            setAllBookings(prev =>
                append ? [...prev, ...response.data.bookings] : response.data.bookings
            );
        } catch (error) {
            showMessage("Error", "Error fetching data");
        } finally {
            setLoadingFor("isRefreshLoading", false);
        }
    };

    // ---------------- COPY PNR ----------------
    const handleCopy = async (railBookingID: string) => {
        try {
            await Clipboard.setStringAsync(railBookingID);
            showMessage("Success", "Copied to clipboard");
        } catch {
            showMessage("Error", "Failed to copy");
        }
    };

    // ---------------- OPEN PRINT PAGE ----------------
    const handlePrintTicketClick = () => {
        const url = `/print-train-ticket/?ticketID=${JSON.stringify(RailBookings)}`;
        Linking.openURL(url).catch(() =>
            showMessage("Error", "Failed to open ticket")
        );
    };

    // Function to format the click time into HH:mm (24-hour format)
    const formatClickTime = (time: number): string => {
        // Converts timestamp into a readable time format
        const date = new Date(time);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Handle button click
    const handleClick = (): void => {
        // Captures the current time and formats it
        const currentTime = Date.now();
        setClickTime(currentTime);
        setFormattedTime(formatClickTime(currentTime));
    };

    // ---------------- CALCULATE TOTAL ----------------
    // const calculateSelectedTotalFare = useCallback(() => {
    //     return RailBookings.filter(item => selectedBookings.includes(item.railBookingID))
    //         .reduce((total, item) => {
    //             return total +
    //                 Number(item?.RBresponse?.totalCollectibleAmount ?? 0) +
    //                 Number(item?.commercials?.TravelAgentFee ?? 0) +
    //                 Number(item?.commercials?.pgCharge ?? 0);
    //         }, 0);
    // }, [selectedBookings, RailBookings]);

    useEffect(() => {
        if (!minDate) return;

        const loadFilters = async () => {
            try {
                const savedFilter = await AsyncStorage.getItem("bookingFilter");
                const isReuse = (await AsyncStorage.getItem("re-use-filter")) === "true";

                if (savedFilter && isReuse) {
                    const bookingFilter = JSON.parse(savedFilter);

                    setFromDate(bookingFilter.fromDate || "");
                    setToDate(bookingFilter.toDate || "");
                    setStatus(bookingFilter.status || "");
                    setSearchItem(bookingFilter.searchitem || "");
                    setSearchType(bookingFilter.searchType || "");

                    await AsyncStorage.removeItem("re-use-filter");
                } else {
                    // 🔥 FIX ERROR BELOW:
                    GetAllRailBookings(page, FromDate, ToDate); // <===== FIX
                }
            } catch (error) {
                console.log("Restore filter failed:", error);
            }
        };

        loadFilters();
    }, [limit, minDate]);



    const HandelSearch = async () => {
        try {
            setPage(1);
            setLoadingFor("isSearchLoading", true);

            // 📌 Replace sessionStorage → AsyncStorage
            const data = {
                fromDate: FromDate,
                toDate: ToDate,
                page,
                limit,
                status,
                searchType: "universal",
                searchItem,
            };

            await AsyncStorage.setItem("bookingFilter", JSON.stringify(data));

            // 📌 Date Validation
            const fromDateObj = DateTime.fromISO(FromDate);
            const toDateObj = DateTime.fromISO(ToDate);

            if (fromDateObj > toDateObj) {
                showMessage("Error", "To Date should be greater than From Date");
                return;
            }

            // 📌 API CALL
            const response = await GetRailBookingsMongo(
                searchItem ? "" : FromDate,
                searchItem ? "" : ToDate,
                1,
                limit,
                searchItem,
                status
            );

            // 📌 Update state
            const totalCount = response.data.count;
            setPageCount(Math.ceil(totalCount / limit));
            setRailBookings(response.data.bookings);
            setRailTotalDetails(response?.data?.details ? response?.data?.details[0] : {});
            setFurtherFilter(true);

            handleClick();
        } catch (error) {
            handleAxiosError(error);
            setFurtherFilter(false);
        } finally {
            setLoadingFor("isSearchLoading", false);
        }
    };

    const HandelStatusFilter = (value: string) => {
        switch (value) {
            case "Booked":
                setBooked(!booked);
                break;
            case "Cancelled":
                setCancelled(!Cancelled);
                break;
            case "Failed":
                setFailed(!Failed);
                break;
            case "Pending":
                setPending(!Pending);
                break;
            case "partialycancelled":
                setPartialycancelled(!partialycancelled);
                break;
            default:
                break;
        }
    };

    // Handle pagination change
    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        // GetAllRailBookings(value, FromDate, ToDate);
    };

    // 🔁 HANDLE SEARCH WITH UNIVERSAL  (Converted to React Native)
    const HandelSearchWithUniversal = async () => {
        try {
            setPage(1);
            setLoadingFor("isUniversalSearchLoading", true);

            // 📌 Replace sessionStorage → AsyncStorage
            const data = {
                fromDate: FromDate,
                toDate: ToDate,
                page,
                limit,
                status,
                searchType: "simple",
                searchItem,
            };
            await AsyncStorage.setItem("bookingFilter", JSON.stringify(data));

            // 📌 Validate Dates (Using Luxon)
            const fromDateObj = DateTime.fromISO(FromDate);
            const toDateObj = DateTime.fromISO(ToDate);

            if (fromDateObj > toDateObj) {
                showMessage("Error", "To Date should be greater than From Date");
                return;
            }

            // 📌 API CALL
            const response = await GetRailBookingsMongo(
                FromDate,
                ToDate,
                1,
                limit,
                searchItem,
                status
            );

            // 📌 Update UI / State
            const totalCount = response.data.count;
            setPageCount(Math.ceil(totalCount / limit));
            setRailBookings(response.data.bookings);
            setRailTotalDetails(response?.data?.details ? response?.data?.details[0] : {});
            setFurtherFilter(true);
            handleClick();

        } catch (error) {
            handleAxiosError(error);
            setFurtherFilter(false);
        } finally {
            setLoadingFor("isUniversalSearchLoading", false);
        }
    };

    const HandleNewBooking = async () => {
        try {
            await AsyncStorage.setItem("currentDetails", "true");

            const passengerDetails = RailBookings?.find(
                (item: any) => item.railBookingID === railBookingId
            )?.RBrequest?.passengerList;

            const infants = RailBookings?.find(
                (item: any) => item.railBookingID === railBookingId
            )?.RBrequest?.infantList;

            const gstDetails = RailBookings?.find(
                (item: any) => item.railBookingID === railBookingId
            )?.RBrequest?.gstDetails;

            await AsyncStorage.setItem(
                "initialBooking",
                JSON.stringify({
                    passengerList: passengerDetails,
                    infantList: infants,
                    gstDetails: gstDetails,
                })
            );

            // Navigate to Search Train Page
            router.push("rail/SearchTrain" as any);  // must be defined in navigation config
            setNewBookingModal(false);

        } catch (error) {
            showMessage("Error", "Failed to set initial booking data");
        }
    };

    const HandleGenerateExel = async () => {
        try {
            setLoadingFor("isGenerateExelLoading", true);

            const response = await GenerateRailBookingsReport(FromDate, ToDate, searchItem);

            if (response.status === 200 || response.status === 201) {
                showMessage("Success", response.data.message || "Excel Generated Successfully");
            }
        } catch (error) {
            console.log("Excel Error:", error);
            showMessage("Error", "Failed to generate Excel report");
        } finally {
            setLoadingFor("isGenerateExelLoading", false);
        }
    };

    const HandleCheckStatus = async (railbookingID: string) => {
        try {
            setLoadingStatus({
                loadingStatus: true,
                railBookingId: railbookingID,
            });

            const response = await PendingBookingStatus(railbookingID);

            if (response.status === 200 || response.status === 201) {
                const message =
                    response?.data?.errorMessage ||
                    response?.data?.bookingErrorMessage ||
                    response?.data?.error ||
                    response?.data?.message ||
                    "Api Error";

                showMessage("Warning", `${message} | Please wait or refresh bookings`);
                await GetAllRailBookings(page, FromDate, ToDate);
            }
        } catch (error: any) {
            showMessage("Error", error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoadingStatus({
                loadingStatus: false,
                railBookingId: "",
            });
        }
    };

    // Handle loading more bookings
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        GetAllRailBookings(nextPage, FromDate, ToDate, true);
    };

    return (
        <ScrollView className="max-h-[800px] bg-gray-800 dark:bg-gray-900">
            <View className="w-full flex flex-row gap-4 justify-between bg-gray-800  p-2 mb-1  shadow-md">
                <View className=" ml-2">
                    {/* Back Button - Top Right */}
                    <TouchableOpacity
                        onPress={() => router.push("/agent")}
                        className="top-0 mb-1 "
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-back" size={25} className="text-white" />
                    </TouchableOpacity>
                </View>
                <Text className="text-center text-green-500 font-semibold text-lg mr-4">
                    Rail Bookings
                </Text>
            </View>

            <View className='flex flex-col gap-1'>

                {/* ADMIN */}
                {user?.role === "admin" && (
                    <>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row w-full gap-2 py-2"
                        >
                            <View>
                                <Text className="text-lg text-white">
                                    Total Amount :
                                    <Text className="text-green-500 ml-2">
                                        ₹
                                        {railTotalDetails?.totalCollectibleAmount ??
                                            "0.00"}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Fixed Charges :
                                    <Text className="text-green-500 ml-2">
                                        ₹
                                        {railTotalDetails?.totalFixedCharges ?? "0.00"}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    GST :
                                    <Text className="text-green-500 ml-2">
                                        ₹
                                        {railTotalDetails?.totalgst ?? "0.00"}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    PG Charges :
                                    <Text className="text-green-500 ml-2">
                                        ₹
                                        {railTotalDetails?.totalpgCharge ?? "0.00"}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    PNRs :
                                    <Text className="text-green-500 ml-2">
                                        {railTotalDetails?.totalPNRs ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Cancelled :
                                    <Text className="text-yellow-500 ml-2">
                                        {railTotalDetails?.Cancelled ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Booked :
                                    <Text className="text-green-500 ml-2">
                                        {railTotalDetails?.totalBooked ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Pending :
                                    <Text className="text-blue-400 ml-2">
                                        {railTotalDetails?.totalPending ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Partially Cancelled :
                                    <Text className="text-yellow-500 ml-2">
                                        {railTotalDetails?.totalPartiallyCancelled ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Failed :
                                    <Text className="text-red-500 ml-2">
                                        {railTotalDetails?.totalFailed ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Agencies :
                                    <Text className="text-green-500 ml-2">
                                        {railTotalDetails?.totalAgencies ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    Partners :
                                    <Text className="text-green-500 ml-2">
                                        {railTotalDetails?.totalPartners ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    OTP :
                                    <Text className="text-green-500 ml-2">
                                        {railTotalDetails?.OTP ?? 0}/
                                        {railTotalDetails?.totalUniqueOTPCount ?? 0}
                                    </Text>
                                </Text>
                            </View>

                            <View>
                                <Text className="text-lg text-white">
                                    DSC :
                                    <Text className="text-green-500 ml-2">
                                        {railTotalDetails?.DSC ?? 0}/
                                        {railTotalDetails?.totalUniqueDSCCount ?? 0}
                                    </Text>
                                </Text>
                            </View>
                        </ScrollView>

                        {/* CHART AREA */}
                        <View className="mt-3">
                            <ComponentsChartsArea isChartVisible={isChartVisible} />
                        </View>
                    </>
                )}

                {/* PARTNER */}
                {user?.role === "partner" && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row w-full gap-2 py-2"
                    >
                        <View>
                            <Text className="text-lg text-white">
                                Total Amount :
                                <Text className="text-green-500 ml-2">
                                    ₹
                                    {railTotalDetails?.totalCollectibleAmount ?? "0.00"}
                                </Text>
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg text-white">
                                Fixed Charges :
                                <Text className="text-green-500 ml-2">
                                    ₹
                                    {railTotalDetails?.totalFixedCharges ?? "0.00"}
                                </Text>
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg text-white">
                                GST :
                                <Text className="text-green-500 ml-2">
                                    ₹
                                    {railTotalDetails?.totalgst ?? "0.00"}
                                </Text>
                            </Text>
                        </View>

                        <View>
                            <Text className="text-lg text-white">
                                Charge BTax :
                                <Text className="text-green-500 ml-2">
                                    ₹
                                    {railTotalDetails?.Amountbeforetax ?? "0.00"}
                                </Text>
                            </Text>
                        </View>
                    </ScrollView>
                )}

                <SearchFilterSection
                    searchItem={searchItem}
                    setSearchItem={setSearchItem}
                    HandelSearch={HandelSearch}
                    HandelSearchWithUniversal={HandelSearchWithUniversal}
                    HandleGenerateExel={HandleGenerateExel}
                    GetAllRailBookings={async (page = 1) =>
                        GetAllRailBookings(page, FromDate, ToDate)
                    }
                    isLoadingStatus={isLoadingStatus}
                    isChartVisible={isChartVisible}
                    toggleChartVisibility={toggleChartVisibility}
                    user={user}
                    FromDate={FromDate}
                    setFromDate={setFromDate}
                    ToDate={ToDate}
                    setToDate={setToDate}
                    status={status}
                    setStatus={setStatus}
                    booked={booked}
                    Cancelled={Cancelled}
                    Failed={Failed}
                    Pending={Pending}
                    partialycancelled={partialycancelled}
                    HandelStatusFilter={HandelStatusFilter}
                />

                {user && user.role === 'admin' && (
                    <RDSBalanceDetails />
                )}

                {/* booking list */}
                <BookingsTable
                    RailBookings={RailBookings}
                    user={user}
                    selectedBookings={selectedBookings}
                    setSelectedBookings={setSelectedBookings}
                    selectAll={selectAll}
                    setSelectAll={setSelectAll}
                    isLoading={isLoading}
                    handleLoadMore={handleLoadMore}
                    HandleCheckStatus={HandleCheckStatus}
                    handleCopy={handleCopy}
                    handleChange={handleChange}
                    limit={limit}
                    setLimit={setLimit}
                    page={page}
                    pageCount={pageCount}
                    setNewBookingModal={setNewBookingModal}
                    HandleNewBooking={HandleNewBooking}
                    newBookingModal={newBookingModal}
                    loadingstatus={loadingstatus}

                />
            </View>
        </ScrollView >
    )

}