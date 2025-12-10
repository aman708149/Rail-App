import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInDown } from "react-native-reanimated";
import { useSelector } from "react-redux";
import { RootStore } from "@/src/store";
import { Quota } from "@/src/constants/QuotaConstants";
import { CheckButtonStatus, getAvailabilityClassCode } from "./getAvailabilityClass";
import { getTrainClassName } from "./TrainClassesName";
import { formatDateWithDayandmonth } from "@/src/utils/DateFormate/formatDateWithDay";
import { formatAvailabilityStatus } from "@/src/function/formatAvailabilityStatus";

type SixDaysAvailabilityProps = {
    avlDayList: any[];
    activeQuota: keyof typeof Quota | null;
    animationKey: number;
    availability: any[];
    onClick: (avlDay: any) => void;
    reqEnqParam: string;
    enqClass: string;
    hasTQorPTProps?: boolean;
};

export default function SixDaysAvailability({
    avlDayList,
    activeQuota,
    animationKey,
    availability,
    onClick,
    reqEnqParam,
    enqClass,
    hasTQorPTProps
}: SixDaysAvailabilityProps) {

    const selectedTrain = useSelector(
        (state: RootStore) => state.trainSelection.selectedTrain
    );

    const activeAvailability =
        availability?.find((a) => a.quota === activeQuota)?.availability?.availablityStatus;

    return (
        <>
            {avlDayList?.length > 0 && (
                <Animated.View
                    key={animationKey}
                    entering={FadeIn.duration(250)}
                    exiting={FadeOut.duration(200)}
                    className="mt-3"
                >
                    {/* Container */}
                    <View
                        className={`rounded-lg p-3 border-2 bg-slate-100 dark:bg-slate-900
                        border-${getAvailabilityClassCode(activeAvailability)}/40`}
                    >
                        {/* CLASS + QUOTA BADGES */}
                        <View className="flex-row items-center gap-2 mb-3">
                            {activeQuota && (
                                <Text
                                    className={`px-2 py-1 rounded text-white text-xs 
                                    ${Quota[activeQuota] ? "bg-blue-600" : "bg-gray-500"}`}
                                >
                                    {Quota[activeQuota]}
                                </Text>
                            )}

                            <Text className="px-2 py-1 rounded text-white text-xs bg-green-600">
                                {enqClass} • {getTrainClassName(enqClass)}
                            </Text>
                        </View>

                        {/* Horizontal Scroller */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row gap-3"
                        >
                            {avlDayList.map((day, index) => {
                                const color = getAvailabilityClassCode(day.availablityStatus);

                                const isSelected =
                                    selectedTrain?.reqEnqParam === reqEnqParam &&
                                    selectedTrain?.journeyDate === day.availablityDate;

                                return (
                                    <Animated.View
                                        key={index}
                                        entering={SlideInDown.delay(index * 40)}
                                        className="w-32 mr-2"
                                    >
                                        <View
                                            className={`rounded-lg ml-1 p-2 border border-gray-400 items-center
                                            bg-${color}/10 border-${color}/30`}
                                        >
                                            {/* DATE LABEL */}
                                            <Text className="text-sm  top-1 px-1 rounded bg-slate-300 text-gray-700 dark:text-gray-100 dark:bg-slate-800">
                                                {formatDateWithDayandmonth(day.availablityDate)}
                                            </Text>

                                            {/* STATUS */}
                                            <Text
                                                className={`mt-3 font-semibold text-xs text-${color}`}
                                            >
                                                {formatAvailabilityStatus(day.availablityStatus)}
                                            </Text>

                                            {/* BOOK BUTTON */}
                                            <TouchableOpacity
                                                disabled={CheckButtonStatus(day.availablityStatus)}
                                                onPress={() => onClick(day)}
                                                className={`mt-2 px-3 py-1 rounded 
                                                ${isSelected
                                                        ? `bg-${color}`
                                                        : `border border-${color}`
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-xs 
                                                    ${isSelected ? "text-white" : `text-${color}`}`}
                                                >
                                                    Book
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </Animated.View>
                                );
                            })}
                        </ScrollView>
                    </View>
                </Animated.View>
            )}
        </>
    );
}
