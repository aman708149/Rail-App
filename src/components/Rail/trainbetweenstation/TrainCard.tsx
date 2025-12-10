import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme, LayoutAnimation, Platform, UIManager, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";

import { TrainType } from "./trainTypes";

import { useDispatch, useSelector } from "react-redux";
import { FetchHaltsDetails } from "@/src/function/HaltsByTrainNumber";
import { Quota } from "@/src/constants/QuotaConstants";
import { setArrivalCode, setDepartureCode } from "@/src/store/rail/train-route/trainRouteSlices";
import { setTrainRoute } from "@/src/store/rail/trainRoute";
import { RootStore } from "@/src/store";
import TrainRouteModal from "../trainavailability/TrainRouteModal";
import { getTrainTypeText } from "./TrainType";
import ClassesBottomSheet from "./ClassesBottomSheet";
import BottomSheetModal from "./ClassesBottomSheet";
import ClassesCard from "./ClassesCard";

if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function TrainCard({
    train,
    journeyDate,
    index,
}: {
    train: TrainType;
    journeyDate: string | null;
    index: number;
}) {
    const isDark = useColorScheme() === "dark";
    const dispatch = useDispatch();

    // ---------------------- REQUIRED STATES (KEEP ALL) ----------------------
    const [routeDetails, setRouteDetails] = useState({
        ArrivalDate: "",
        distance: "",
        duration: "",
        fdepartureTime: "",
        fstationName: "",
        halt: 0,
        runningFri: "",
        runningMon: "",
        runningSat: "",
        runningSun: "",
        runningThu: "",
        runningTue: "",
        runningWed: "",
        toarrivalTime: "",
        tostationName: "",
    });

    const [showRouteModal, setShowRouteModal] = useState(false);


    const [showClasses, setShowClasses] = useState(false);

    const { quotaList } = useSelector((state: RootStore) => state.trainBetweenStation);
    const quotasToRender = ["GN", "TQ", "LD", "SS", "PT"] as Array<keyof typeof Quota>;

    const [tempJourneyDate, setTempJourneyDate] = useState<string | null>(journeyDate);
    const [originalJourneyDate, setOriginalJourneyDate] = useState<string | null>(journeyDate);
    const [originalDayCount, setOriginalDayCount] = useState<number>(0);
    const [showDateChangeModal, setShowDateChangeModal] = useState(false);
    const [selectedFromStation, setSelectedFromStation] = useState(train?.fromStnCode);
    const [fromModalOpen, setFromModalOpen] = useState(false);
    const [toModalOpen, setToModalOpen] = useState(false);
    const [selectedToStation, setSelectedToStation] = useState(train?.toStnCode);

    const [displayDeparture, setDisplayDeparture] = useState(train?.departureTime);
    const [displayArrival, setDisplayArrival] = useState(train?.arrivalTime);
    const [displayDistance, setDisplayDistance] = useState(train?.distance);
    const [displayDuration, setDisplayDuration] = useState(train?.duration);
    const [haltsCount, setHaltsCount] = useState(0);
    const [prevFromStation, setPrevFromStation] = useState(train?.fromStnCode);
    const [showClassesModal, setShowClassesModal] = useState(false);



    // ---------------------- DAY-COUNT DATE ADJUST ----------------------
    useEffect(() => {
        if (journeyDate) {
            setOriginalJourneyDate(journeyDate);
            setTempJourneyDate(journeyDate);

            const originalFrom = train.trainRoute?.stationList?.find(
                (s) => s.stationCode === train.initialFromStnCode
            );
            setOriginalDayCount(originalFrom?.dayCount || 0);
        }
    }, [journeyDate]);

    useEffect(() => {
        if (originalJourneyDate && tempJourneyDate && originalJourneyDate !== tempJourneyDate) {
            setShowDateChangeModal(true);
        }
    }, [tempJourneyDate]);

    const parseDate = (d: string) => DateTime.fromFormat(d, "yyyyMMdd");
    const formatDate = (d: DateTime) => d.toFormat("yyyyMMdd");

    const handleFromStationChange = (newFromCode: string) => {
        const st = train.trainRoute?.stationList?.find((s) => s.stationCode === newFromCode);
        if (!originalJourneyDate || !st) return;

        const diff = (st.dayCount || 0) - originalDayCount;

        const newDate = parseDate(originalJourneyDate).plus({ days: diff });
        setTempJourneyDate(formatDate(newDate));
    };

    // ---------------------- FETCH HALTS ----------------------
    const GetTrainHalts = async () => {
        if (journeyDate) {
            const details = await FetchHaltsDetails(train, journeyDate, train.initialFromStnCode);
            if (details) setRouteDetails(details);
        }
    };

    useEffect(() => {
        GetTrainHalts();
    }, [train.fromStnCode, train.toStnCode]);

    const HandleRouteCheck = (from: string, to: string, route: any) => {
        dispatch(setTrainRoute(route));
        dispatch(setDepartureCode(from));
        dispatch(setArrivalCode(to));
    };

    const runningDays = [
        train.runningMon,
        train.runningTue,
        train.runningWed,
        train.runningThu,
        train.runningFri,
        train.runningSat,
        train.runningSun,
    ];

    const [dynamicRunningDays, setDynamicRunningDays] = useState(runningDays);


    const col = isDark ? "#111827" : "#F1F5F9";

    const getStationDetails = (code: string) => {
        return train.trainRoute?.stationList?.find(st => st.stationCode === code);
    };

    const calculateHaltsBetween = (list: any[], from: string, to: string) => {
        const s = list.findIndex(st => st.stationCode === from);
        const e = list.findIndex(st => st.stationCode === to);
        if (s === -1 || e === -1 || e <= s) return 0;
        return e - s - 1;
    };

    const calculateDistanceAndDuration = (list: any[], from: string, to: string) => {
        const s = list.findIndex(st => st.stationCode === from);
        const e = list.findIndex(st => st.stationCode === to);

        if (s === -1 || e === -1 || e <= s) {
            return { distance: "0", duration: "0h:0m" };
        }

        const start = list[s];
        const end = list[e];

        const totalDistance = end.distance - start.distance;

        const toMinutes = (t: string) => {
            if (!t || t === "--") return 0;
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };

        const startMin = toMinutes(start.departureTime) + start.dayCount * 1440;
        const endMin = toMinutes(end.arrivalTime) + end.dayCount * 1440;

        const diff = endMin - startMin;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;

        return {
            distance: totalDistance.toString(),
            duration: `${hours}h:${mins}m`
        };
    };

    const shiftRunningDays = (prev: string, curr: string) => {
        const list = train.trainRoute?.stationList || [];

        const oldIndex = list.findIndex(st => st.stationCode === prev);
        const newIndex = list.findIndex(st => st.stationCode === curr);

        if (oldIndex === -1 || newIndex === -1) return runningDays;

        const dayShift = list[newIndex].dayCount - list[oldIndex].dayCount;

        if (dayShift === 0) return runningDays;

        const rotated = [...runningDays];

        for (let i = 0; i < Math.abs(dayShift); i++) {
            if (dayShift > 0) rotated.push(rotated.shift()!);
            else rotated.unshift(rotated.pop()!);
        }

        return rotated;
    };

    const handleFromStationSelect = (code: string) => {
        const st = getStationDetails(code);
        if (!st) return;

        setPrevFromStation(selectedFromStation);
        setSelectedFromStation(code);
        setFromModalOpen(false);

        // Update running days
        setDynamicRunningDays(shiftRunningDays(prevFromStation, code));

        // Update halts
        setHaltsCount(calculateHaltsBetween(train.trainRoute.stationList, code, selectedToStation));

        // Update departure time
        setDisplayDeparture(st.departureTime);

        // Update distance & duration
        const { distance, duration } = calculateDistanceAndDuration(
            train.trainRoute.stationList,
            code,
            selectedToStation
        );

        setDisplayDistance(distance);
        setDisplayDuration(duration);
    };


    const handleToStationSelect = (code: string) => {
        const st = getStationDetails(code);
        if (!st) return;

        setSelectedToStation(code);
        setToModalOpen(false);

        // Update arrival time
        setDisplayArrival(st.arrivalTime);

        // Update halts
        setHaltsCount(calculateHaltsBetween(train.trainRoute.stationList, selectedFromStation, code));

        // Update distance & duration
        const { distance, duration } = calculateDistanceAndDuration(
            train.trainRoute.stationList,
            selectedFromStation,
            code
        );

        setDisplayDistance(distance);
        setDisplayDuration(duration);
    };

    useEffect(() => {
        if (selectedFromStation && selectedToStation) {
            setHaltsCount(
                calculateHaltsBetween(train.trainRoute.stationList, selectedFromStation, selectedToStation)
            );
        }
    }, [selectedFromStation, selectedToStation]);



    // ---------------------- MAIN UI ----------------------
    return (
        <View
            className={`w-full rounded-lg p-3 mt-2`}
            style={{
                backgroundColor: isDark ? "#0F172A" : "#fff",
                borderWidth: 1,
                borderColor: isDark ? "#1E293B" : "#CBD5E1",
            }}
        >
            {/* TOP SECTION */}
            <View className="flex-row justify-between items-center">
                {/* LEFT BLOCK */}
                <View className="flex-col items-start">
                    {/* TRAIN NUMBER TAG */}
                    <View className="px-3 py-1 rounded-md" style={{ backgroundColor: "#dc2626" }}>
                        <Text className="text-white font-semibold">{train?.trainNumber}</Text>
                    </View>

                    {/* RUNNING DAYS */}
                    <View className="flex-row mt-2">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
                            const isRunning = dynamicRunningDays?.[i] === "Y";
                            return (
                                <Text
                                    key={i}
                                    className={`mr-1 font-bold ${isRunning ? "text-success" : "text-danger"}`}
                                >
                                    {d}
                                </Text>
                            );
                        })}
                    </View>


                    {/* FROM STATION */}
                    <TouchableOpacity onPress={() => setFromModalOpen(true)}>
                        <Text className="text-blue-400 font-bold text-sm">
                            {selectedFromStation}
                        </Text>
                    </TouchableOpacity>

                    <Ionicons name="arrow-forward" size={16} color="#9CA3AF" className="my-1" />

                    {/* TO STATION */}
                    <TouchableOpacity onPress={() => setToModalOpen(true)}>
                        <Text className="text-red-400 font-bold text-sm">
                            {selectedToStation}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* MIDDLE BLOCK */}
                <View className="flex-col items-center">
                    {/* <Text className="text-white font-bold text-lg">{train.trainName}</Text> */}

                    <TouchableOpacity onPress={() => setShowRouteModal(true)}>
                        <Text className="text-white font-semibold text-right text-xs uppercase">
                            {train?.trainName}
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-gray-300 font-semibold mt-1">
                        {getTrainTypeText(train?.trainType[0])}
                    </Text>

                    <Text className="text-yellow-400 font-medium mt-2">
                        {displayDeparture} → {displayArrival}
                    </Text>

                    <Text className="text-gray-400 mt-1"> - {haltsCount} Halts -</Text>

                    <Text className="text-gray-300 mt-1">
                        {displayDistance} KM • {displayDuration}
                    </Text>
                </View>

                {/* RIGHT BLOCK */}
                <TouchableOpacity
                    onPress={() => setShowClassesModal(true)}
                    className="p-2 rounded-full"
                    style={{ backgroundColor: "#1D4ED8" }}
                >
                    <Ionicons name="chevron-up" size={20} color="white" />
                </TouchableOpacity>

            </View>

            {/* COLLAPSIBLE CLASSES AREA */}
            {/* {showClasses && (
                <View className="mt-3 p-3 rounded-lg" style={{ backgroundColor: col }}>
                    <Text className="text-gray-300 mb-2">Classes will render here...</Text>

                     TODO: Render your ClassesCard exactly like Next.js 
                    train.avlClasses.map(... => <ClassesCard /> 
                </View>
            )} */}

            {/* <ClassesBottomSheet
                visible={showClassesModal}
                onClose={() => setShowClassesModal(false)}
                train={train}
                quotaList={quotaList}
                availabilityData={train.availability}
            /> */}

            <BottomSheetModal visible={showClassesModal} onClose={() => setShowClassesModal(false)}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {train.avlClasses.map((enqClass: string, index: number) => {
                        const classAvailability = train.availability.filter(
                            (item) => item.enqClass === enqClass
                        );

                        return (
                            <ClassesCard
                                key={`class-${train.trainNumber}-${enqClass}-${index}`}
                                enqClass={enqClass}
                                trainNumber={train.trainNumber}
                                initialFromStnCode={train.initialFromStnCode}
                                initialToStnCode={train.initialToStnCode}
                                journeyDate={tempJourneyDate ?? ""}
                                fromStnCode={selectedFromStation}
                                toStnCode={selectedToStation}
                                routeDetails={routeDetails}
                                runningDays={[
                                    train.runningMon,
                                    train.runningTue,
                                    train.runningWed,
                                    train.runningThu,
                                    train.runningFri,
                                    train.runningSat,
                                    train.runningSun,
                                ]}
                                availability={classAvailability}
                            />
                        );
                    })}
                </ScrollView>
            </BottomSheetModal>


            {showRouteModal && train?.trainRoute?.stationList && (
                <TrainRouteModal
                    trainName={train?.trainName}
                    trainNumber={train?.trainNumber}
                    arrivalCode={selectedFromStation}
                    departureCode={selectedToStation}
                    stationList={train?.trainRoute?.stationList}
                    onClose={() => setShowRouteModal(false)}
                />
            )}


            {/* FROM STATION MODAL */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={fromModalOpen}
                onRequestClose={() => setFromModalOpen(false)}
            >
                <View className="flex-1 bg-[#0F172A] p-4">

                    {/* HEADER → KEEP THIS SAME */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-lg font-bold">Select Boarding Station</Text>
                        <TouchableOpacity onPress={() => setFromModalOpen(false)}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* LIST */}
                    <ScrollView>
                        {train.trainRoute?.stationList
                            .filter(st => {
                                const toIndex = train?.trainRoute?.stationList.findIndex(s => s.stationCode === train?.toStnCode);
                                return train.trainRoute?.stationList?.indexOf(st) < toIndex;
                            })
                            .map((station, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="p-4 border-b border-gray-700 active:bg-slate-800"
                                    onPress={() => handleFromStationSelect(station.stationCode)}  // 🟢 FIXED
                                >
                                    <Text className="text-gray-200 text-base">
                                        {station.stationCode} - {station.stationName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>

                </View>
            </Modal>


            {/* TO STATION MODAL */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={toModalOpen}
                onRequestClose={() => setToModalOpen(false)}
            >
                <View className="flex-1 bg-[#0F172A] p-4">

                    {/* HEADER → KEEP THIS SAME */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-lg font-bold">Select Destination</Text>
                        <TouchableOpacity onPress={() => setToModalOpen(false)}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* LIST */}
                    <ScrollView>
                        {train.trainRoute?.stationList
                            .filter((station, index) => {
                                const fromIndex = train.trainRoute?.stationList?.findIndex(
                                    s => s.stationCode === selectedFromStation
                                );
                                return index > fromIndex;
                            })
                            .map((station, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="p-4 border-b border-gray-700 active:bg-slate-800"
                                    onPress={() => handleToStationSelect(station.stationCode)}  // 🟢 FIXED
                                >
                                    <Text className="text-gray-200 text-base">
                                        {station.stationCode} - {station.stationName}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                    </ScrollView>

                </View>
            </Modal>
        </View>
    );
}
