import React, { useCallback, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";

import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { RootStore } from "@/src/store";

import { timedifferenceInHHMM } from "@/src/Date/timedifferenceInHHMM";


import { formatNumberToSouthAsian } from "@/src/utils/Number";
import { formatAvailabilityStatus } from "@/src/function/formatAvailabilityStatus";
import { availabilityType } from "./trainTypes";
import { Quota } from "@/src/constants/QuotaConstants";
import { getAvailabilityClass, getAvailabilityClassCode, getAvailabilityTextClass } from "./getAvailabilityClass";

const globalCooldownMap: Record<string, number> = {};

export default function AvailabilityCard({
    enqClass,
    avlDayList,
    onClick,
    isActive,
    quota,
    bookLoader,
    trainNumber,
}: {
    enqClass: string;
    avlDayList: any  
    onClick: (clickType?: string) => void;
    isActive: boolean;
    quota: keyof typeof Quota;
    bookLoader: string;
    trainNumber: string;
}) {
    const selectedTrain = useSelector((state: RootStore) => state.trainSelection.selectedTrain);
    const timestamp = useSelector((state: RootStore) => state.timestamp.value);

    const avl = avlDayList?.availability;
    const cooldownPeriod = 10 * 60 * 1000; // 10 mins
    const cooldownKey = `${trainNumber}_${enqClass}_${quota}`;

    const selectedCard =
        selectedTrain?.quota === quota &&
        selectedTrain?.enqClass === enqClass &&
        selectedTrain?.trainNo === trainNumber;

    const callRefreshApi = useCallback(async () => {
        const now = Date.now();
        const lastCall = globalCooldownMap[cooldownKey] || 0;

        if (now - lastCall < cooldownPeriod) return;

        globalCooldownMap[cooldownKey] = now;
        try {
            await onClick("refresh");
        } catch (err) {
            console.error(err);
        }
    }, [cooldownKey]);

    const handlePressRefresh = () => {
        const isStale =
            !avl ||
            !timestamp ||
            timedifferenceInHHMM(avl?.updatedAt, new Date(timestamp), false) !== "Just Now";

        if (isStale) callRefreshApi();
    };

    const availabilityBg = getAvailabilityClass(avl?.availablityStatus);
    const availabilityBorder = getAvailabilityClassCode(avl?.availablityStatus);
    const availabilityText = getAvailabilityTextClass(avl?.availablityStatus);

    return (
        <TouchableOpacity
            onPress={() => onClick("refresh")}
            style={{
                backgroundColor: `${availabilityBg}20`,
                borderWidth: 2,
                borderColor: selectedCard ? availabilityBorder : `${availabilityBorder}40`,
                borderRadius: 10,
                padding: 10,
                marginTop: 8,
            }}
        >
            {/* LABELS */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                    style={{
                        backgroundColor: "#10B981",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        marginRight: 4,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 11 }}>{enqClass}</Text>
                </View>

                <View
                    style={{
                        backgroundColor: "#2563EB",
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                    }}
                >
                    <Text style={{ color: "white", fontSize: 11 }}>{quota}</Text>
                </View>
            </View>

            {/* FARE */}
            {/* FARE */}
            {avlDayList?.fare != null && avlDayList?.fare !== 0 && (
                <Text
                    style={{
                        position: "absolute",
                        right: 6,
                        top: 4,
                        fontSize: 11,
                        color: "#9CA3AF",
                    }}
                >
                    ₹ {formatNumberToSouthAsian(Number(avlDayList?.fare))}
                </Text>
            )}


            {/* STATUS */}
            <View style={{ marginTop: 6, alignItems: "center" }}>
                {avl?.availablityStatus ? (
                    <Text style={{ fontSize: 12, fontWeight: "700", color: availabilityText }}>
                        {formatAvailabilityStatus(avl?.availablityStatus)}
                    </Text>
                ) : (
                    <TouchableOpacity onPress={handlePressRefresh}>
                        <Ionicons name="refresh" size={16} color="#ccc" />
                    </TouchableOpacity>
                )}

                {avl?.updatedAt && timestamp && (
                    <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
                        {timedifferenceInHHMM(avl?.updatedAt, new Date(timestamp), false)}
                    </Text>
                )}
            </View>

            {/* FOOTER BUTTONS */}
            <View
                style={{
                    marginTop: 6,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {/* More/Less */}
                <TouchableOpacity
                    onPress={() => onClick("arrow")}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#E5E7EB",
                        paddingHorizontal: 6,
                        paddingVertical: 4,
                        borderRadius: 4,
                    }}
                >
                    <MaterialCommunityIcons
                        name={isActive ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#374151"
                    />
                </TouchableOpacity>

                {/* BOOK BTN */}
                {avl?.availablityStatus && (
                    <TouchableOpacity
                        disabled={bookLoader === quota}
                        onPress={() => onClick("book")}
                        style={{
                            backgroundColor: selectedCard ? "#16A34A" : "transparent",
                            borderWidth: 1,
                            borderColor: "#16A34A",
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            borderRadius: 4,
                        }}
                    >
                        {bookLoader === quota ? (
                            <View style={{ flexDirection: "row", gap: 4 }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "white" }} />
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "white" }} />
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "white" }} />
                            </View>
                        ) : (
                            <Text style={{ color: selectedCard ? "white" : "#16A34A", fontSize: 12 }}>
                                Book
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}
