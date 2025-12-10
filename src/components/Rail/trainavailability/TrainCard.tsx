import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import "global.css"
import { formatDateType, formatDateWithDayandmonth } from "@/src/utils/DateFormate/Dateformate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { TrainRoute } from "@/src/types/train";
import { showMessage } from "@/src/utils/showMessage";
import TrainRouteModal from "./TrainRouteModal";
import { formatDateIRCTCtoAPI } from "./irctcformateDate";
import CustomModal from "../../Modal/CustomModal";
import { timedifferenceInHHMM } from "@/src/Date/timedifferenceInHHMM";


type Station = {
    _id: string;
    stationCode: string;
    stationName: string;
    arrivalTime: string;
    departureTime: string;
    routeNumber: string;
    haltTime: string;
    distance: number;
    dayCount: number;
    stnSerialNumber: string;
    boardingDisabled: string;
    previousDistance: number;
    previousDuration: string;
};


interface TrainCardProps {
    trainRoute?: TrainRoute | null;
    trainNumber: string;
    trainName: string;
    fromStnCode: string;
    toStnCode: string;
    distance: string;
    duration: string;
    departureTime: string;
    arrivalTime: string;
    runningDays: any;
    avlClasses: string[];
    quotaList: string[];

    availability: any;
    avlLoader: boolean;
    GetTrainAvailablity: Function;
    journeyDate: string;
    trainIndex: number;
    availabilityDateWise: any;
    fares: Record<string, any>;
    headerShowfare: any;
    singleMode: boolean;
    timestamp: any;
}

