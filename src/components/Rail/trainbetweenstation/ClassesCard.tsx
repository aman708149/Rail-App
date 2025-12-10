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

            const config = response?.data?.[0];
            const firstDay = response.data.avlDayList[0];

            setBkgConfig(config);
            setAvlDayListState(response.data.avlDayList);
            setActiveQuota(quota);

            dispatch(updateTrainAvailability({
                trainNumber,
                enqClass,
                quota,
                avlDayList: firstDay,
                fare: config.totalFare
            }));

            // store active quota for UI highlight
            dispatch(setActiveTrain({
                trainNumber,
                class: enqClass,
                quota: quota
            }));

            // ---------------- BOOK CASE ----------------
            if (clickType === "book") {
                handleBook(firstDay, config);
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
        <View className="mt-2 p-3 rounded-lg" style={{ backgroundColor: "#0F172A" }}>

            {/* CLASS HEADER */}
            <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-white text-lg font-bold">{enqClass}</Text>
                <Ionicons name="train" size={18} color="#fff" />
            </View>

            {/* QUOTA CARDS */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quotasToRender
                    .filter((q) => quotaList.includes(q))
                    .map((quota) => {
                        const avlObj = availability.find((a) => a.quota === quota);

                        return (
                            <View
                                key={quota}
                                style={{
                                    marginRight: 10,
                                    backgroundColor: quotaColor(quota),
                                    padding: 10,
                                    borderRadius: 10,
                                    width: 140,
                                }}
                            >
                                {/* QUOTA HEADER */}
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="font-bold">{quota}</Text>

                                    <TouchableOpacity
                                        onPress={() => getSixDayAvailability(quota, "refresh")}
                                    >
                                        <Ionicons name="refresh" size={18} color="black" />
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
                                    onClick={(type: string | undefined) => getSixDayAvailability(quota, type)}
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

                    <SixDaysAvailability
                        avlDayList={avlDayListState}
                        activeQuota={activeQuota}
                        availability={availability}
                        reqEnqParam={bkgConfig?.reqEnqParam}
                        enqClass={enqClass}
                        hasTQorPTProps={hasTQorPT}
                        onClick={(day: avlDayList) => handleBook(day, bkgConfig)} animationKey={0} />
                )}
        </View>
    );
}
