// 📌 src/components/Rail/BookingsTable.tsx

import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import Checkbox from "expo-checkbox";
import { DateTime } from "luxon";
import { formatNumberToSouthAsian } from "@/src/utils/Number";
import { Ionicons } from "@expo/vector-icons";
import PaginationComponent from "../../pagination";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RequisitionModal from "./RequisitionModal.tsx";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // RN icon pack
import Tooltip from "react-native-walkthrough-tooltip";
import CustomModal from "../../Modal/CustomModal";
import StyledModal from "../../Modal/StyledModal";


interface Props {
    RailBookings: any[];
    user: any;
    selectedBookings: string[];
    setSelectedBookings: React.Dispatch<React.SetStateAction<string[]>>;
    selectAll: boolean;
    setSelectAll: (val: boolean) => void;
    isLoading: boolean;
    handleLoadMore: () => void;
    HandleCheckStatus: (id: string) => void;
    handleCopy: (id: string) => void;
    handleChange: any
    limit: number
    page: number
    pageCount: number
    setLimit: any
    setNewBookingModal: any
    HandleNewBooking: any
    newBookingModal: boolean
    loadingstatus: any
}

export default function BookingsTable({
    RailBookings,
    user,
    selectedBookings,
    setSelectedBookings,
    isLoading,
    handleLoadMore,
    handleCopy,
    handleChange,
    limit,
    page,
    pageCount,
    setLimit,
    HandleCheckStatus,
    setNewBookingModal,
    HandleNewBooking,
    newBookingModal,
    loadingstatus
}: Props) {

    const router = useRouter();

    const [requisitionModal, setRequisitionModal] = React.useState(false);
    const [
        requisitionModalRailBookingIdStatusError,
        setRequisitionModalRailBookingIdStatusError,
    ] = React.useState('');

    const [railBookingId, setRailBookingId] = React.useState('');
    const [model, setModel] = React.useState(false);
    const [showTooltip, setShowTooltip] = useState<string>("");


    const HandelSummaryPage = async () => {
        try {
            await AsyncStorage.setItem(
                "railBookingid",
                JSON.stringify(railBookingId) // store as string
            );
            setModel(false); // close modal
        } catch (error) {
            console.error("Error saving to storage:", error);
        }
    };




    const toggleSelect = (id: string) => {
        if (selectedBookings.includes(id)) {
            setSelectedBookings(selectedBookings.filter((i) => i !== id));
        } else {
            setSelectedBookings([...selectedBookings, id]);
        }
    };

    // Handle ticket printing
    const handlePrintTicketClick = () => {
        const url = `/print-train-ticket/?ticketID=${JSON.stringify(railBookingId)}`;
        const options = 'noopener,noreferrer,width=1000,height=700,left=100,top=100';
        // window.open(url, 'printTicket', options);
    };


    return (
        <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full">
                <View className=" bg-gray-900 border border-gray-700 rounded-xl">

                    {/* -------- HEADER -------- */}
                    <View className="flex-row bg-gray-800 border-b border-gray-700 py-3 rounded-t-xl">

                        <Text className="text-white font-bold w-40 text-xs border-r text-center px-2">Booking Date</Text>
                        <Text className="text-white font-bold w-44 text-xs border-r text-center px-2">Rail Booking ID</Text>
                        <Text className="text-white font-bold w-44 text-xs border-r text-center px-2">Status</Text>
                        <Text className="text-white font-bold w-32 text-xs text-center border-r px-2">PNR Number</Text>
                        <Text className="text-white font-bold w-32 text-xs border-r text-center px-2">Travel Date</Text>
                        <Text className="text-white font-bold w-28 text-xs text-center border-r px-2">Train No</Text>
                        <Text className="text-white font-bold w-28 text-xs border-r text-center px-2">From</Text>
                        <Text className="text-white font-bold w-28 text-xs border-r text-center px-2">Brd Stn</Text>
                        <Text className="text-white font-bold w-28 text-xs border-r text-center px-2">To</Text>
                        <Text className="text-white font-bold w-20 text-xs text-center border-r px-2">Class</Text>
                        <Text className="text-white font-bold w-20 text-xs text-center border-r px-2">Quota</Text>
                        <Text className="text-white font-bold w-36 text-xs border-r text-center px-2">Passengers</Text>
                        <Text className="text-white font-bold w-24 text-xs text-center border-r px-2">Mode</Text>
                        <Text className="text-white font-bold w-28 text-xs text-center border-r  px-2">₹ Rail Fare</Text>
                        <Text className="text-white font-bold w-28 text-xs text-center border-r px-2">₹ Agent Fees</Text>
                        <Text className="text-white font-bold w-28 text-xs text-center border-r px-2">₹ PG Charge</Text>
                        <Text className="text-white font-bold w-16 text-xs border-r text-center px-2">Select</Text>
                        <Text className="text-white font-bold w-32 text-xs text-center border-r px-2">₹ Total Fare</Text>

                        {/* ---- ROLE: admin & partner ---- */}
                        {(user?.role === "admin" || user?.role === "partner") && (
                            <Text className="text-white font-bold w-32 text-xs text-center border-r px-2">WsUserLogin</Text>
                        )}

                        {/* ---- ONLY ADMIN ---- */}
                        {user?.role === "admin" && (
                            <>
                                <Text className="text-white font-bold w-32 text-xs border-r px-2">Account ID</Text>
                                <Text className="text-white font-bold w-32 text-xs border-r px-2">Transaction ID</Text>
                                <Text className="text-white font-bold w-40 text-xs px-2">Client Transaction ID</Text>
                            </>
                        )}
                    </View>


                    {/* -------- BODY -------- */}
                    <ScrollView className="max-h-[450px]">
                        {RailBookings.length === 0 ? (
                            <Text className="text-gray-400 text-center my-4">No records found</Text>
                        ) : (
                            RailBookings.map((item, index) => (

                                <View
                                    key={index}
                                    className={`flex-row items-center py-2 border-b border-gray-700 max-h-[400px] overflow-y-auto
                            ${index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}`}
                                >
                                    <Text className="text-gray-300 w-40 text-xs px-2 font-mono">
                                        {item.initiatedAt ? DateTime.fromISO(item.initiatedAt).toFormat("dd LLL yyyy HH:mm") : "-"}
                                    </Text>

                                    <View className="w-44 flex-row items-center px-2 gap-1">
                                        <TouchableOpacity onPress={() => handleCopy(item.railBookingID)}>
                                            <Ionicons name="copy-outline" size={14} color="#22c55e" />
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="w-full flex-row justify-between items-center gap-3 pr-4"
                                            onPress={() => {
                                                if (
                                                    item.booking_Status === "Pending" ||
                                                    (item.booking_Status === "Failed" && !loadingstatus.loadingStatus)
                                                ) {
                                                    if (item.booking_Status === "Pending" || item.booking_Status === "Failed") {
                                                        setRequisitionModal(true);
                                                        setRequisitionModalRailBookingIdStatusError(item?.Error || "");
                                                        setRailBookingId(item.railBookingID ?? "");
                                                    } else {
                                                        HandleCheckStatus(item.railBookingID);
                                                    }
                                                } else {
                                                    setModel(item.RBTktres?.pnrNumber ? true : false);
                                                    setRailBookingId(item.railBookingID ?? "");
                                                    setNewBookingModal(item.RBTktres?.pnrNumber ? false : true);
                                                }
                                            }}
                                        >
                                            <Text className="text-blue-300 font-mono">
                                                {item.railBookingID || "-"}
                                            </Text>
                                        </TouchableOpacity>

                                        {(item.booking_Status === "Pending" || item.booking_Status === "Failed") && (
                                            <Tooltip
                                                isVisible={showTooltip === item.railBookingID}   // track per item tooltip
                                                content={
                                                    <View>
                                                        <Text className="text-white">
                                                            {item?.baseError || item?.Error || "Click to Check Status"}
                                                        </Text>
                                                    </View>
                                                }
                                                placement="top"
                                                onClose={() => setShowTooltip("")}
                                            >
                                                {loadingstatus?.loadingStatus &&
                                                    loadingstatus?.railBookingId === item?.railBookingID ? (
                                                    // Spinner
                                                    <ActivityIndicator size="small" color="#FFD700" /> // gold color
                                                ) : (
                                                    // Icon with press
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setShowTooltip(item.railBookingID); // Show tooltip
                                                            HandleCheckStatus(item.railBookingID); // API call
                                                        }}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name="information-outline"
                                                            size={22}
                                                            color="#FFD700" // text-warning
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                            </Tooltip>
                                        )}


                                    </View>

                                    <Text className={`w-32 text-center text-xs ml-8 font-mono ${item.booking_Status === 'Booked'
                                        ? 'text-success'
                                        : item.booking_Status === 'Cancelled'
                                            ? 'text-warning'
                                            : item.booking_Status === 'Pending'
                                                ? 'text-info'
                                                : item.booking_Status ===
                                                    'Partially Cancelled'
                                                    ? 'text-warning'
                                                    : 'text-danger'
                                        }`}> {item.RBresponse ? item.booking_Status : ''}
                                    </Text>

                                    <Text className="text-blue-400 w-32 text-center text-xs font-mono">{item?.RBTktres?.pnrNumber || "-"}</Text>
                                    <Text className="text-gray-300 w-32 text-xs text-center px-2 font-mono">{item.RBresponse?.avlDayList?.[0]?.availablityDate ? DateTime.fromFormat(item.RBresponse.avlDayList[0].availablityDate, "d-M-yyyy").toFormat("dd LLL yyyy") : "-"}</Text>
                                    <Text className="text-gray-300 w-28 text-center text-xs font-mono">{item.RBresponse?.trainNo || "-"}</Text>
                                    <Text className="text-gray-300 w-28 text-xs text-center font-mono">{item.RBresponse?.from || "-"}</Text>
                                    <Text className="text-gray-300 w-28 text-xs text-center font-mono">{item?.RBrequest?.boardingStation || "-"}</Text>
                                    <Text className="text-gray-300 w-28 text-xs text-center font-mono">{item.RBresponse?.to || "-"}</Text>
                                    <Text className="text-gray-300 w-20 text-center text-xs font-mono">{item.RBresponse?.enqClass || "-"}</Text>
                                    <Text className="text-gray-300 w-20 text-center text-xs font-mono">{item.RBresponse?.quota || "-"}</Text>
                                    <Text className="text-gray-300 w-36 text-xs text-center truncate font-mono">{item.RBrequest?.passengerList?.length ? `${item.RBrequest.passengerList[0].passengerName}*${item.RBrequest.passengerList.length}` : "No Passengers"}</Text>
                                    <Text className="text-gray-300 w-24 text-center text-xs font-mono">{item?.RBrequest?.reservationMode === "B2B_WEB_OTP" ? "OTP" : "DSC"}</Text>
                                    <Text className="text-green-500 w-28 text-center text-xs font-mono">₹ {formatNumberToSouthAsian(item?.RBresponse?.totalCollectibleAmount || 0)}</Text>
                                    <Text className="text-green-500 w-28 text-center text-xs font-mono">₹ {formatNumberToSouthAsian(item?.commercials?.TravelAgentFee || 0)}</Text>
                                    <Text className="text-green-500 w-28 text-center text-xs font-mono">₹ {formatNumberToSouthAsian(item?.commercials?.pgCharge || 0)}</Text>

                                    <View className="w-16 items-center">
                                        <Checkbox
                                            value={selectedBookings.includes(item.railBookingID)}
                                            onValueChange={() => toggleSelect(item.railBookingID)}
                                        />
                                    </View>

                                    <Text className="text-green-500 w-32 text-center text-xs font-mono ">
                                        ₹ {formatNumberToSouthAsian(Number(item?.RBresponse?.totalCollectibleAmount) + Number(item?.commercials?.TravelAgentFee) + Number(item?.commercials?.pgCharge))}
                                    </Text>

                                    {/* ------- ROLE SPECIFIC ------- */}
                                    {(user?.role === "admin" || user?.role === "partner") && (
                                        <Text className="text-gray-300 w-32 text-center text-xs font-mono">{item?.contactdetails?.wsUserLogin || "-"}</Text>
                                    )}

                                    {user?.role === "admin" && (
                                        <>
                                            <Text className="text-gray-300 w-32 text-xs font-mono">{item?.refID || "-"}</Text>
                                            <Text className="text-gray-300 w-32 text-xs font-mono">{item?.RBTktres?.reservationId || "-"}</Text>
                                            <Text className="text-gray-300 w-40 text-xs font-mono">{item?.clientTransactionId || "-"}</Text>
                                        </>
                                    )}
                                </View>
                            ))
                        )}
                    </ScrollView>


                </View>
            </ScrollView>
            {/* LOAD MORE */}
            <View className="items-center py-3">
                {isLoading ? <ActivityIndicator size="small" color="#22c55e" /> : (
                    <TouchableOpacity onPress={handleLoadMore} className="bg-blue-600 py-2 px-3 rounded-lg">
                        <Text className="text-white text-sm">Load More</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View className="w-full p-2">

                {/* ---------- LIMIT DROPDOWN + PAGINATION (SAME COMPONENT) ---------- */}
                <View className="flex flex-col lg:flex-row items-center gap-2 w-full">

                    {/* LIMIT DROPDOWN */}
                    <View className="w-32 border text-gray-800 border-gray-600 rounded-md bg-gray-800">
                        <Picker
                            selectedValue={limit}
                            onValueChange={(value: number) => {
                                setLimit(value);
                                handleChange(1); // Reset to page 1 on limit change
                            }}
                            style={{ color: "black" }}
                        >
                            {[10, 20, 50, 100, 200, 300, 500].map((n) => (
                                <Picker.Item key={n} label={`${n}`} value={n} />
                            ))}
                        </Picker>
                    </View>

                    {/* PAGINATION BUTTONS */}
                    <PaginationComponent
                        pageCount={pageCount}
                        page={page}
                        onPageChange={handleChange}
                    />
                </View>

            </View>

            <StyledModal
                isOpen={requisitionModal}
                onClose={() => setRequisitionModal(false)}
                onConfirm={HandelSummaryPage}
                title="Train Booking Summary"
                showConfirmButton={false} // enable if needed
            >
                <RequisitionModal
                    railbookingid={railBookingId}
                    key={railBookingId}
                    getRailBookingIDStatusError={requisitionModalRailBookingIdStatusError}
                />
            </StyledModal>


            <CustomModal
                isOpen={model}
                onClose={() => setModel(false)}
                onConfirm={HandelSummaryPage}
                title="Do You Want to See Ticket Summary?"
                showConfirmButton={false}
                showCancelButton={false}
                centered={true}   // optional
                size={380}        // optional
            >
                {/* CONTENT */}
                <View className="flex-row justify-between w-full p-2 bg-gray-900 rounded-lg">

                    {/* ❌ Web Button → ✔ RN Button */}
                    <TouchableOpacity
                        onPress={() => setModel(false)}
                        className="border border-red-500 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-red-500 font-semibold">Close</Text>
                    </TouchableOpacity>

                    {/* Confirm + Print */}
                    <View className="flex-row gap-2">
                        {/* Confirm */}
                        <TouchableOpacity
                            onPress={() => {
                                HandelSummaryPage();
                                router.push("/rail/transactionsummary" as any);
                            }}
                            className="bg-blue-600 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-semibold">Confirm</Text>
                        </TouchableOpacity>

                        {/* Print Button */}
                        <TouchableOpacity
                            onPress={handlePrintTicketClick}
                            className="bg-blue-600 p-2 rounded-lg"
                        >
                            <MaterialCommunityIcons name="printer" size={22} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </CustomModal>


            <CustomModal
                isOpen={newBookingModal}
                onClose={() => setNewBookingModal(false)}
                onConfirm={HandleNewBooking}
                title="Do You Want to Create New Booking using same details?"
                showConfirmButton={true}
                showCancelButton={true}
                confirmText="Confirm"
                cancelText="Close"
                confirmIcon={<MaterialCommunityIcons name="ticket-confirmation" size={20} color="white" />}
            />
        </View>
    );
}
