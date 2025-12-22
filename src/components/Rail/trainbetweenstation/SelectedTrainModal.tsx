import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootStore } from "@/src/store";
import { useNavigation } from "@react-navigation/native";
import { DateTime } from "luxon";
import { showMessage } from "@/src/utils/showMessage";

interface SelectedTrainModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function SelectedTrainModal({
    visible,
    onClose,
}: SelectedTrainModalProps) {
    const selectedTrain = useSelector(
        (state: RootStore) => state.trainSelection.selectedTrain
    );
    const navigation = useNavigation();

    // modal states
    const [showSummary, setShowSummary] = useState(false);
    const [showDateAlert, setShowDateAlert] = useState(false);
    const [showMobileModal, setShowMobileModal] = useState(false);

    // stored search data
    const [searchData, setSearchData] = useState<any>(null);

    // confirmation message
    const [confirmationText, setConfirmationText] = useState("");

    // mobile number
    const [mobile, setMobile] = useState("");

    // RESET modal internal states if parent closes modal
    useEffect(() => {
        if (!visible) {
            setShowSummary(false);
            setShowDateAlert(false);
            setShowMobileModal(false);
        }
    }, [visible]);

    // LOAD summary modal when opened
    useEffect(() => {
        if (visible && selectedTrain) {
            setShowSummary(true);
            loadSearchData();
        }
    }, [visible]);

    const loadSearchData = async () => {
        const json = await AsyncStorage.getItem("searchInitData");
        const stored = json ? JSON.parse(json) : {};
        setSearchData(stored);
        if (stored.mobileNumber) setMobile(stored.mobileNumber);
    };

    // -------------------------------
    // Extract station code (same as web)
    // -------------------------------
    const extractStationCode = (stationString: string) => {
        if (!stationString) return "";
        const parts = stationString.split(" - ");
        return parts.length === 2 ? parts[1] : stationString;
    };

    // --------------------------------------
    // Continue Button Logic (same as web)
    // --------------------------------------
    const ContinueDetailPage = async () => {
        if (!selectedTrain) return;

        // PT quota restriction
        if (selectedTrain.quota === "PT") {
            showMessage(
                'Agent are not allowed to book "Premium Tatkal" quota.'
            );
            return;
        }

        try {
            const storedString = await AsyncStorage.getItem("searchInitData");
            const stored = storedString ? JSON.parse(storedString) : {};

            const originalDate = DateTime.fromFormat(
                selectedTrain?.originalJourneyDate || "",
                "yyyyMMdd"
            );
            const selectedDate = DateTime.fromFormat(
                selectedTrain.journeyDate,
                "d-M-yyyy"
            );

            const dateDifferent =
                !originalDate.isValid ||
                !selectedDate.isValid ||
                originalDate.toISODate() !== selectedDate.toISODate();

            const stationDifferent =
                extractStationCode(stored?.fromStation) !== selectedTrain?.from ||
                extractStationCode(stored?.toStation) !== selectedTrain?.to;

            if (dateDifferent || stationDifferent) {
                let msg = "";

                if (dateDifferent) {
                    msg += `You searched trains for ${originalDate.toFormat(
                        "dd LLL yyyy"
                    )}, but booking for ${selectedDate.toFormat(
                        "dd LLL yyyy"
                    )}.`;
                }

                if (stationDifferent) {
                    if (msg) msg += "\n\n";
                    msg += `You searched from ${stored?.fromStation} → ${stored?.toStation}, but booking from ${selectedTrain?.from} → ${selectedTrain?.to}.`;
                }

                setConfirmationText(msg);
                setShowSummary(false);
                setShowDateAlert(true);
                return;
            }

            proceedToBooking(stored);
        } catch (error) {
            console.log("ContinueDetailPage error:", error);
            showMessage("Something went wrong.");
        }
    };

    // -------------------------------
    // Proceed to Booking (same as web)
    // -------------------------------
    const proceedToBooking = async (storedObject: any) => {
        storedObject.SelectedTDate = selectedTrain?.journeyDate;
        storedObject.Sfrom = selectedTrain?.from;
        storedObject.STo = selectedTrain?.to;
        storedObject.JClass = selectedTrain?.enqClass;
        storedObject.JQuota = selectedTrain?.quota;
        storedObject.status = selectedTrain?.availabilityStatus;
        storedObject.trainNo = selectedTrain?.trainNo;
        storedObject.arrivalTime = selectedTrain?.routeDetails?.toarrivalTime;
        storedObject.departureTime = selectedTrain?.routeDetails?.fdepartureTime;

        await AsyncStorage.setItem("searchInitData", JSON.stringify(storedObject));

        // Validate required fields
        if (
            !storedObject.trainNo ||
            !storedObject.SelectedTDate ||
            !storedObject.Sfrom ||
            !storedObject.STo ||
            !storedObject.JClass ||
            !storedObject.JQuota
        ) {
            showMessage("Missing data for booking");
            return;
        }

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!storedObject.mobileNumber || !mobileRegex.test(storedObject.mobileNumber)) {
            setShowMobileModal(true);
            return;
        }

        navigation.navigate("bookingDetails" as never);
    };

    // --------------------------------
    // Confirm mismatch → go to booking
    // --------------------------------
    const handleConfirmation = async () => {
        const json = await AsyncStorage.getItem("searchInitData");
        const stored = json ? JSON.parse(json) : {};
        setShowDateAlert(false);
        proceedToBooking(stored);
    };

    // -------------------------------
    // Mobile confirmation
    // -------------------------------
    const mobileConfirmation = async () => {
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobile || !mobileRegex.test(mobile)) {
            showMessage("Please enter valid mobile number");
            return;
        }

        const json = await AsyncStorage.getItem("searchInitData");
        const stored = json ? JSON.parse(json) : {};
        stored.mobileNumber = mobile;

        await AsyncStorage.setItem("searchInitData", JSON.stringify(stored));

        setShowMobileModal(false);
        navigation.navigate("bookingDetails" as never);
    };

    if (!selectedTrain) return null;

    return (
        <>
            {/* -----------------------------------------------------------
               1️⃣ TRAIN SUMMARY MODAL
            ----------------------------------------------------------- */}
            {/* -----------------------------------------------------------
   1️⃣ TRAIN SUMMARY MODAL (FULL DETAILED UI)
----------------------------------------------------------- */}
            <Modal visible={showSummary} transparent animationType="slide">
                <View className="flex-1 bg-black/60">

                    {/* CLOSE ON BACKDROP */}
                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={() => {
                            setShowSummary(false);
                            onClose();
                        }}
                    />

                    {/* BOTTOM SHEET */}
                    <View
                        className="absolute bottom-0 w-full bg-[#0F172A] rounded-t-3xl p-5"
                        style={{ height: "75%" }}
                    >
                        {/* HEADER */}
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-white text-lg font-bold">Train Details</Text>

                            <TouchableOpacity
                                onPress={() => {
                                    setShowSummary(false);
                                    onClose();
                                }}
                                className="p-2"
                            >
                                <Text className="text-white text-2xl">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mt-3">

                            {/* TOP TRAIN HEADER */}
                            <View className="flex-row justify-between items-start mb-4 p-2">
                                <View>
                                    <Text className="text-white text-xl font-bold">
                                        {selectedTrain.trainNo}
                                    </Text>
                                    <Text className="text-gray-300 text-base">
                                        {selectedTrain.trainName}
                                    </Text>

                                    {/* CLASS + QUOTA */}
                                    <View className="flex-row mt-2">
                                        <View className="px-2 py-1 rounded bg-blue-700 mr-2">
                                            <Text className="text-white font-semibold text-xs">
                                                {selectedTrain.enqClass}
                                            </Text>
                                        </View>

                                        <View className="px-2 py-1 rounded bg-yellow-600">
                                            <Text className="text-white font-semibold text-xs">
                                                {selectedTrain.quota}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <Text className="text-yellow-400 text-6xl mr-3">🚆</Text>
                            </View>

                            {/* STATUS BADGE */}
                            <View className="self-start px-3 py-1 rounded-lg bg-green-700 mb-4">
                                <Text className="text-white font-semibold">
                                    {selectedTrain.availabilityStatus.replace("AVAILABLE-", "AVAILABLE - ")}
                                </Text>
                            </View>

                            {/* ROUTE CARD */}
                            <View className="p-4 rounded-xl mb-4 bg-gray-800">
                                <View className="flex-row justify-between">
                                    {/* FROM */}
                                    <View>
                                        <Text className="text-blue-400 font-bold text-lg">
                                            {selectedTrain.from}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {selectedTrain.routeDetails?.fdepartureTime}
                                        </Text>
                                    </View>

                                    {/* MIDDLE INFO */}
                                    <View className="items-center">
                                        <Text className="text-gray-400 text-xs">
                                            {selectedTrain.routeDetails?.distance} KM
                                        </Text>
                                        <Text className="text-gray-400 text-xs my-1">
                                            - {selectedTrain.routeDetails?.halt}{" "}
                                            {selectedTrain.routeDetails?.halt > 1 ? "Halts" : "Halt"} -
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {selectedTrain.routeDetails?.duration}
                                        </Text>
                                    </View>

                                    {/* TO */}
                                    <View className="items-end">
                                        <Text className="text-red-400 font-bold text-lg">
                                            {selectedTrain.to}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {selectedTrain.routeDetails?.toarrivalTime}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* DATE CARD */}
                            <View className="p-4 rounded-xl mb-4 bg-gray-800 flex flex-row justify-between">
                                <Text className="text-gray-200 text-xs">Date</Text>
                                <Text className="text-white mt-1 font-semibold">
                                    {selectedTrain.journeyDate}
                                </Text>
                            </View>

                            {/* FARE CARD */}
                            <View className="bg-gray-800 p-4 rounded-xl mb-4 flex-row justify-between">
                                <Text className="text-gray-300 text-sm">Fare</Text>
                                <Text className="text-green-400 text-xl font-bold">
                                    ₹ {selectedTrain.fare}
                                </Text>
                            </View>

                            {/* CONTINUE BUTTON */}
                            <TouchableOpacity
                                onPress={ContinueDetailPage}
                                className="bg-green-600 p-4 rounded-xl mt-2"
                            >
                                <Text className="text-white text-center text-lg font-bold">
                                    Continue →
                                </Text>
                            </TouchableOpacity>

                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>


            {/* -----------------------------------------------------------
               2️⃣ DATE / STATION MISMATCH CONFIRMATION MODAL
            ----------------------------------------------------------- */}
            <Modal visible={showDateAlert} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <View className="bg-[#0F172A] p-6 rounded-xl w-full">

                        <Text className="text-yellow-400 text-2xl text-center">⚠️</Text>

                        <Text className="text-yellow-400 text-xl text-center font-bold mt-3">
                            Confirmation
                        </Text>

                        <Text className="text-gray-300 text-center mt-4 whitespace-pre-line">
                            {confirmationText}
                        </Text>

                        <View className="flex-row justify-center gap-4 mt-6">

                            <TouchableOpacity
                                onPress={() => {
                                    setShowDateAlert(false);
                                    onClose();
                                }}
                                className="bg-gray-700 px-5 py-2 rounded-lg"
                            >
                                <Text className="text-white">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirmation}
                                className="bg-blue-600 px-5 py-2 rounded-lg"
                            >
                                <Text className="text-white">Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* -----------------------------------------------------------
               3️⃣ MOBILE NUMBER MODAL
            ----------------------------------------------------------- */}
            <Modal visible={showMobileModal} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-6">
                    <View className="bg-[#0F172A] p-6 rounded-xl w-full">

                        <Text className="text-white text-xl text-center font-bold">
                            Enter Mobile Number
                        </Text>

                        <TextInput
                            value={mobile}
                            onChangeText={setMobile}
                            keyboardType="number-pad"
                            maxLength={10}
                            placeholder="Enter Mobile Number"
                            placeholderTextColor="#666"
                            className="bg-gray-800 p-3 text-white rounded-xl text-center mt-6"
                        />

                        <TouchableOpacity
                            onPress={mobileConfirmation}
                            className="bg-blue-600 p-4 rounded-xl mt-6"
                        >
                            <Text className="text-center text-white font-bold">
                                Submit
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setShowMobileModal(false);
                                onClose();
                            }}
                            className="mt-3"
                        >
                            <Text className="text-center text-gray-400">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}
