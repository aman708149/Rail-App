import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    Pressable,
    ActivityIndicator,
    Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import { useRouter } from "expo-router";
import { stationService, PostRailQuery, trainbetweenstations, GetAvailabilityDateWise, trainavailability, RailFareCalculationService, trainavailabilitys } from "@/src/service/apiservice";
import { updateRailSearchPreferences } from "@/src/service/railService/updateRailSearch";
import { handleAxiosError } from "@/src/utils/handleAxiosError";
import { isValidIndianMobile } from "@/src/utils/isValidIndianMobile";
import { Colors } from "@/constants/theme";
// import "../../../global.css";
import { CrossPlatformDatePicker } from "@/src/components/CrossPlatformDatePicker";
import { TrainCard } from "@/src/components/Rail/trainavailability/TrainCard";
import { formatDateType } from "@/src/utils/DateFormate/Dateformate";
import { ModifySearchModal } from "@/src/components/Rail/trainavailability/ModifySearchModal";
import { showMessage } from "@/src/utils/showMessage";
import { TrainRoute } from "@/src/types/train";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-native-paper";
import { TrainListSkeleton } from "@/src/components/Rail/trainavailability/TrainListSkeleton";
import useAutoUpdatingTimestamp from "@/src/hooks/useAutoUpdatingTimestamp";
import { setBoardingAtCode } from "@/src/store/rail/train-route/trainRouteSlices";


interface Station {
    _id: string;
    stationName: string;
    stationCode: string;
}

interface TrainData {
    fromStation: string;
    toStation: string;
    journeyDate: string;
    mobileNumber?: string;
    quota?: string;
}

interface Train {
    trainType: any;
    journeyDate: string;
    trainNumber: string;
    trainName: string;
    fromStnCode: string;
    toStnCode: string;
    arrivalTime: string;
    departureTime: string;
    distance: string;
    duration: string;
    runningMon: string;
    runningTue: string;
    runningWed: string;
    runningThu: string;
    runningFri: string;
    runningSat: string;
    runningSun: string;
    avlClasses: string[];
    GetTrainAvailabilityMobile: Function;
    trainRoute?: TrainRoute | null;
}

interface ActiveQuotaState {
    trainIndex: number;
    classIndex: number;
    quota: string;
}

export interface TrainRouteStation {
    stationCode: string;
    stationName: string;
    arrivalTime: string;
    departureTime: string;
}

type RunningDayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

interface RunningDaysMap {
    Mon: string;
    Tue: string;
    Wed: string;
    Thu: string;
    Fri: string;
    Sat: string;
    Sun: string;
}




