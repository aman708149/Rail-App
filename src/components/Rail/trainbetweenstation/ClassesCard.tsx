import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/src/store";
import { Ionicons } from "@expo/vector-icons";


import { Quota } from "@/src/constants/QuotaConstants";



import { updateTrainAvailability } from "@/src/store/rail/trainBetweenStation/trainSlice";
import { setActiveTrain } from "@/src/store/rail/trainBetweenStation/ActiveTrainSlice";
import { setSelectedTrain } from "@/src/store/rail/trainBetweenStation/trainSelectionSlice";

// import AvailabilityCard from "./AvailabilityCard";
// import SixDaysAvailability from "./SixDaysAvailability";
import { GetAllQuotaAvailabilityService, GetSixDaysAvailabilityService } from "@/src/service/railService/trainbetweestation.service";
import { avlDayList } from "./avlDayList";
import { availabilityType } from "./trainTypes";
import { RouteDetails } from "../routeDetails";
import AvailabilityCard from "./AvailabilityCard";
import SixDaysAvailability from "./SixDaysAvailability";
import { RailFareCalculationService } from "@/src/service/apiservice";
import { CheckButtonStatus } from "./getAvailabilityClass";
import { showMessage } from "@/src/utils/showMessage";
import { RailAvConfigType } from "./BookingConfigType";
import Animated from "react-native-reanimated";

// ----------------- Props -----------------
interface ClassesCardProps {
    enqClass: string;
    availability: availabilityType[];
    trainNumber: string;
    journeyDate: string;
    fromStnCode: string;
    toStnCode: string;
    runningDays: string[];
    routeDetails: RouteDetails;
    initialToStnCode: string;
    initialFromStnCode: string;
}

