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
            className={`
                mt-2 p-3 rounded-xl border-2
                shadow-sm 
                ${selectedCard ? "shadow-md" : "shadow"} 
            `}
            style={{
                backgroundColor: selectedCard
                    ? `${availabilityBg}20`
                    : `${availabilityBg}10`,
                borderColor: selectedCard
                    ? availabilityBorder
                    : `${availabilityBorder}40`,
            }}
            activeOpacity={0.8}
        >
            {/* LABELS */}
            <View className="flex-row items-center gap-2">
                <View className="bg-blue-500 px-2 py-1 rounded-md shadow">
                    <Text className="text-white text-[11px] font-semibold tracking-wide">
                        {enqClass}
                    </Text>
                </View>

                <View className="bg-purple-500 px-2 py-1 rounded-md shadow">
                    <Text className="text-primary text-[11px] font-semibold tracking-wide">
                        {quota}
                    </Text>
                </View>
            </View>

            {/* FARE */}
            {avlDayList?.fare != null && avlDayList?.fare !== 0 && avlDayList?.fare !== 0 && (
                <View className="absolute right-3 top-3 bg-white/90 px-2 py-1 rounded-md border border-gray-200">
                    <Text className="text-green-600 font-bold text-[11px]">
                        ₹{formatNumberToSouthAsian(Number(avlDayList?.fare))}
                    </Text>
                </View>
            )}

            {/* STATUS */}
            <View className="mt-3 items-center py-1">
                {avl?.availablityStatus ? (
                    <View className="flex-row items-center gap-2">
                        <View
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: availabilityBorder }}
                        />
                        <Text
                            className={`text-[14px] font-extrabold`}
                            style={{ color: availabilityText }}
                        >
                            {formatAvailabilityStatus(avl?.availablityStatus)}
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handlePressRefresh}
                        className="bg-gray-100 border border-gray-300 p-2 rounded-lg"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh" size={18} color="#6B7280" />
                    </TouchableOpacity>
                )}

                {avl?.updatedAt && timestamp && (
                    <View className="flex-row items-center gap-1 mt-2 bg-gray-50 px-2 py-1 rounded-md">
                        <Ionicons name="time-outline" size={10} color="#6B7280" />
                        <Text className="text-[10px] text-gray-600 font-medium">
                            {timedifferenceInHHMM(avl?.updatedAt, new Date(timestamp), false)}
                        </Text>
                    </View>
                )}
            </View>

            {/* FOOTER BUTTONS */}
            <View className="mt-3 flex-row justify-between items-center">
                {/* More / Less */}
                <TouchableOpacity
                    onPress={() => {
                        if (isActive) {
                            // Dropdown is open → close it, do NOT call API
                            onClick("close");
                        } else {
                            // Dropdown is closed → call API & expand
                            onClick("arrow");
                        }
                    }}
                    className="flex-row items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-gray-100"
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={isActive ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#4B5563"
                    />
                    <Text className="text-[11px] font-semibold text-gray-700">
                        {isActive ? "Less" : "More"}
                    </Text>
                </TouchableOpacity>



                {/* BOOK BUTTON */}
                {avl?.availablityStatus && (
                    <TouchableOpacity
                        disabled={bookLoader === quota}
                        onPress={() => onClick("book")}
                        className={`
                            min-w-[70px] px-4 py-2 rounded-lg flex-row items-center justify-center border
                            ${selectedCard ? "bg-green-600 border-green-600" : "bg-green-50 border-green-300"}
                        `}
                        activeOpacity={0.8}
                    >
                        {bookLoader === quota ? (
                            <View className="flex-row gap-1">
                                <View className="w-2 h-2 bg-green-600 rounded-full" />
                                <View className="w-2 h-2 bg-green-600 rounded-full" />
                                <View className="w-2 h-2 bg-green-600 rounded-full" />
                            </View>
                        ) : (
                            <View className="flex-row items-center gap-1">
                                <Ionicons
                                    name="bookmark-outline"
                                    size={14}
                                    color={selectedCard ? "white" : "#16A34A"}
                                />
                                <Text
                                    className="font-bold text-[13px]"
                                    style={{ color: selectedCard ? "white" : "#16A34A" }}
                                >
                                    Book
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}