export const TrainCard: React.FC<TrainCardProps> = ({
    trainNumber,
    trainName,
    fromStnCode,
    toStnCode,
    distance,
    duration,
    departureTime,
    arrivalTime,
    runningDays,
    avlClasses,
    quotaList,
    availability,
    avlLoader,
    GetTrainAvailablity,
    journeyDate,
    trainIndex,
    availabilityDateWise,
    fares,
    headerShowfare,
    trainRoute,
    singleMode,
    timestamp
}) => {
    // CLASS SELECTED
    const [selectedClass, setSelectedClass] = useState<string | undefined>();
    const [selectedClassIndex, setSelectedClassIndex] = useState<number | null>(null);
    const [dateAlertModal, setDateAlertModal] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDayData, setSelectedDayData] = useState<any>(null);

    const [mobileModal, setMobileModal] = useState(false);
    const [tempMobile, setTempMobile] = useState("");
    // MULTI EXPAND QUOTAS
    const [openQuotas, setOpenQuotas] = useState<string[]>([]);
    const [showRouteModal, setShowRouteModal] = useState(false);

    // Editable From Station
    const [editFrom, setEditFrom] = useState(false);
    const [selectedFromStation, setSelectedFromStation] = useState(fromStnCode);
    const [fromModalOpen, setFromModalOpen] = useState(false);
    const [toModalOpen, setToModalOpen] = useState(false);
    const [selectedToStation, setSelectedToStation] = useState(toStnCode);

    // Dynamic values
    const [displayDeparture, setDisplayDeparture] = useState(departureTime);
    const [displayArrival, setDisplayArrival] = useState(arrivalTime);
    const [displayDistance, setDisplayDistance] = useState(distance);
    const [displayDuration, setDisplayDuration] = useState(duration);
    // ADD THIS STATE (instead of directly using runningDays)
    const [dynamicRunningDays, setDynamicRunningDays] = useState(runningDays);
    const [prevFromStation, setPrevFromStation] = useState(fromStnCode);

    // 🔥 ACTIVE CLASS SELECTION (used for datewise highlight)
    const [activeClasses, setActiveClasses] = useState<
        { trainIndex: number; classIndex: number }[]
    >([]);

    // 🔥 ACTIVE QUOTAS (used for datewise highlight)
    const [activeQuotas, setActiveQuotas] = useState<
        { trainIndex: number; classIndex: number; quota: string }[]
    >([]);




    const getStationDetails = (code: string) => {
        return stationList.find(st => st.stationCode === code);
    };

    // Halts State

    // Toggle CLASS
    const toggleClass = (cls: string) => {
        const index = avlClasses.indexOf(cls);
        setSelectedClass((prev) => (prev === cls ? undefined : cls));
        setSelectedClassIndex(index);
        setOpenQuotas([]); // Clear open quotas when changing class
    };
    const getStatusColor = (status: string) => {
        if (status.includes("AVAILABLE")) return "text-green-400 border-green-500";
        if (status.includes("RAC")) return "text-yellow-400 border-yellow-500";
        return "text-red-400 border-red-500"; // WL / GNWL
    };


    const dayKeys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const getPreviousDates = (startDate: any, daysOfWeek: any) => {
        let dates = [];
        let SearchDate = new Date(startDate);
        let currentDate = new Date();

        // Set the current date to the start of the day for comparison
        currentDate.setHours(0, 0, 0, 0);

        // Move to the previous day initially
        SearchDate.setDate(SearchDate.getDate() - 1);

        let maxAttempts = 100; // Maximum number of attempts to prevent infinite loop

        while (dates.length < 6 && maxAttempts > 0) {
            const dayOfWeek = SearchDate.getDay();

            // Check if the current day is one of the user-specified days and it's not less than the current date
            if (daysOfWeek.includes(dayOfWeek) && SearchDate >= currentDate) {
                dates.unshift(SearchDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD and add to start of the array
            }

            // Move to the previous day
            SearchDate.setDate(SearchDate.getDate() - 1);
            maxAttempts--; // Decrement the attempt counter
        }
        return dates;
    };

    const getNextsixDates = (startDate: string, daysOfWeek: any) => {
        let dates = [];
        let SearchDate = new Date(startDate);

        // Move to the next day from the start date
        SearchDate.setDate(SearchDate.getDate() + 1);

        while (dates.length < 6) {
            const dayOfWeek = SearchDate.getDay();

            // Check if the current day is one of the user-specified days
            if (daysOfWeek.includes(dayOfWeek)) {
                dates.push(SearchDate.toISOString().split('T')[0]); // Format date as YYYY-MM-DD
            }
            // Move to the next day
            SearchDate.setDate(SearchDate.getDate() + 1);
        }
        return dates;
    };

    function getRunningDay(Days: any, startDate: string, arrow: string) {
        const runningDays = [];
        if (Days[6] === 'Y') runningDays.push(0); // Sunday
        if (Days[0] === 'Y') runningDays.push(1); // Monday
        if (Days[1] === 'Y') runningDays.push(2); // Tuesday
        if (Days[2] === 'Y') runningDays.push(3); // Wednesday
        if (Days[3] === 'Y') runningDays.push(4); // Thursday
        if (Days[4] === 'Y') runningDays.push(5); // Friday
        if (Days[5] === 'Y') runningDays.push(6); // Saturday

        if (arrow == 'next') {
            const runningDates = getNextsixDates(startDate, runningDays);
            return runningDates;
        }
        if (arrow == 'previous') {
            const runningDates = getPreviousDates(startDate, runningDays);
            return runningDates;
        }
    }

    const previousAvailability = async (
        runningDays: any,
        startDate: string,
        trainNumber: string,
        quota: string,
        avlClass: string,
        classIndex: number,
        trainIndex: number,
        fromStation: string,
        toStation: string
    ) => {
        try {
            const startdate = formatDateIRCTCtoAPI(startDate);
            const runningDate = await getRunningDay(
                runningDays,
                startdate,
                'previous'
            );

            if (runningDate && runningDate.length > 0) {
                debouncedGetAvailability(
                    trainNumber,
                    runningDate[0],
                    fromStation,
                    toStation,
                    avlClass,
                    quota,
                    'N',
                    'cache',
                    6,
                    runningDays,
                    trainIndex,
                    classIndex
                );
            } else {
                showMessage('No Previous Dates Available');
            }
        } catch (error) {
            console.error('Error in previousAvailability:', error);
            showMessage('Error fetching previous availability');
        }
    };

    const NextAvailability = async (
        runningDays: any,
        endDate: string,
        trainNumber: string,
        quota: string,
        avlClass: string,
        classIndex: number,
        trainIndex: number,
        from: string,
        to: string
    ) => {
        try {
            const enddate = formatDateIRCTCtoAPI(endDate);
            const runningDate = await getRunningDay(runningDays, enddate, 'next');
            if (runningDate && runningDate.length > 0) {
                debouncedGetAvailability(
                    trainNumber,
                    enddate,
                    from,
                    to,
                    avlClass,
                    quota,
                    'N',
                    'cache',
                    6,
                    runningDays,
                    trainIndex,
                    classIndex
                );
            } else {
                showMessage('No Next Dates Available');
            }
        } catch (error) {
            console.error('Error in previousAvailability:', error);
            showMessage('Error fetching previous availability');
        }
    };


    const checkMobileAndProceed = async () => {
        try {
            const storedString = await AsyncStorage.getItem("searchInitData");
            const storedObj = storedString ? JSON.parse(storedString) : {};

            if (storedObj.mobileNumber && /^[6-9]\d{9}$/.test(storedObj.mobileNumber)) {
                // mobile already saved → go ahead
                router.push("/rail/bookingDetails" as any);
                return;
            }

            // otherwise ask user for mobile number
            setMobileModal(true);
        } catch (e) {
            console.log("AsyncStorage error:", e);
        }
    };


    const mobileConfirm = async () => {
        const storedString = await AsyncStorage.getItem("searchInitDataAll");
        const storedObj = storedString ? JSON.parse(storedString) : {};

        storedObj.mobileNumber = tempMobile;

        await AsyncStorage.setItem("searchInitDataAll", JSON.stringify(storedObj));

        router.push("/rail/bookingDetails");
    };

    // console.log("availability data is ", availability);

    const handleDateConfirm = () => {
        setDateAlertModal(false);   // close date alert modal
        checkMobileAndProceed();    // open mobile modal or continue
    };

    const saveSearchInitData = async (day: any, quota: string) => {
        try {
            const obj = {
                from: selectedFromStation,
                to: selectedToStation,
                enqClass: selectedClass,
                quota: quota,
                trainNo: trainNumber,
                date: day.availablityDate,
                arrivalTime: displayArrival,
                departureTime: displayDeparture,
            };

            await AsyncStorage.setItem("searchInitDataAll", JSON.stringify(obj));

        } catch (e) {
            console.log("storage error:", e);
        }
    };

    const formatDuration = (duration: any) => {
        if (!duration) return "";
        const [h, m] = duration.split(":");
        return `${h}h:${m}m`;
    };

    const calculateHaltsBetween = (
        stationList: any[],
        fromStnCode: string,
        toStnCode: string
    ) => {
        // Find matching index of starting station
        const startIndex = stationList.findIndex(
            st => st.stationCode === fromStnCode
        );

        // Find matching index of ending station
        const endIndex = stationList.findIndex(
            st => st.stationCode === toStnCode
        );

        // If not found OR invalid range → return 0
        if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return 0;

        // Stations between them = halts ~ NOT including start & end
        return endIndex - startIndex - 1;
    };

    // Inside component
    const stationList = trainRoute?.stationList || [];
    const halts = calculateHaltsBetween(stationList, fromStnCode, toStnCode);

    const [haltsCount, setHaltsCount] = useState(halts);

    const handleStationSelect = (stationCode: string) => {
        setSelectedFromStation(stationCode);
        setFromModalOpen(false);

        const newHalts = calculateHaltsBetween(stationList, stationCode, toStnCode);
        setHaltsCount(newHalts);

        // Call API if needed:
        // GetTrainAvailablity(...)
    };

    // Get Total Distance & Duration between FROM & TO
    const calculateDistanceAndDuration = (
        stationList: Station[],
        fromCode: string,
        toCode: string
    ) => {
        const startIndex = stationList.findIndex(st => st.stationCode === fromCode);
        const endIndex = stationList.findIndex(st => st.stationCode === toCode);

        if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
            return { totalDistance: 0, totalDuration: "00h:00m" };
        }

        const start = stationList[startIndex];
        const end = stationList[endIndex];

        // 🟢 DISTANCE
        const totalDistance = end.distance - start.distance;

        // 🟢 TIME FUNCTION
        const toMinutes = (t: string) => {
            if (t === "--") return 0;
            const [h, m] = t.split(":").map(Number);
            return h * 60 + m;
        };

        // 🟢 FIX: ADD DAY COUNT DIFFERENCE
        const startMinutes = toMinutes(start.departureTime) + (start.dayCount * 24 * 60);
        const endMinutes = toMinutes(end.arrivalTime) + (end.dayCount * 24 * 60);

        let totalMinutes = endMinutes - startMinutes;

        if (totalMinutes <= 0) totalMinutes = 0;

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const totalDuration = `${hours}h:${minutes}m`;

        return { totalDistance, totalDuration };
    };



    useEffect(() => {
        const newHalts = calculateHaltsBetween(stationList, selectedFromStation, selectedToStation);
        setHaltsCount(newHalts);
        handleFromStationSelect;
        handleToStationSelect;
    }, [selectedFromStation, selectedToStation]);

    // useEffect(() => {
    //     GetTrainAvailablity(
    //         trainNumber,
    //         journeyDate,
    //         selectedFromStation,
    //         selectedToStation,
    //         selectedClass,
    //         openQuotas[0] || quotaList[0],
    //         "N",
    //         "cache",
    //         0,
    //         Object.values(runningDays),
    //         trainIndex,
    //         selectedClassIndex
    //     );
    // }, [selectedFromStation, selectedToStation]);

    // 🔥 LOCAL DEBOUNCE (works inside component)
    let debounceTimeout: any = null;

    const debounceCall = (fn: Function, delay = 700) => {
        return (...args: any[]) => {
            if (debounceTimeout) clearTimeout(debounceTimeout);

            debounceTimeout = setTimeout(() => {
                fn(...args);
            }, delay);
        };
    };

    const debouncedGetAvailability = debounceCall(GetTrainAvailablity, 600);



    const handleFromStationSelect = (stationCode: string) => {
        const station = getStationDetails(stationCode);
        if (!station) return;

        setPrevFromStation(selectedFromStation);  // store last selection here
        setSelectedFromStation(stationCode);
        setFromModalOpen(false);

        // UPDATE TIMES (ONLY IF ORIGINAL IS EMPTY)
        if (!station || station.departureTime === "--") {
            setDisplayDeparture(departureTime);
        }

        setDisplayDeparture(station.departureTime);
        // DISTANCE & DURATION
        // 🟢 RECALCULATE Distance + Duration
        const { totalDistance, totalDuration } =
            calculateDistanceAndDuration(stationList, stationCode, selectedToStation);

        setDisplayDistance(totalDistance.toString());
        setDisplayDuration(totalDuration);

        // UPDATE HALTS
        const newHalts = calculateHaltsBetween(stationList, stationCode, selectedToStation);
        setHaltsCount(newHalts);

        // 🔥 CALL API IF CLASS SELECTED
        if (selectedClass) {
            debouncedGetAvailability(
                trainNumber,
                journeyDate,
                selectedFromStation,
                selectedToStation,
                selectedClass,
                openQuotas[0] || quotaList[0],
                "N",
                "cache",
                0,
                Object.values(runningDays),
                trainIndex,
                selectedClassIndex
            );
        }

        
    };

    const handleToStationSelect = (stationCode: string) => {
        const station = getStationDetails(stationCode);
        if (!station) return;

        setSelectedToStation(stationCode);
        setToModalOpen(false);

        // UPDATE TIMES (ONLY IF ORIGINAL IS EMPTY)
        if (!station || station.arrivalTime === "--") {
            setDisplayArrival(arrivalTime);
        }

        // UPDATE ARRIVAL TIME
        setDisplayArrival(station.arrivalTime)

        // DISTANCE & DURATION
        const { totalDistance, totalDuration } =
            calculateDistanceAndDuration(stationList, selectedFromStation, stationCode);

        setDisplayDistance(totalDistance.toString());
        setDisplayDuration(totalDuration);

        // UPDATE HALTS
        const newHalts = calculateHaltsBetween(stationList, selectedFromStation, stationCode);
        setHaltsCount(newHalts);

        // 🔥 CALL API
        if (selectedClass) {
            debouncedGetAvailability(
                trainNumber,
                journeyDate,
                selectedFromStation,
                selectedToStation,
                selectedClass,
                openQuotas[0] || quotaList[0],
                "N",
                "cache",
                0,
                Object.values(runningDays),
                trainIndex,
                selectedClassIndex
            );
        }
    };

    useEffect(() => {
        if (selectedFromStation && selectedToStation) {
            const newHalts = calculateHaltsBetween(stationList, selectedFromStation, selectedToStation);
            setHaltsCount(newHalts);
        }
    }, [selectedFromStation, selectedToStation]);

    // Handle clicking quota
    const onQuotaClickLocal = (quota: string, quotaIndex: number) => {
        if (selectedClassIndex === null) return;

        // 1️⃣ SINGLE MODE → Only one quota allowed across all trains
        if (singleMode) {
            setOpenQuotas([quota]);   // Reset quota list
        }
        // 2️⃣ NORMAL MODE → Toggle like previous
        else {
            if (openQuotas.includes(quota)) {
                setOpenQuotas(openQuotas.filter((q) => q !== quota));  // CLOSE
                return;
            }
            setOpenQuotas([...openQuotas, quota]);  // OPEN MORE IN NORMAL MODE
        }

        // 🔄 FETCH AVAILABILITY FOR THIS QUOTA
        debouncedGetAvailability(
            trainNumber,
            journeyDate,
            selectedFromStation,
            selectedToStation,
            selectedClass,
            quota,
            "N",
            "cache",
            0,
            Object.values(runningDays),
            trainIndex,
            selectedClassIndex
        );
    };

    const updateRunningDays = (
        stationList: Station[],
        prevFromCode: string,
        newFromCode: string,
        runningDays: any
    ) => {
        const originalIndex = stationList.findIndex(st => st.stationCode === prevFromCode);
        const newIndex = stationList.findIndex(st => st.stationCode === newFromCode);

        if (originalIndex === -1 || newIndex === -1) return runningDays;

        const shift = stationList[newIndex].dayCount - stationList[originalIndex].dayCount;
        if (shift <= 0) return runningDays;

        const originalDays = dayKeys.map(d => runningDays[d]);

        // 🔁 Shift colors only (not order)
        const shifted = originalDays.map((_, i) =>
            originalDays[(i - shift + 7) % 7]
        );

        const final: any = {};
        dayKeys.forEach((d, i) => (final[d] = shifted[i]));

        return final;
    };


    useEffect(() => {
        const newDays = updateRunningDays(
            stationList,
            prevFromStation,          // 👈 use stored station
            selectedFromStation,
            runningDays
        );

        if (newDays) {
            setDynamicRunningDays(newDays);
            setPrevFromStation(selectedFromStation);  // update for next change
        }
    }, [selectedFromStation]);


    const HandelAvailabilityDatewise = (
        runningDaysArray: any[],
        trainIndexLocal: number,
        classIndexLocal: number,
        date: string,
        trainNo: string,
        quota: string,
        Class: string,
        from: string,
        to: string
    ) => {
        // 👉 Select class
        setSelectedClass(Class);
        setSelectedClassIndex(classIndexLocal);

        // 👉 Highlight quota in UI
        if (singleMode) {
            setActiveQuotas([{ trainIndex: trainIndexLocal, classIndex: classIndexLocal, quota }]);
            setOpenQuotas([quota]);
        } else {
            setActiveQuotas((prev) => [
                ...prev,
                { trainIndex: trainIndexLocal, classIndex: classIndexLocal, quota }
            ]);
            setOpenQuotas((prev) =>
                prev.includes(quota) ? prev : [...prev, quota]
            );
        }

        // 👉 Save active class (highlight datewise UI)
        const newActiveClass = { trainIndex: trainIndexLocal, classIndex: classIndexLocal };
        setActiveClasses((prev) => [...prev, newActiveClass]);

        // 👉 Fetch availability for that date
        debouncedGetAvailability(
            trainNo,
            date,
            from,
            to,
            Class,
            quota,
            "N",
            "cache",
            6,
            runningDaysArray,
            trainIndexLocal,
            classIndexLocal
        );

        // 👉 Prepare selected day data for modal
        setSelectedDayData({
            trainNumber: trainNo,
            trainName,
            selectedFromStation: from,
            selectedToStation: to,
            displayDistance,
            displayDuration,
            displayDeparture,
            displayArrival,
            fare: headerShowfare,
            day: {
                availablityDate: date,
                availablityStatus: "—"
            }
        });

        // 👉 Open modal
        setModalVisible(true);
    };

    const renderDatewiseCompact = () => {
        if (!availabilityDateWise) return null;

        return (
            <View className="mt-3">
                {availabilityDateWise
                    .filter(
                        (item: any) =>
                            item.trainNo === trainNumber &&
                            item.enqparam.split("#")[2] === selectedFromStation &&
                            item.enqparam.split("#")[3] === selectedToStation
                    )
                    .map((item: any, idx1: any) => {
                        const classCode = item.enqparam.split("#")[4];
                        const quotaCode = item.jQuota;

                        const classIndexLocal = avlClasses.indexOf(classCode);
                        if (classIndexLocal === -1) return null;

                        const isActiveClass =
                            selectedClassIndex === classIndexLocal &&
                            selectedClass === classCode;

                        const isActiveQuota = openQuotas.includes(quotaCode);

                        return item.avlDayList.map((day: any, idx2: any) => {
                            // If quota is active above, do not show compact block
                            if (isActiveQuota) return null;

                            const cleaned = day.availablityStatus.replace(
                                "AVAILABLE-",
                                "AV - "
                            );

                            return (
                                <TouchableOpacity
                                    key={`${idx1}-${idx2}`}
                                    onPress={() =>
                                        HandelAvailabilityDatewise(
                                            [
                                                runningDays.Mon,
                                                runningDays.Tue,
                                                runningDays.Wed,
                                                runningDays.Thu,
                                                runningDays.Fri,
                                                runningDays.Sat,
                                                runningDays.Sun
                                            ],
                                            trainIndex,
                                            classIndexLocal,
                                            day.availablityDate,
                                            item.trainNo,
                                            quotaCode,
                                            classCode,
                                            selectedFromStation,
                                            selectedToStation
                                        )
                                    }
                                    className="rounded-lg px-3 py-2 mb-2 bg-[#111829]"
                                >
                                    {/* TOP ROW (class + quota) */}
                                    <View className="flex-row items-center">
                                        <View
                                            className={`px-1 py-[1px] rounded border mr-2 ${isActiveClass
                                                ? "border-green-400 bg-green-800/40"
                                                : "border-green-500"
                                                }`}
                                        >
                                            <Text
                                                className={`text-[10px] ${isActiveClass ? "text-green-300" : "text-green-400"
                                                    }`}
                                            >
                                                {classCode}
                                            </Text>
                                        </View>

                                        <Text
                                            className={`text-[12px] ${quotaCode === "GN"
                                                ? "text-green-300"
                                                : quotaCode === "TQ"
                                                    ? "text-red-300"
                                                    : quotaCode === "LD"
                                                        ? "text-yellow-300"
                                                        : quotaCode === "PT"
                                                            ? "text-gray-300"
                                                            : "text-blue-300"
                                                }`}
                                        >
                                            {quotaCode === "GN"
                                                ? "General"
                                                : quotaCode === "TQ"
                                                    ? "Tatkal"
                                                    : quotaCode === "LD"
                                                        ? "Ladies"
                                                        : quotaCode === "PT"
                                                            ? "Premium Tatkal"
                                                            : "Quota"}
                                        </Text>
                                    </View>

                                    <Text
                                        className={`mt-1 font-semibold ${cleaned.includes("AV")
                                            ? "text-green-400"
                                            : cleaned.includes("RAC")
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                            }`}
                                    >
                                        {cleaned}
                                    </Text>

                                    {/* LAST UPDATED TIME */}
                                    <Text className="text-gray-500 text-[10px] mt-1">
                                        {timedifferenceInHHMM(day.updatedAt, timestamp, true)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        });
                    })}
            </View>
        );
    };


    return (
        <View className="p-2 mb-3 mx-2 rounded-lg bg-[#1E293B]" key={trainIndex}>

            {/* Header */}
            <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                    <Ionicons name="train" size={16} color="#F87171" />
                    <Text className="text-gray-200 font-semibold ml-1">
                        {trainNumber}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => setShowRouteModal(true)}>
                    <Text className="text-white font-semibold text-right text-xs uppercase">
                        {trainName}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Running Days */}
            <View className="flex-col justify-center mb-2">
                <View className="flex-row justify-center mb-2">
                    {dayKeys.map((d) => (
                        <Text
                            key={d}
                            className={`
        mx-[3px] text-xs font-semibold
        ${dynamicRunningDays[d] === "Y" ? "text-green-500" : "text-red-500"}
      `}
                        >
                            {d[0]}
                        </Text>   // <-- ONLY FIRST LETTER
                    ))}
                </View>



                <View className="justify-center items-center mb-2">
                    <TouchableOpacity onPress={() => setShowRouteModal(true)}>
                        <Text className="text-warning">
                            Route
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>

            {/* Route Info */}
            <View className="flex-row justify-between items-center px-1 mb-2">
                <View className="items-center">
                    <TouchableOpacity onPress={() => setFromModalOpen(true)}>
                        <Text className="text-blue-400 font-bold text-sm">
                            {selectedFromStation}
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-gray-400 text-xs">{displayDeparture}</Text>
                    <Text className="text-gray-400 text-xs">{displayDistance} KM</Text>
                </View>

                <View className="items-center">
                    <Text className="text-yellow-400 text-xs">→</Text>
                    <Text className="text-white text-xs">
                        - {haltsCount} {haltsCount >= 2 ? "Halts" : "Halt"} -
                    </Text>
                </View>

                <View className="items-center">
                    <TouchableOpacity onPress={() => setToModalOpen(true)}>
                        <Text className="text-red-400 font-bold text-sm">
                            {selectedToStation}
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-gray-400 text-xs">{displayArrival}</Text>
                    <Text className="text-gray-400 text-xs">{formatDuration(displayDuration)}</Text>
                </View>
            </View>

            {/* Classes */}
            <View className="flex-row justify-center flex-wrap mt-2">
                {avlClasses.map((cls) => {
                    const active = selectedClass === cls;
                    return (
                        <TouchableOpacity
                            key={cls}
                            onPress={() => toggleClass(cls)}
                            className={`px-3 py-[6px] mx-1 rounded-md border ${active
                                ? "bg-green-700 border-green-400"
                                : "bg-[#0F172A] border-green-500"
                                }`}
                        >
                            <Text
                                className={`text-xs font-semibold ${active ? "text-white" : "text-green-400"
                                    }`}
                            >
                                {cls}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Quota Panel */}
            {selectedClass && (
                <View className="mt-3 p-1 rounded-lg bg-[#0B1220]">

                    {/* Title */}
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-gray-200 font-semibold text-sm ml-2">
                            Quotas for {selectedClass}
                        </Text>

                        <TouchableOpacity onPress={() => {
                            setSelectedClass(undefined);
                            setOpenQuotas([]);
                        }}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* QUOTA BUTTONS */}
                    <View className="flex-row flex-wrap">
                        {quotaList.map((q, qIndex) => (
                            <TouchableOpacity
                                key={q}
                                onPress={() => onQuotaClickLocal(q, qIndex)}
                                className={`
                                       py-2 mx-1 my-1 rounded-md w-[46px]
                                     ${openQuotas.includes(q)
                                        ? // CLICKED BG COLORS
                                        q === "GN"
                                            ? "bg-blue-600"
                                            : q === "TQ"
                                                ? "bg-red-600"
                                                : q === "PT"
                                                    ? "bg-gray-600"
                                                    : q === "LD"
                                                        ? "bg-yellow-600"
                                                        : "bg-cyan-600"
                                        : // NOT CLICKED BG
                                        "bg-[#1E2535]"
                                    }
                          `}
                            >
                                <Text
                                    className={`
                                      text-sm font-semibold text-center
                                        ${openQuotas.includes(q)
                                            ? "text-white" // CLICKED TEXT COLOR
                                            : q === "GN"
                                                ? "text-blue-300"
                                                : q === "TQ"
                                                    ? "text-red-300"
                                                    : q === "PT"
                                                        ? "text-gray-300"
                                                        : q === "LD"
                                                            ? "text-yellow-300"
                                                            : "text-cyan-300"
                                        }
                        `}
                                >
                                    {q}
                                </Text>

                                {avlLoader && openQuotas.includes(q) && (
                                    <Text className="text-yellow-300 text-[10px] mt-1 text-center">
                                        Loading...
                                    </Text>
                                )}
                            </TouchableOpacity>


                        ))}
                    </View>

                    {/* MULTIPLE AVAILABILITY ROWS */}
                    {openQuotas.map((q) => {
                        if (selectedClassIndex === null) return null;

                        const key = `${trainIndex}-${selectedClassIndex}-${q}`;
                        const data = availability[key];

                        if (!data?.avlDayList) return null;

                        return (
                            <View key={key} className="bg-gray-900 border border-gray-800 p-4 rounded-xl mb-3">
                                {/* HEADER - Minimal Dark Mode */}
                                <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-800">
                                    {/* Train info */}
                                    <View className="flex-row items-center">
                                        <View className="bg-blue-900 p-2 rounded-lg mr-3">
                                            <Ionicons name="train-outline" size={16} color="#60a5fa" />
                                        </View>
                                        <View>
                                            <Text className="text-gray-400 text-xs">Train No.</Text>
                                            <Text className="text-white font-bold text-base">
                                                {trainNumber}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Fare */}
                                    <View className="bg-gray-800 px-3 py-2 rounded-lg">
                                        <Text className="text-success font-bold text-lg">
                                            ₹{headerShowfare || "—"}
                                        </Text>
                                    </View>
                                </View>

                                {/* AVAILABILITY CALENDAR SECTION */}
                                <View className="mb-2">
                                    {/* Calendar Header */}
                                    <View className="flex-row justify-between items-center mb-3 px-1">
                                        <Text className="text-gray-300 text-xs font-semibold tracking-wide">
                                            AVAILABILITY CALENDAR
                                        </Text>
                                        <View className="bg-gray-800 px-2 py-1 rounded-full">
                                            <Text className="text-success text-xs font-medium">
                                                {q}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* DATE CARDS - Horizontal Scroll */}
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingHorizontal: 2 }}
                                    >
                                        <View className="flex-row gap-1 pb-1">
                                            {data.avlDayList.map((day: any, i: number) => {
                                                const status = day.availablityStatus || "";
                                                const cleaned = status.replace("AVAILABLE-", "AV - ");
                                                const isToday = new Date(day.availablityDate).toDateString() === new Date().toDateString();
                                                const isFirst = i === 0;
                                                const isLast = i === data.avlDayList.length - 1;

                                                const runningDaysArr = [
                                                    runningDays.Mon,
                                                    runningDays.Tue,
                                                    runningDays.Wed,
                                                    runningDays.Thu,
                                                    runningDays.Fri,
                                                    runningDays.Sat,
                                                    runningDays.Sun,
                                                ];

                                                // Parse date for display
                                                const dateParts = formatDateWithDayandmonth(day.availablityDate).split(', ');
                                                const dayName = dateParts[0]?.substring(0, 3) || "";
                                                const dateDisplay = dateParts[1] || "";

                                                return (
                                                    <View
                                                        key={day.availablityDate}
                                                        className={`items-center mx-1.5 w-[130px] ${isToday ? 'bg-blue-900/30 border border-blue-700' : 'bg-gray-800 border border-gray-700'} p-3 rounded-lg w-[100px]`}
                                                    >
                                                        {/* Date Navigation */}
                                                        <View className="flex-row items-center justify-between w-full mb-3">
                                                            {isFirst ? (
                                                                <TouchableOpacity
                                                                    onPress={() =>
                                                                        previousAvailability(
                                                                            runningDaysArr,
                                                                            day.availablityDate,
                                                                            trainNumber,
                                                                            q,
                                                                            selectedClass,
                                                                            selectedClassIndex as number,
                                                                            trainIndex,
                                                                            selectedFromStation,
                                                                            selectedToStation
                                                                        )
                                                                    }
                                                                    className="p-1 bg-gray-700 rounded-full mr-8"
                                                                >
                                                                    <Ionicons name="chevron-back" size={12} color="#9ca3af" />
                                                                </TouchableOpacity>
                                                            ) : (
                                                                <View className="w-6" />
                                                            )}

                                                            {/* Date Display - Centered */}
                                                            <View className="flex-1 items-center">
                                                                <Text className="text-gray-400 text-[10px] font-medium uppercase">
                                                                    {dayName}
                                                                </Text>
                                                                <Text className="text-white text-sm font-bold mt-0.5 whitespace-nowrap">
                                                                    {dateDisplay}
                                                                </Text>
                                                            </View>

                                                            {isLast ? (
                                                                <TouchableOpacity
                                                                    onPress={() =>
                                                                        NextAvailability(
                                                                            runningDaysArr,
                                                                            day.availablityDate,
                                                                            trainNumber,
                                                                            q,
                                                                            selectedClass,
                                                                            selectedClassIndex as number,
                                                                            trainIndex,
                                                                            selectedFromStation,
                                                                            selectedToStation
                                                                        )
                                                                    }
                                                                    className="p-1 bg-gray-700 rounded-full ml-8"
                                                                >
                                                                    <Ionicons name="chevron-forward" size={12} color="#9ca3af" />
                                                                </TouchableOpacity>
                                                            ) : (
                                                                <View className="w-6" />
                                                            )}
                                                        </View>

                                                        {/* Status Button */}
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                saveSearchInitData(day, q);
                                                                setSelectedDayData({
                                                                    trainNumber,
                                                                    trainName,
                                                                    selectedFromStation,
                                                                    selectedToStation,
                                                                    displayDistance,
                                                                    displayDuration,
                                                                    displayDeparture,
                                                                    displayArrival,
                                                                    fare: headerShowfare,
                                                                    day,
                                                                    q
                                                                });
                                                                setModalVisible(true);
                                                            }}
                                                            className={`w-full py-2 px-0 rounded-md  ${status.includes('AVAILABLE')
                                                                ? 'bg-green-800 border border-green-700'
                                                                : status.includes('RAC')
                                                                    ? 'bg-amber-900/40 border border-amber-700/50'
                                                                    : 'bg-red-900/40 border border-red-700/50'} active:opacity-80`}
                                                        >
                                                            <Text className={`text-center whitespace-nowrap ${status.includes('AVAILABLE')
                                                                ? 'text-green-400'
                                                                : status.includes('RAC')
                                                                    ? 'text-amber-400'
                                                                    : 'text-red-400'} text-xs font-semibold`}>
                                                                {cleaned}
                                                            </Text>
                                                        </TouchableOpacity>

                                                        {/* Last Updated */}
                                                        <View className="mt-2 flex-row items-center justify-center">
                                                            <Ionicons name="time-outline" size={9} color="#6b7280" />
                                                            <Text className="text-gray-500 text-[9px] font-medium ml-1">
                                                                {timedifferenceInHHMM(
                                                                    day.updatedAt,
                                                                    timestamp,
                                                                    true
                                                                )}{' '}
                                                                &nbsp;
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        );
                    })}


                </View>
            )}

            {/* Show below Availabity with date wise */}
            <View>
                {renderDatewiseCompact()}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                {/* BACKDROP (Touchable) */}
                <Pressable
                    onPress={() => setModalVisible(false)}
                    className="flex-1 bg-black/60"
                />


                {/* MODAL CONTAINER */}
                <View className="absolute bottom-0 w-full bg-[#0F172A] rounded-t-3xl p-5"
                    style={{ height: "75%" }}
                >
                    {/* CLOSE BUTTON */}

                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-white text-lg font-bold">Train Details</Text>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="p-2"
                        >
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                    </View>



                    {selectedDayData && (
                        <ScrollView showsVerticalScrollIndicator={false} className="mt-7">

                            {/* TOP TRAIN SECTION */}
                            <View className="flex-row justify-between items-start mb-4  p-2">

                                {/* TRAIN NO + NAME */}
                                <View className="">
                                    <Text className="text-white text-xl font-bold">
                                        {selectedDayData.trainNumber}
                                    </Text>
                                    <Text className="text-gray-300 text-base">
                                        {selectedDayData.trainName}
                                    </Text>

                                    {/* Selected Class + Quota */}
                                    <View className="flex-row mt-2">
                                        <View className="px-2 py-1 rounded bg-blue-700 mr-2">
                                            <Text className="text-white font-semibold text-xs">
                                                {selectedClass}
                                            </Text>
                                        </View>

                                        <View
                                            className="bg-warning"
                                        >
                                            <Text className="text-white font-semibold text-xs mt-1">
                                                {selectedDayData.q}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* TRAIN ICON */}
                                <Ionicons name="train" size={60} color="#FFCC00" className="mr-8" />
                            </View>

                            {/* STATUS BADGE */}
                            <View className="self-start px-3 py-1 rounded-lg bg-green-700 w-1/2 mb-4">
                                <Text className="text-white font-semibold text-center">
                                    {selectedDayData.day.availablityStatus.replace("AVAILABLE-", "AVAILABLE - ")}
                                </Text>
                            </View>

                            {/* ROUTE CARD */}
                            <View className=" p-4 rounded-xl mb-4 bg-gray-800">

                                <View className="flex-row justify-between">
                                    {/* FROM */}
                                    <View className="items-start">
                                        <Text className="text-blue-400 font-bold text-lg">
                                            {selectedDayData.selectedFromStation}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {selectedDayData.displayDeparture}
                                        </Text>
                                    </View>

                                    {/* MIDDLE INFO */}
                                    <View className="items-center">
                                        <Text className="text-gray-400 text-xs">
                                            {selectedDayData.displayDistance} KM
                                        </Text>

                                        <Text className="text-gray-400 text-xs my-1">
                                            - {haltsCount} {haltsCount > 1 ? "Halts" : "Halt"} -
                                        </Text>

                                        <Text className="text-gray-400 text-xs">
                                            {selectedDayData.displayDuration}
                                        </Text>
                                    </View>

                                    {/* TO */}
                                    <View className="items-end">
                                        <Text className="text-red-400 font-bold text-lg">
                                            {selectedDayData.selectedToStation}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {selectedDayData.displayArrival}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* DATE CARD */}
                            <View className=" p-4 rounded-xl mb-4 bg-gray-800 flex flex-row justify-between">
                                <Text className="text-gray-200 text-xs">Date</Text>
                                <Text className="text-white mt-1 font-semibold">
                                    {formatDateWithDayandmonth(selectedDayData.day.availablityDate)}
                                </Text>
                            </View>

                            {/* FARE CARD */}
                            <View className="bg-gray-800 p-4 rounded-xl mb-4 flex-row justify-between">
                                <Text className="text-gray-300 text-sm">Fare</Text>
                                <Text className="text-green-400 text-xl font-bold">
                                    ₹ {selectedDayData.fare}
                                </Text>
                            </View>

                            {/* CONTINUE BUTTON */}
                            <TouchableOpacity
                                onPress={() => {
                                    setModalVisible(false);
                                    setDateAlertModal(true);
                                }}
                                className="bg-green-600 p-2 rounded-xl mt-2"
                            >
                                <Text className="text-white text-center text-lg font-bold">
                                    Continue →
                                </Text>
                            </TouchableOpacity>

                            <View className="h-10" />
                        </ScrollView>
                    )}
                </View>
            </Modal>



            {/* Alert modal */}
            <Modal
                visible={dateAlertModal}
                transparent
                animationType="fade"
                onRequestClose={() => setDateAlertModal(false)}
            >
                {/* BACKDROP */}
                <Pressable
                    className="flex-1 bg-black/60"
                    onPress={() => setDateAlertModal(false)}
                />

                {/* CENTERED MODAL */}
                <View
                    className="absolute top-0 bottom-0 left-0 right-0 justify-center items-center px-6"
                >
                    <View className="bg-[#1E293B] w-full rounded-2xl p-6 shadow-xl">

                        {/* WARNING ICON */}
                        <View className="items-center mb-3">
                            <Ionicons name="warning" size={40} color="#fbbf24" />
                        </View>

                        {/* TITLE */}
                        <Text className="text-yellow-400 font-bold text-xl text-center">
                            Date Change Alert !!
                        </Text>

                        {/* MESSAGE */}
                        <Text className="text-gray-300 text-center mt-4 text-base leading-5">
                            You searched trains for date
                            <Text className="text-red-400"> {formatDateType(journeyDate)} </Text>
                        </Text>

                        <Text className="text-gray-300 text-center mt-1 text-base leading-5">
                            but booking for
                            <Text className="text-green-400">
                                {" "}
                                {formatDateWithDayandmonth(selectedDayData?.day?.availablityDate)}
                            </Text>
                            .
                        </Text>

                        <Text className="text-gray-300 text-center mt-4 text-base leading-5">
                            Do you want to continue with it?
                        </Text>

                        {/* BUTTONS */}
                        <View className="flex-row justify-between mt-6">

                            {/* CANCEL */}
                            <TouchableOpacity
                                onPress={() => setDateAlertModal(false)}
                                className="flex-1 bg-gray-600 py-3 rounded-xl mr-2"
                            >
                                <Text className="text-white text-center font-semibold">Cancel</Text>
                            </TouchableOpacity>

                            {/* CONFIRM */}
                            <TouchableOpacity
                                onPress={handleDateConfirm}
                                className="flex-1 bg-green-600 py-3 rounded-xl ml-2"
                            >
                                <Text className="text-white text-center font-semibold">
                                    Confirm
                                </Text>
                            </TouchableOpacity>

                        </View>

                    </View>
                </View>
            </Modal>

            {/* Mobile number Modal */}
            <CustomModal
                isOpen={mobileModal}
                onClose={() => setMobileModal(false)}
                title="Enter Customer Mobile"
                showCancelButton={false}
                showConfirmButton={true}
                confirmText="Submit"
                onConfirm={mobileConfirm}
                centered={true}
                size={360}
            >
                <View className="w-full">

                    <TextInput
                        className="w-full bg-[#0F172A] text-gray-200 p-3 rounded-lg text-center text-lg border border-gray-600"
                        placeholder="Enter Mobile Number"
                        placeholderTextColor="#6B7280"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={tempMobile}
                        onChangeText={(text: string) => {
                            let v = text.replace(/[^0-9]/g, "");
                            if (v.length > 10) v = v.slice(0, 10);
                            setTempMobile(v);
                        }}
                    />

                </View>
            </CustomModal>

            {showRouteModal && trainRoute?.stationList && (
                <TrainRouteModal
                    trainName={trainName}
                    trainNumber={trainNumber}
                    arrivalCode={selectedFromStation}
                    departureCode={selectedToStation}
                    stationList={trainRoute.stationList}
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
                        {stationList
                            .filter(st => {
                                const toIndex = stationList.findIndex(s => s.stationCode === toStnCode);
                                return stationList.indexOf(st) < toIndex;
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
                        {stationList
                            .filter((station, index) => {
                                const fromIndex = stationList.findIndex(
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
};