export default function TrainAvailability() {
    const router = useRouter();
    const dispatch = useDispatch();

    const [fromStation, setFromStation] = useState("");
    const [toStation, setToStation] = useState("");
    const [journeyDateObj, setJourneyDateObj] = useState(new Date());
    const [journeyDate, setJourneyDate] = useState(
        DateTime.now().toFormat("yyyy-MM-dd")
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
    const [toSuggestions, setToSuggestions] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [minDate, setMinDate] = useState(new Date());
    const [mobileNumber, setMobileNumber] = useState("");
    const [quota, setQuota] = useState("GN");

    const colorScheme = "dark";
    const theme = Colors[colorScheme ?? "dark"];

    const [trainList, setTrainList] = useState<Train[]>([]);
    const [ulternatetrain, setUlternatetrain] = useState<Train[]>([]);
    const [quotaList, setQuotaList] = useState<string[]>([]);
    const [quotaListUlternatetrain, setQuotaListUlternatetrain] = useState<string[]>([]);
    const [availabilityDateWise, setAvailabilityDateWise] = useState<any[]>([]);
    const [enqparam, setEnqparam] = useState<string[]>([]);

    const [quotaAvailability, setQuotaAvailability] = useState({});
    const [quotaLoading, setQuotaLoading] = useState("");
    const [trainAvailablity, setTrainAvailablity] = useState<any>([]);
    const [activeQuotas, setActiveQuotas] = useState<ActiveQuotaState[]>([]);
    const [fares, setFares] = useState<any>({});
    const [headerShowfare, setHeaderShowfare] = useState('');
    const [timingdetails, setTimingdetails] = useState<any>([]);
    const [singleMode, setSingleMode] = useState(false);
    const timestamp = useAutoUpdatingTimestamp();

    const classOrder = [
        '1A',
        '2A',
        '3A',
        '3E',
        'EA',
        'EC',
        'CC',
        'SL',
        '2S',
    ].reverse();

    useEffect(() => {
        if (enqparam && enqparam.length > 0) {
            GetAvailabilityDateWiseService(enqparam);
        }
    }, [enqparam]);

    const GetAvailabilityDateWiseService = async (enqparam: string[]) => {
        // Filter out enqparam values that already exist in availabilityDateWise
        const filteredEnqparam = enqparam.filter(
            (param: any) =>
                !availabilityDateWise.some((item: any) => item.enqparam === param)
        );
        // If no new enqparam values to fetch, exit early
        if (filteredEnqparam.length === 0) {
            return;
        }

        try {
            const response = await GetAvailabilityDateWise(filteredEnqparam);
            if (response.status === 200 || response.status === 201) {
                setAvailabilityDateWise((prevAvailabilityDateWise) => {
                    // Assuming response.data is an array of items
                    const newItems = Array.isArray(response.data)
                        ? response.data
                        : [response.data];
                    // Combine the existing items with the new items
                    const updatedArray = [...prevAvailabilityDateWise, ...newItems];
                    // Filter out duplicates based on `_id`
                    const uniqueArray = updatedArray.reduce((acc, current) => {
                        const x = acc.find(
                            (item: { _id: any }) => item._id === current._id
                        );
                        if (!x) {
                            return acc.concat([current]);
                        } else {
                            return acc;
                        }
                    }, []);
                    // Sort according to classOrder
                    uniqueArray.sort(
                        (a: { enqparam: string }, b: { enqparam: string }) => {
                            const classA = a.enqparam.split('#')[4];
                            const classB = b.enqparam.split('#')[4];
                            return classOrder.indexOf(classA) - classOrder.indexOf(classB);
                        }
                    );
                    return uniqueArray;
                });
            }
        } catch (error) {
            console.error('Error fetching Availability Date Wise:', error);
        }
    };



    // useEffect(() => {
    //     const fetchTrainList = async () => {
    //         try {
    //             const stored = await AsyncStorage.getItem("searchInitData");
    //             if (!stored) return;

    //             const { fromStation, toStation, journeyDate } = JSON.parse(stored);

    //             // ✅ Date format: remove hyphens (2025-11-12 → 20251112)
    //             const formattedDate = journeyDate.replace(/-/g, "");

    //             // ✅ API expects full name like "DELHI - DLI", so use as is.
    //             const fromValue = fromStation.trim();
    //             const toValue = toStation.trim();

    //             // console.log("🚆 Fetching:", {
    //             //     fromstation: fromValue,
    //             //     tostation: toValue,
    //             //     date: formattedDate,
    //             //     source: "cache",
    //             // });

    //             const data = await trainbetweenstations(fromValue, toValue, formattedDate, "cache");
    //             setTrainList(data.trainBtwnStnsList || []);
    //             setUlternatetrain(data?.alternateTrains || []);
    //             setQuotaList(data?.quotaList || []);
    //             setQuotaListUlternatetrain(data?.alternateTrains?.quotaList || []);

    //         } catch (error: any) {
    //             console.error("❌ Error fetching trains:", error?.response?.data || error.message);
    //         }
    //     };

    //     fetchTrainList();
    // }, []);

    useEffect(() => {
        const fetchTrainList = async () => {
            setIsLoading(true);   // <-- START LOADER

            try {
                const stored = await AsyncStorage.getItem("searchInitData");
                if (!stored) return;

                const { fromStation, toStation, journeyDate } = JSON.parse(stored);
                const formattedDate = journeyDate.replace(/-/g, "");

                const data = await trainbetweenstations(fromStation, toStation, formattedDate, "cache");

                setTrainList(data.trainBtwnStnsList || []);
                setUlternatetrain(data?.alternateTrains || []);
                setQuotaList(data?.quotaList || []);
                setQuotaListUlternatetrain(data?.alternateTrains?.quotaList || []);
            }
            catch (error) {
                console.log("Error fetching trains:", error);
            }
            finally {
                setIsLoading(false);   // <-- STOP LOADER
            }
        };

        fetchTrainList();
    }, []);


    // Load saved data from AsyncStorage
    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem("searchInitData");
            if (stored) {
                const data = JSON.parse(stored);
                setFromStation(data.fromStation || "");
                setToStation(data.toStation || "");
                setJourneyDate(data.journeyDate || DateTime.now().toFormat("yyyy-MM-dd"));
            }
        })();
    }, []);

    // Fetch station suggestions
    const fetchSuggestions = async (type: "from" | "to", query: string) => {
        if (!query || query.trim().length < 2) {
            type === "from" ? setFromSuggestions([]) : setToSuggestions([]);
            return;
        }

        try {
            const response = await stationService.fetchStationSuggestions(type, query);
            if (Array.isArray(response)) {
                if (type === "from") setFromSuggestions(response);
                else setToSuggestions(response);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    // Select suggestion
    const handleSelectStation = (type: "from" | "to", station: Station) => {
        const formatted = `${station.stationName} - ${station.stationCode}`;
        if (type === "from") {
            setFromStation(formatted);
            setFromSuggestions([]);
        } else {
            setToStation(formatted);
            setToSuggestions([]);
        }
    };

    // Swap stations
    const handleSwap = () => {
        const temp = fromStation;
        setFromStation(toStation);
        setToStation(temp);
    };

    // Full Search Handler (dynamic)
    const handleNavigation = async () => {
        setIsLoading(true);
        try {
            if (fromStation === toStation) {
                Toast.show({
                    type: "error",
                    text1: "From and To stations must be different!",
                });
                setIsLoading(false);
                return;
            }

            if (mobileNumber.length > 0 && !isValidIndianMobile(mobileNumber)) {
                Toast.show({ type: "error", text1: "Please enter a valid mobile number!" });
                setIsLoading(false);
                return;
            }

            if (!fromStation || !toStation || !journeyDate) {
                Toast.show({ type: "error", text1: "Please fill all required fields!" });
                setIsLoading(false);
                return;
            }

            const dataToPass: TrainData = {
                fromStation,
                toStation,
                journeyDate,
                mobileNumber,
                quota,
            };

            await AsyncStorage.setItem("searchInitData", JSON.stringify(dataToPass));

            // Save in recent searches
            let lastFiveSearches = JSON.parse(
                (await AsyncStorage.getItem("lastfivesearches")) || "[]"
            );

            const isDuplicate = lastFiveSearches.some(
                (search: any) =>
                    search?.fromStation === dataToPass?.fromStation &&
                    search?.toStation === dataToPass?.toStation &&
                    search?.journeyDate === dataToPass?.journeyDate &&
                    search?.mobileNumber === dataToPass?.mobileNumber
            );

            if (!isDuplicate) {
                lastFiveSearches.unshift(dataToPass);
                if (lastFiveSearches.length > 5) {
                    lastFiveSearches = lastFiveSearches.slice(0, 5);
                }
                await AsyncStorage.setItem("lastfivesearches", JSON.stringify(lastFiveSearches));
            }

            if (mobileNumber.length > 0) {
                const data = {
                    mobile: mobileNumber,
                    queries: {
                        rail: {
                            from: fromStation,
                            to: toStation,
                            travelDate: journeyDate,
                            queryTime: new Date().toISOString(),
                        },
                    },
                };
                await PostRailQuery(data);
            }

            // Navigation logic
            await updateRailSearchPreferences(1);
            router.push("/rail/trainavailability" as any);
            setModalVisible(false);
        } catch (error) {
            handleAxiosError(error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: Date | string) => {
        try {
            return DateTime.fromJSDate(new Date(date))
                .setZone('Asia/Kolkata', { keepLocalTime: false })
                .toFormat('yyyyLLdd'); // e.g., 20250524
        } catch {
            return ''; // Or handle the error as needed
        }
    };

    function convertRunningDaysToString(runningDaysArray: any) {
        return runningDaysArray.join('');
    }

    const Faredetails = (trainnumberclass: string, fareData: any) => {
        setFares((prevFares: any) => ({
            ...prevFares, // Spread the previous fares to maintain other entries
            [trainnumberclass]: fareData, // Update only the specific train number's fare
        }));
    };

    const RailFareCalculation = async (
        classname: string,
        fare: number,
        trainnumber: string
    ) => {
        try {
            const response = await RailFareCalculationService(classname, fare);
            setHeaderShowfare(response?.data?.totalFare);
            Faredetails(trainnumber + classname, response.data);
        } catch (error) {
            handleAxiosError(error)
        }
    };

    const [avlLoader, setAvlLoader] = useState<boolean>(false);
    const [isTimer, setIsTimer] = useState<any>();
    // ⬇️ React Native version of GetTrainAvailablity
    const GetTrainAvailablity = async (
        trainNo: string,
        SearchDate: string,
        frmStn: string,
        toStn: string,
        jClass: string,
        jQuota: string,
        paymentEnqFlag: string,
        source: string,
        daylimit: number,
        runningDays: string[],
        trainIndex: number,
        classIndex: number
    ) => {
        let loaderTimeout: any;

        // 🔄 Delay Loader (2 sec)
        loaderTimeout = setTimeout(() => {
            setAvlLoader(true);
        }, 2000);

        try {
            // 🟦 Format Inputs
            const formattedSeachDate = formatDate(SearchDate);
            const formaterunningDaystring = convertRunningDaysToString(runningDays);

            // 🟦 API Call
            const result = await trainavailabilitys(
                trainNo,
                formattedSeachDate,
                frmStn,
                toStn,
                jClass,
                jQuota,
                paymentEnqFlag,
                source,
                daylimit,
                formaterunningDaystring
            );

            clearTimeout(loaderTimeout);
            setAvlLoader(false);
            setIsTimer(null);

            const key = `${trainIndex}-${classIndex}-${jQuota}`;

            // 🟦 Save Data to State
            setTrainAvailablity((prev: any) => ({
                ...prev,
                [key]: result.data,
            }));

            // console.log("Train Availability Result:", result.data);

            // 🚫 Handle API Error (HTML / custom error message)
            if (result.data?.error) {
                const errMsg = result.data.error;

                if (errMsg.includes("<html>") || errMsg.includes("404--Not")) {
                    showMessage(
                        "Error",
                        "The IRCTC API is currently unavailable due to a gateway error."
                    );
                    console.log("HTML Error:", errMsg);
                } else {
                    showMessage("Error", errMsg);
                }

                // Remove quota if failed
                setActiveQuotas((prev) =>
                    prev.filter(
                        (aq) =>
                            !(
                                aq.trainIndex === trainIndex &&
                                aq.classIndex === classIndex &&
                                aq.quota === jQuota
                            )
                    )
                );

                setTrainAvailablity((prev: any) => {
                    const updated = { ...prev };
                    delete updated[key];
                    return updated;
                });

                return;
            }

            // 🟦 Fare Calculation
            const fare =
                Number(result?.data[0]?.totalFare) +
                Number(result?.data[0]?.wpServiceTax) +
                Number(result?.data[0]?.wpServiceCharge);

            await RailFareCalculation(jClass, fare, trainNo);
        }
        catch (err) {
            clearTimeout(loaderTimeout);
            setAvlLoader(false);
            handleAxiosError(err);  // ✔ Centralized Error Handling
        }
        finally {
            clearTimeout(loaderTimeout);
            setAvlLoader(false);
        }
    };

    // 🚆 Get Active Class
    const GetActiveClass = (trainIndex: number, classIndex: number) => {
        return (
            activeQuotas.find(
                (ac) => ac.trainIndex === trainIndex && ac.classIndex === classIndex
            ) || null
        );
    };

    // 🚆 Get Active Quota only if class is active
    const GetActiveQuota = (
        trainIndex: number,
        classIndex: number,
        quota: string
    ) => {
        const activeClass = GetActiveClass(trainIndex, classIndex);
        if (activeClass) {
            return (
                activeQuotas.find(
                    (ac) =>
                        ac.trainIndex === trainIndex &&
                        ac.classIndex === classIndex &&
                        ac.quota === quota
                ) || null
            );
        }
        return null;
    };

    useEffect(() => {
        if (singleMode) {
            setActiveQuotas([]);
        }
    }, [singleMode]);


    useEffect(() => {
        const loadStoredData = async () => {
            dispatch(setBoardingAtCode(""));

            try {
                // 🔄 REPLACE sessionStorage/localStorage with AsyncStorage
                const storedSearchData = await AsyncStorage.getItem("searchInitData");
                const singleModeStored = await AsyncStorage.getItem("classQuotaMode");

                if (singleModeStored) {
                    setSingleMode(JSON.parse(singleModeStored));
                }

                if (storedSearchData) {
                    const searchData = JSON.parse(storedSearchData);

                    if (searchData.fromStation) setFromStation(searchData.fromStation);
                    if (searchData.toStation) setToStation(searchData.toStation);

                    if (searchData.journeyDate) {
                        setJourneyDate(searchData.journeyDate);

                        const journeyDate = DateTime.fromFormat(
                            searchData.journeyDate,
                            "yyyy-MM-dd"
                        )
                            .setZone("Asia/Kolkata", { keepLocalTime: false })
                            .toJSDate();

                        setJourneyDateObj(journeyDate);
                    }

                    if (searchData.mobileNumber) {
                        setMobileNumber(searchData.mobileNumber);
                    }
                }
            } catch (error) {
                console.error("AsyncStorage load error:", error);
            }
        };

        loadStoredData();
    }, []);

    const HandleSingleMode = async (isEnabled: boolean) => {
        setSingleMode(isEnabled);

        if (isEnabled) {
            showMessage(
                "Success",
                "Single mode enabled: Only one quota and class can be active at a time."
            );
        } else {
            showMessage(
                "Success",
                "Single mode disabled: Multiple quotas and classes can be active simultaneously."
            );
        }

        // Save in AsyncStorage (Expo equivalent of localStorage)
        await AsyncStorage.setItem("classQuotaMode", JSON.stringify(isEnabled));
    };

    const toMinutes = (time: string) => {
        if (!time || time === "--") return 0;
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const durationToMinutes = (duration: string) => {
        if (!duration) return 0;
        const [h, m] = duration.split(":").map(Number);
        return h * 60 + m;
    };

    /* ---------------------------------------------------
       🔰 ALL STATES (FULL)
   --------------------------------------------------- */



    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);

    // Train Types
    const trainTypes = { S: "Superfast", O: "Others", VB: "Vande Bharat" };
    const [selectedTrainTypes, setSelectedTrainTypes] = useState(
        Object.keys(trainTypes).reduce((a: any, b) => ({ ...a, [b]: false }), {})
    );

    // Time Filters
    const [timeFilterStart, setTimeFilterStart] = useState(0);
    const [timeFilterEnd, setTimeFilterEnd] = useState(1440);

    const [arrivalTimeFilterStart, setArrivalTimeFilterStart] = useState(0);
    const [arrivalTimeFilterEnd, setArrivalTimeFilterEnd] = useState(1440);

    // Class Filters
    const allTrainClasses = ["1A", "2A", "3A", "3E", "EC", "CC", "SL", "2S"];
    const [selectedClasses, setSelectedClasses] = useState(
        allTrainClasses.reduce((a: any, b: string) => ({ ...a, [b]: false }), {})
    );

    // Search filter
    const [trainNameFilter, setTrainNameFilter] = useState("");

    // From/To Station Codes
    const [selectedFromStationCodes, setSelectedFromStationCodes] = useState<any>({});
    const [selectedToStationCodes, setSelectedToStationCodes] = useState<any>({});

    // Running Days
    const [selectedRunningDays, setSelectedRunningDays] = useState({
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false,
    });

    // Via Station Filter
    const [selectedViaStations, setSelectedViaStations] = useState<string>("");

    /* ---------------------------------------------------
        🔰 FILTER FUNCTIONS
    --------------------------------------------------- */

    const filterTrainsByType = (list: Train[]) => {
        if (Object.values(selectedTrainTypes).every((v) => !v)) return list;
        return list.filter((t) => selectedTrainTypes[t.trainType?.[0]]);
    };

    const filterTrainsByTime = (list: Train[]) => {
        return list.filter((train) => {
            const m = toMinutes(train.departureTime);
            return m >= timeFilterStart && m <= timeFilterEnd;
        });
    };

    const FilterTrainArrivalTime = (list: Train[]) => {
        return list.filter((train) => {
            const m = toMinutes(train.arrivalTime);
            return m >= arrivalTimeFilterStart && m <= arrivalTimeFilterEnd;
        });
    };

    const filterTrainsByClass = (list: Train[]) => {
        const active = Object.keys(selectedClasses).filter((c) => selectedClasses[c]);
        if (active.length === 0) return list;
        return list.filter((t) => t.avlClasses.some((cls) => active.includes(cls)));
    };

    const filterTrainsByNameOrNumber = (list: Train[]) => {
        if (!trainNameFilter.trim()) return list;
        const q = trainNameFilter.toLowerCase();
        return list.filter(
            (t) =>
                t.trainName.toLowerCase().includes(q) || t.trainNumber.includes(trainNameFilter)
        );
    };

    const filterTrainFromstation = (list: Train[]) => {
        const selected = Object.entries(selectedFromStationCodes)
            .filter(([, v]) => v)
            .map(([k]) => k);
        if (selected.length === 0) return list;
        return list.filter((t) => selected.includes(t.fromStnCode));
    };

    const filterTrainTostation = (list: Train[]) => {
        const selected = Object.entries(selectedToStationCodes)
            .filter(([, v]) => v)
            .map(([k]) => k);
        if (selected.length === 0) return list;
        return list.filter((t) => selected.includes(t.toStnCode));
    };

    const filterTrainsByRunningDays = (list: Train[]) => {
        return list.filter((t) => {
            const run: RunningDaysMap = {
                Mon: t.runningMon,
                Tue: t.runningTue,
                Wed: t.runningWed,
                Thu: t.runningThu,
                Fri: t.runningFri,
                Sat: t.runningSat,
                Sun: t.runningSun,
            };

            return (Object.entries(selectedRunningDays) as [RunningDayKey, boolean][])
                .every(([day, selected]) => !selected || run[day] === "Y");
        });
    };


    const FilterByViastation = (list: Train[]) => {
        if (!selectedViaStations) return list;
        return list.filter((t) =>
            t.trainRoute?.stationList.some(
                (stn) => `${stn.stationName} - ${stn.stationCode}` === selectedViaStations
            )
        );
    };

    /* ---------------------------------------------------
        🔰 APPLY ALL FILTERS
    --------------------------------------------------- */

    const applyAllFilters = (list: Train[]) => {
        let filtered = filterTrainsByType(list);
        filtered = filterTrainsByTime(filtered);
        filtered = FilterTrainArrivalTime(filtered);
        filtered = filterTrainsByClass(filtered);
        filtered = filterTrainsByNameOrNumber(filtered);
        filtered = filterTrainFromstation(filtered);
        filtered = filterTrainTostation(filtered);
        filtered = filterTrainsByRunningDays(filtered);
        filtered = FilterByViastation(filtered);
        return filtered;
    };


    const finalFilteredTrainList = applyAllFilters(trainList);

    const finalFilteredAlternateList = applyAllFilters(ulternatetrain);

    const requestSort = (key: string) => {
        let direction = "ascending";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };
    const sortLogic = (a: Train, b: Train) => {
        let A: any = a[sortConfig!.key as keyof Train];
        let B: any = b[sortConfig!.key as keyof Train];

        switch (sortConfig!.key) {
            case "trainNumber":
            case "distance":
                A = Number(A);
                B = Number(B);
                break;

            case "duration":
                A = durationToMinutes(A);
                B = durationToMinutes(B);
                break;

            case "departureTime":
            case "arrivalTime":
                A = toMinutes(A);
                B = toMinutes(B);
                break;

            case "trainName":
                A = A.toUpperCase();
                B = B.toUpperCase();
                break;
        }

        if (A < B) return sortConfig!.direction === "ascending" ? -1 : 1;
        if (A > B) return sortConfig!.direction === "ascending" ? 1 : -1;
        return 0;
    };


    const sortedTrains = useMemo(() => {
        if (!sortConfig) return finalFilteredTrainList;

        return [...finalFilteredTrainList].sort((a, b) => sortLogic(a, b));
    }, [finalFilteredTrainList, sortConfig]);

    const sortedAlternateTrains = useMemo(() => {
        if (!sortConfig) return finalFilteredAlternateList;

        return [...finalFilteredAlternateList].sort((a, b) => sortLogic(a, b));
    }, [finalFilteredAlternateList, sortConfig]);


    /* ---------------------------------------------------
        🔰 SORT FUNCTION
    --------------------------------------------------- */

    return (
        <>
            {/* Filter based on Train no, distance, duration, train name, arrival */}
            <View className="flex-1 max-h-[900px] overflow-auto" style={{ backgroundColor: theme.background }}>

                {/* Back Button - Top Right */}
                <TouchableOpacity
                    onPress={() => router.push("/rail/searchTrain")}
                    className="absolute top-0 mt-0 z-10  p-3 "
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={25} className="text-white" />
                </TouchableOpacity>
                {/* Top compact search card */}
                <View className="flex-row justify-between items-center w-full  rounded-xl"
                    style={{ backgroundColor: "#111827" }}>
                    {/* Compact Search Card */}
                    <View
                        className="flex-row justify-between items-center w-full p-4 rounded-xl"
                        style={{ backgroundColor: "#111827" }}
                    >
                        <View className=" flex flex-col items-center mt-6">
                            <Text className="text-blue-400 font-semibold text-lg">
                                {fromStation?.split("-")[1]?.trim()}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
                            <Text className="text-red-400 font-semibold text-lg">
                                {toStation?.split("-")[1]?.trim()}
                            </Text>
                        </View>

                        <View className="flex-col items-center mx-2">
                            <Text className="text-yellow-400 font-medium">
                                {formatDateType(journeyDate)}
                            </Text>
                            <View className="flex-row justify-evenly items-center p-2">

                                {/* Tooltip Optional (works only after installing react-native-paper) */}
                                {/* <Tooltip title="Switch search view">

                                    <View className="flex-row justify-center items-center">

                                        <Switch
                                            value={singleMode}
                                            onValueChange={(value) => HandleSingleMode(value)}
                                            thumbColor={singleMode ? "#10B981" : "#9CA3AF"}   // Tailwind colors
                                            trackColor={{ false: "#6B7280", true: "#34D399" }}
                                        />
                                    </View>

                                </Tooltip> */}

                            </View>
                        </View>

                        <View className="flex-col">
                            <TouchableOpacity
                                className="bg-green-500 p-2 rounded-lg mb-2"
                                onPress={() => setModalVisible(true)}
                            >
                                <Ionicons name="pencil" size={18} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-blue-500 p-2 rounded-lg"
                                onPress={handleNavigation}
                            >
                                <Ionicons name="search" size={18} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Modal */}
                    <ModifySearchModal
                        modalVisible={modalVisible}
                        setModalVisible={setModalVisible}
                        fromStation={fromStation}
                        setFromStation={setFromStation}
                        toStation={toStation}
                        setToStation={setToStation}
                        fromSuggestions={fromSuggestions}
                        toSuggestions={toSuggestions}
                        fetchSuggestions={fetchSuggestions}
                        handleSelectStation={handleSelectStation}
                        handleSwap={handleSwap}
                        showDatePicker={showDatePicker}
                        setShowDatePicker={setShowDatePicker}
                        journeyDateObj={journeyDateObj}
                        setJourneyDateObj={setJourneyDateObj}
                        setJourneyDate={setJourneyDate}
                        minDate={minDate}
                        isLoading={isLoading}
                        handleNavigation={handleNavigation}
                    />

                </View>

                {/* ✅ Move filter header here */}
                <View className="mt-1 rounded-xl py-2" style={{ backgroundColor: "#1E293B" }}>
                    {/* ROW 1 */}
                    <View className="flex-row justify-between px-2">
                        {[
                            ["trainNumber", "Train No"],
                            ["distance", "Distance"],
                            ["trainName", "Train Name"],
                        ].map(([key, label]) => (
                            <TouchableOpacity
                                key={key}
                                className="flex-1 items-center"
                                onPress={() => requestSort(key)}
                            >
                                <Text className={`text-xs font-semibold ${sortConfig?.key === key ? "text-green-500" : "text-gray-300"
                                    }`}>
                                    {label}{" "}
                                    {sortConfig?.key === key
                                        ? sortConfig.direction === "ascending" ? "↓" : "↑"
                                        : ""}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* ROW 2 */}
                    <View className="flex-row justify-between mt-1 px-2">
                        {[
                            ["departureTime", "Departure"],
                            ["duration", "Duration"],
                            ["arrivalTime", "Arrival"],
                        ].map(([key, label]) => (
                            <TouchableOpacity
                                key={key}
                                className="flex-1 items-center"
                                onPress={() => requestSort(key)}
                            >
                                <Text className={`text-xs font-semibold ${sortConfig?.key === key ? "text-green-500" : "text-gray-300"
                                    }`}>
                                    {label}{" "}
                                    {sortConfig?.key === key
                                        ? sortConfig.direction === "ascending" ? "↓" : "↑"
                                        : ""}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Train list */}
                <View className="mt-2" style={{ backgroundColor: "#0F172A" }}>
                    {isLoading ? (
                        <TrainListSkeleton />
                    ) : trainList.length === 0 ? (
                        <Text className="text-gray-400 text-center py-4">No trains found.</Text>
                    ) : (
                        <FlatList
                            data={sortedTrains}
                            keyExtractor={(item) => item?.trainNumber}
                            renderItem={({ item, index }) => (
                                <TrainCard
                                    trainNumber={item?.trainNumber}
                                    trainName={item?.trainName}
                                    fromStnCode={item?.fromStnCode}
                                    toStnCode={item?.toStnCode}
                                    distance={item?.distance}
                                    duration={item?.duration}
                                    departureTime={item?.departureTime}
                                    arrivalTime={item?.arrivalTime}
                                    quotaList={quotaList}
                                    availabilityDateWise={availabilityDateWise}
                                    availability={trainAvailablity}
                                    avlLoader={avlLoader} // ⭐ Loader
                                    GetTrainAvailablity={GetTrainAvailablity} // ⭐ Parent function
                                    fares={fares}
                                    headerShowfare={headerShowfare}
                                    trainRoute={item?.trainRoute ?? null}
                                    singleMode={singleMode}
                                    timestamp={timestamp}
                                    runningDays={{
                                        Mon: item?.runningMon,
                                        Tue: item?.runningTue,
                                        Wed: item?.runningWed,
                                        Thu: item?.runningThu,
                                        Fri: item?.runningFri,
                                        Sat: item?.runningSat,
                                        Sun: item?.runningSun,
                                    }}
                                    avlClasses={item?.avlClasses}
                                    journeyDate={journeyDate}    // ⭐ FIXED
                                    trainIndex={index} />
                            )}
                        />
                    )}

                </View>

                <View className="mt-2" style={{ backgroundColor: "#0F172A" }}>
                    {isLoading ? (
                        <TrainListSkeleton />
                    ) : ulternatetrain.length === 0 ? (
                        <Text className="text-gray-400 text-center py-4">No trains found.</Text>
                    ) : (
                        <>
                            {ulternatetrain?.length > 0 && (
                                <>
                                    <View className="text-center text-danger fw-semibold mt-2">
                                        <Text className="text-red-500 font-semibold text-center">
                                            Below trains are not running on the searched date
                                        </Text>
                                    </View>
                                    <View className="text-center p-2 bg-primary/70 mt-1 mx-2 rounded shadow-sm">
                                        <Text className="d-flex align-items-center justify-content-center gap-2 fw-semibold text-white fs-5">
                                            {/* <Icon path={mdiTrain} size={0.9} /> */}
                                            Alternate Trains
                                        </Text>
                                    </View>
                                </>
                            )}
                            <FlatList
                                data={sortedAlternateTrains}
                                keyExtractor={(item) => item?.trainNumber}
                                renderItem={({ item, index }) => (
                                    <TrainCard
                                        key={`alt-${item?.trainNumber}`}
                                        trainNumber={item?.trainNumber}
                                        trainName={item?.trainName}
                                        fromStnCode={item?.fromStnCode}
                                        toStnCode={item?.toStnCode}
                                        distance={item?.distance}
                                        duration={item?.duration}
                                        departureTime={item?.departureTime}
                                        arrivalTime={item?.arrivalTime}
                                        quotaList={quotaList}
                                        availabilityDateWise={availabilityDateWise}
                                        availability={trainAvailablity}
                                        avlLoader={avlLoader} // ⭐ Loader
                                        GetTrainAvailablity={GetTrainAvailablity} // ⭐ Parent function
                                        fares={fares}
                                        headerShowfare={headerShowfare}
                                        trainRoute={item?.trainRoute ?? null}
                                        singleMode={singleMode}
                                        timestamp={timestamp}
                                        runningDays={{
                                            Mon: item?.runningMon,
                                            Tue: item?.runningTue,
                                            Wed: item?.runningWed,
                                            Thu: item?.runningThu,
                                            Fri: item?.runningFri,
                                            Sat: item?.runningSat,
                                            Sun: item?.runningSun,
                                        }}
                                        avlClasses={item?.avlClasses}
                                        journeyDate={item?.journeyDate}    // ⭐ FIXED
                                        trainIndex={index + 10000}

                                    />

                                )}
                            />
                        </>

                    )}

                </View>


            </View>
        </>
    );
}
