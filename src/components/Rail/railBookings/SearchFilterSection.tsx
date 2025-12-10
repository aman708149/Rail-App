import DateFilter from "@/src/utils/DatefilterAndroid";
import DateInput from "@/src/utils/dateInput";
import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import RNPickerSelect from "react-native-picker-select";

// ---------- TYPES FOR PROPS ----------
interface SearchFilterSectionProps {
    searchItem: string;
    setSearchItem: (value: string) => void;

    HandelSearch: () => Promise<void>;
    HandelSearchWithUniversal: () => Promise<void>;
    HandleGenerateExel: () => Promise<void>;
    GetAllRailBookings: (page?: number) => Promise<void>;

    isLoadingStatus: {
        isUniversalSearchLoading: boolean;
        isSearchLoading: boolean;
        isRefreshLoading: boolean;
        isGenerateExelLoading: boolean;
    };

    isChartVisible: boolean;
    toggleChartVisibility: () => void;

    user: {
        role: "admin" | "partner" | "agent" | string; // you can adjust if needed
    } | null;

    FromDate: string;
    setFromDate: (value: string) => void;
    ToDate: string;
    setToDate: (value: string) => void;

    status: string;
    setStatus: (value: string) => void;

    booked: boolean;
    Cancelled: boolean;
    Failed: boolean;
    Pending: boolean;
    partialycancelled: boolean;
    HandelStatusFilter: (value: string) => void;
}


export default function SearchFilterSection({
    searchItem,
    setSearchItem,
    HandelSearch,
    HandelSearchWithUniversal,
    HandleGenerateExel,
    GetAllRailBookings,
    isLoadingStatus,
    isChartVisible,
    toggleChartVisibility,
    user,
    FromDate,
    setFromDate,
    ToDate,
    setToDate,
    status,
    setStatus,
    booked,
    Cancelled,
    Failed,
    Pending,
    partialycancelled,
    HandelStatusFilter,
}: SearchFilterSectionProps) {

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return (
        <View className="w-full bg-[#1E293B] p-4 rounded-lg shadow-md">

            {/* 🔎 UNIVERSAL SEARCH */}
            <View className="flex-row items-center gap-2">
                <TextInput
                    className="bg-gray-700 text-white px-3 py-2 rounded-md flex-1"
                    placeholder="Universal Search"
                    placeholderTextColor="#9CA3AF"
                    value={searchItem}
                    onChangeText={setSearchItem}
                />

                {/* Universal Search Button */}
                <TouchableOpacity
                    onPress={HandelSearch}
                    disabled={searchItem === "" || isLoadingStatus.isSearchLoading}
                    className={`px-4 py-2 rounded-md ${isLoadingStatus.isSearchLoading ? "bg-gray-500" : "bg-green-600"
                        }`}
                >
                    <Text className="text-white">Universal</Text>
                </TouchableOpacity>

                {/* 📈 Chart Toggle (ADMIN ONLY) */}
                {user?.role === "admin" && (
                    <TouchableOpacity
                        onPress={toggleChartVisibility}
                        className="h-[32px] w-[32px] bg-blue-600 rounded-full items-center justify-center"
                    >
                        <Text className="text-white">📊</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* 🔎 DATE FILTERS */}
            {/* <View className="flex-row mt-3 gap-2">
                <View className="flex-1">
                    <DateFilter
                        label="From Date"
                        date={FromDateObj}
                        onChange={(iso, obj) => {
                            setFromDate(iso);
                            setFromDateObj(obj);
                        }}
                    />

                </View>

                <View className="flex-1">
                    <DateFilter
                        label="To Date"
                        date={ToDateObj}
                        onChange={(iso, obj) => {
                            setToDate(iso);
                            setToDateObj(obj);
                        }}
                    />
                </View>
            </View> */}

            <View className="flex-row mt-3 gap-2">
                <View className="flex-1">
                    <Text className="text-white mb-1">From Date</Text>
                    <DateInput
                        date={FromDate}
                        setDate={setFromDate}
                        minDate={threeMonthsAgo}    
                        maxDate={new Date()}            
                    />

                </View>

                <View className="flex-1">
                    <Text className="text-white mb-1">To Date</Text>
                    <DateInput
                        date={ToDate}
                        setDate={setToDate}
                        minDate={FromDate}             
                        maxDate={new Date(2100, 0, 1)}  
                    />
                </View>
            </View>

            {/* STATUS FILTER */}
            <View className="mt-4">
                <Text className="text-white font-semibold mb-2">Status</Text>

                <RNPickerSelect
                    onValueChange={(value: string) => setStatus(value)}
                    value={status}          // default value
                    placeholder={{ label: "All", value: "" }} // default "All"
                    items={[
                        { label: "Booked", value: "Booked" },
                        { label: "Cancelled", value: "Cancelled" },
                        { label: "Failed", value: "Failed" },
                        { label: "Pending", value: "Pending" },
                        { label: "Partially Cancelled", value: "Partially Cancelled" },
                    ]}
                    style={pickerStyles}  // custom tailwind-like styling below
                />
            </View>

            {/* BUTTONS SECTION */}
            <View className="flex-row mt-4 justify-between">

                <TouchableOpacity
                    onPress={HandelSearchWithUniversal}
                    className="bg-blue-600 px-4 py-2 rounded-md"
                >
                    <Text className="text-white">Search</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={HandleGenerateExel}
                    className="bg-green-600 px-4 py-2 rounded-md"
                >
                    <Text className="text-white">Generate Excel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => GetAllRailBookings(1)}
                    className="bg-red-600 px-4 py-2 rounded-md"
                >
                    <Text className="text-white">Refresh</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const pickerStyles = {
    inputIOS: {
        backgroundColor: "#1E293B",
        color: "white",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        fontSize: 14,
    },
    inputAndroid: {
        backgroundColor: "#1E293B",
        color: "white",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        fontSize: 14,
    },
    placeholder: {
        color: "#9CA3AF",
    },
};