export default function ClassesCard({
    enqClass,
    availability,
    trainNumber,
    journeyDate,
    fromStnCode,
    toStnCode,
    runningDays,
    routeDetails,
    initialToStnCode,
    initialFromStnCode
}: ClassesCardProps) {

    const dispatch = useDispatch();
    const { quotaList } = useSelector((state: RootStore) => state.trainBetweenStation);
    const activeTrain = useSelector((state: RootStore) => state.ActiveTrainSlice);

    const quotasToRender: Array<keyof typeof Quota> = ["GN", "TQ", "LD", "SS", "PT"];

    const [loading, setLoading] = useState(false);
    const [avlDayListState, setAvlDayListState] = useState<avlDayList[]>([]);
    const [bkgConfig, setBkgConfig] = useState<any>(null);

    const [activeQuota, setActiveQuota] = useState<keyof typeof Quota | null>(null);
    const [avlLoaderQuota, setAvlLoaderQuota] = useState("");
    const [bookLoaderQuota, setBookLoaderQuota] = useState("");

    const initialFromRef = useRef(fromStnCode);
    const initialToRef = useRef(toStnCode);
    const [avlDayList, setAvlDayList] = React.useState<avlDayList[]>([])


    // ---------------- QUOTA COLOR ----------------
    const quotaColor = (quota: keyof typeof Quota) => {
        switch (quota) {
            case "GN": return "#DCFCE7";  // green
            case "TQ": return "#FEE2E2";  // red
            case "LD": return "#FEF9C3";  // yellow
            case "SS": return "#E0F2FE";  // blue
            case "PT": return "#EDE9FE";  // purple
            default: return "#F1F5F9";   // gray
        }
    };

    const HandleBookClicked = async (avlDay: avlDayList, bkgConfig: RailAvConfigType) => {
        const fare = Number(bkgConfig?.totalFare) + Number(bkgConfig?.wpServiceCharge) + Number(bkgConfig?.wpServiceTax)
        const response = await RailFareCalculationService(
            bkgConfig.enqClass,
            fare
        )
        const selectedTrainData = {
            _id: bkgConfig._id,
            reqEnqParam: bkgConfig.reqEnqParam, // Unique key
            baseFare: bkgConfig.baseFare,
            cateringCharge: bkgConfig.cateringCharge,
            distance: bkgConfig.distance,
            dynamicFare: bkgConfig.dynamicFare,
            enqClass: bkgConfig.enqClass,
            from: bkgConfig.from,
            to: bkgConfig.to,
            initialFromStnCode: initialFromStnCode,
            initialToStnCode: initialToStnCode,
            quota: bkgConfig.quota,
            trainName: bkgConfig.trainName,
            trainNo: bkgConfig.trainNo,
            wpServiceCharge: bkgConfig.wpServiceCharge,
            wpServiceTax: bkgConfig.wpServiceTax,
            journeyDate: avlDay.availablityDate,
            originalJourneyDate: journeyDate,
            availabilityStatus: avlDay?.availablityStatus,
            fare: response?.data?.totalFare,
            routeDetails: routeDetails,
            agentfee: response?.data?.agentfee,
            pgcharge: response?.data?.pgcharge,
            totalFare: response?.data?.totalFare,
        };

        dispatch(setSelectedTrain(selectedTrainData));
    }

    // ---------------- FETCH QUOTA (6-DAY) ----------------
    const getSixDayAvailability = async (
        quota: keyof typeof Quota,
        clickType?: string
    ) => {
        try {
            if (clickType === "refresh") setAvlLoaderQuota(quota);
            if (clickType === "book") setBookLoaderQuota(quota);

            const runningString = runningDays.join("");

            const response = await GetSixDaysAvailabilityService(
                trainNumber,
                journeyDate,
                fromStnCode,
                toStnCode,
                enqClass,
                quota,
                "live",
                runningString
            );

            if (!response?.data?.avlDayList?.length) {
                return;
            }

            // const config = response?.data?.[0];
            // const firstDay = response.data.avlDayList[0];

            // setBkgConfig(config);
            // setAvlDayListState(response.data.avlDayList);
            // setActiveQuota(quota);

            // dispatch(updateTrainAvailability({
            //     trainNumber,
            //     enqClass,
            //     quota,
            //     avlDayList: firstDay,
            //     fare: config.totalFare
            // }));

            // // store active quota for UI highlight
            // dispatch(setActiveTrain({
            //     trainNumber,
            //     class: enqClass,
            //     quota: quota
            // }));

            // // ---------------- BOOK CASE ----------------
            // if (clickType === "book") {
            //     handleBook(firstDay, config);
            // }

            if (response?.data) {
                if (response?.data?.avlDayList?.length > 0) {
                    const bkgConfig = response?.data?.[0]
                    const fare = Number(bkgConfig?.totalFare) + Number(bkgConfig?.wpServiceCharge) + Number(bkgConfig?.wpServiceTax)
                    if (clickType !== 'book') {
                        dispatch(updateTrainAvailability({
                            trainNumber,
                            enqClass,
                            quota,
                            avlDayList: response?.data?.avlDayList[0],
                            fare: fare,  // ✅ fallback fare
                            wpServiceCharge: bkgConfig?.wpServiceCharge,
                            wpServiceTax: bkgConfig?.wpServiceTax,
                        }));
                    }
                    const responseFare = clickType !== 'book' ? await RailFareCalculationService(
                        bkgConfig.enqClass,
                        fare
                    ) : null
                    dispatch(updateTrainAvailability({
                        trainNumber,
                        enqClass,
                        quota,
                        avlDayList: response?.data?.avlDayList[0],
                        ...(responseFare && { fare: responseFare?.data?.totalFare }),
                        ...(responseFare && { agentFee: responseFare?.data?.agentfee }),
                        ...(responseFare && { pgCharge: responseFare?.data?.pgcharge }),
                        ...(responseFare && { totalFare: responseFare?.data?.totalFare }),
                        wpServiceCharge: bkgConfig?.wpServiceCharge,
                        wpServiceTax: bkgConfig?.wpServiceTax,
                    }));
                    setActiveQuota(quota);
                    setAvlDayList(response.data.avlDayList);
                    setBkgConfig(response?.data?.[0]); // Use bracket notation to access key '0'
                    if (clickType === 'book' && response?.data?.avlDayList?.length > 0) {
                        if (CheckButtonStatus(response?.data?.avlDayList[0]?.availablityStatus)) {
                            const status = response?.data?.avlDayList[0]?.availablityStatus || "Unavailable";
                            showMessage(`Booking disabled — current availability is "${status}".`);
                            return;
                        }
                        HandleBookClicked(response?.data?.avlDayList[0], response?.data?.[0])
                        return;
                    }
                } else {
                    showMessage("No availability data found for the selected train.");
                }
            } else {
                showMessage("something went wrong.");
            }

        } catch (error) {
            console.log("Availability error:", error);
        } finally {
            setAvlLoaderQuota("");
            setBookLoaderQuota("");
        }
    };

    // ---------------- FETCH ALL QUOTA AVAILABILITY ----------------
    const getAllQuotaAvailability = async () => {
        try {
            setLoading(true);

            const runningString = runningDays.join("");

            const response = await GetAllQuotaAvailabilityService(
                trainNumber,
                journeyDate,
                fromStnCode,
                toStnCode,
                enqClass,
                quotasToRender,
                "cache",
                runningString
            );

            if (response?.data) {
                response.data.forEach((item: availabilityType) => {
                    dispatch(updateTrainAvailability({
                        trainNumber,
                        enqClass,
                        quota: item.quota as keyof typeof Quota,
                        avlDayList: response?.data?.avlDayList[0],

                        ...(response && {
                            fare: Number(response?.data?.totalFare),   // FIXED ✔
                            agentFee: response?.data?.agentfee,
                            pgCharge: response?.data?.pgcharge,
                            totalFare: response?.data?.totalFare,
                        }),

                        wpServiceCharge: bkgConfig?.wpServiceCharge,
                        wpServiceTax: bkgConfig?.wpServiceTax,
                    }));

                });
            }

            initialFromRef.current = fromStnCode;
            initialToRef.current = toStnCode;

        } catch (err) {
            console.log("GetAllQuota error:", err);
        } finally {
            setLoading(false);
        }
    };

    // re-load availability when user changes from/to stations
    useEffect(() => {
        if (
            fromStnCode !== initialFromRef.current ||
            toStnCode !== initialToRef.current
        ) {
            getAllQuotaAvailability();
        }
    }, [fromStnCode, toStnCode]);

    // ---------------- BOOKING FUNCTION ----------------
    const handleBook = async (day: avlDayList, config: any) => {
        dispatch(setSelectedTrain({
            ...config,
            journeyDate: day.availablityDate,
            routeDetails,
            initialFromStnCode,
            initialToStnCode
        }));
    };

    const hasTQorPT = quotasToRender.some(
        (quota) => quotaList.includes(quota) && ['TQ', 'PT'].includes(quota)
    );

    const colSpanClass = hasTQorPT ? 'lg:col-span-2 md:w-[30%] ' : 'lg:col-span-3 md:col-span-4 md:w-full';

    // ---------------- UI ----------------
    return (
        <View className="mt-2 p-4 rounded-xl border border-gray-800/50" style={{
            backgroundColor: "#0F172A",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        }}>

            {/* CLASS HEADER */}
            <View className="mb-3 pb-2 border-b border-gray-700/50 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View className="w-2 h-5 bg-blue-500 rounded-full"></View>
                    <Text className="text-white text-lg font-bold tracking-tight">{enqClass}</Text>
                </View>
                <View className="bg-gray-800/50 p-1.5 rounded-lg">
                    <Ionicons name="train" size={18} color="#60A5FA" />
                </View>
            </View>

            {/* QUOTA CARDS */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 2, paddingVertical: 2 }}
            >
                {quotasToRender
                    .filter((q) => quotaList.includes(q))
                    .map((quota, index) => {
                        const avlObj = availability.find((a) => a.quota === quota);

                        return (
                            <View
                                key={quota}
                                style={{
                                    marginRight: 12,
                                    backgroundColor: quotaColor(quota),
                                    padding: 8,
                                    borderRadius: 12,
                                    width: 140,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 2,
                                    elevation: 3,
                                    borderWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    marginLeft: index === 0 ? 4 : 0,
                                }}
                            >
                                {/* QUOTA HEADER */}
                                <View className="flex-row justify-between items-center mb-2">
                                    <View className="flex-row items-center gap-1.5">
                                        <View className="w-1.5 h-1.5 bg-gray-900/30 rounded-full"></View>
                                        <Text className="font-bold text-gray-900 text-sm tracking-wide">
                                            {quota}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => getSixDayAvailability(quota, "refresh")}
                                        className="bg-white/20 p-1.5 rounded-lg active:opacity-70"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="refresh" size={16} color="black" />
                                    </TouchableOpacity>
                                </View>

                                {/* AVAILABILITY CARD */}
                                <AvailabilityCard
                                    enqClass={enqClass}
                                    trainNumber={trainNumber}
                                    avlDayList={avlObj?.availability}
                                    isActive={
                                        activeTrain?.trainNumber === trainNumber &&
                                        activeTrain?.classQuota?.quota === quota &&
                                        activeTrain?.classQuota?.class === enqClass
                                    }
                                    quota={quota}
                                    bookLoader={bookLoaderQuota}
                                    // onClick={(type) => {
                                    //     if (type === "close") {
                                    //         setActiveQuota(null);

                                    //         dispatch(setActiveTrain({
                                    //             trainNumber: "",
                                    //             class: "",
                                    //             quota: "",
                                    //         }));

                                    //         return;
                                    //     }

                                    //     // When closed → clicking should call API normally
                                    //     getSixDayAvailability(quota, type);
                                    // }}

                                    onClick={(type) => {
                                        if (type === "close") {
                                            setActiveQuota(null);

                                            dispatch(setActiveTrain({
                                                trainNumber: "",
                                                class: "",
                                                quota: "",
                                            }));// collapse view
                                            return;
                                        }

                                        if (type === "arrow") {
                                            // User clicked "More" → Expand and highlight card BEFORE API call
                                            dispatch(setActiveTrain({
                                                trainNumber,
                                                class: enqClass,
                                                quota,
                                            }));

                                            setActiveQuota(quota);
                                        }

                                        // Now call API normally
                                        getSixDayAvailability(quota, type);
                                    }}
                                />
                            </View>
                        );
                    })}
            </ScrollView>

            {/* 6 DAYS AVAILABILITY DROPDOWN */}
            {activeTrain?.trainNumber === trainNumber &&
                activeQuota &&
                activeTrain.classQuota?.class === enqClass &&
                activeTrain.classQuota?.quota === activeQuota && (
                    <Animated.View
                        layout={undefined}
                        className="mt-3 pt-3 border-t border-gray-700/50"
                    >
                        <SixDaysAvailability
                            avlDayList={avlDayList}
                            activeQuota={activeQuota}
                            availability={availability}
                            reqEnqParam={bkgConfig?.reqEnqParam}
                            enqClass={enqClass}
                            hasTQorPTProps={hasTQorPT}
                            onClick={(day) => handleBook(day, bkgConfig)}
                            animationKey={0}
                        />
                    </Animated.View>
                )}

        </View>
    );
}
