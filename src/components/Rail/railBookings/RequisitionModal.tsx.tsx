// 📁 src/components/Rail/RequisitionModal.tsx

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { DateTime } from "luxon";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import "global.css";
import { GetRequisitionDetailService } from "@/src/service/railService/railbookingService";

interface Props {
    railbookingid: string;
    getRailBookingIDStatusError: string;
}

export default function RequisitionModal({
    railbookingid,
    getRailBookingIDStatusError,
}: Props) {
    const [requisitionDetail, setRequisitionDetail] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [statusError] = useState(getRailBookingIDStatusError || "");

    const getRequisitionDetail = async () => {
        try {
            const response = await GetRequisitionDetailService(railbookingid);
            if (response.data) setRequisitionDetail(response.data);
        } catch (error: any) {
            console.log(error?.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getRequisitionDetail();
    }, [railbookingid]);

    if (loading)
        return (
            <View className="flex-1 justify-center items-center p-4">
                <ActivityIndicator size="large" />
            </View>
        );

    const statusClass =
        requisitionDetail?.RStatus === "Booked"
            ? "bg-green-500/20"
            : ["Cancelled", "Failed"].includes(requisitionDetail?.RStatus)
                ? "bg-red-500/20"
                : requisitionDetail?.RStatus === "Pending"
                    ? "bg-yellow-500/20"
                    : "bg-gray-600/20";

    return (
        <ScrollView className="p-4 bg-gray-900 rounded-lg">
            {/* Train Details */}
            <View className="bg-gray-800/40 rounded-lg p-3 mb-4">
                <Text className="text-xl font-bold text-white mb-2">Train Details</Text>

                {/* Train Number + Icons */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center bg-gray-700/50 px-3 py-1 rounded-xl">
                        <View className="w-8 h-8 rounded-full bg-red-500 items-center justify-center mr-2">
                            <Ionicons name="train" size={20} color="white" />
                        </View>
                        <Text className="text-white">
                            {requisitionDetail?.RBresponse?.trainNo}
                        </Text>
                    </View>

                    <View className="flex-row">
                        <View className="bg-blue-500 px-3 py-1 rounded-l-lg">
                            <Text className="text-white">
                                {requisitionDetail?.RBresponse?.enqClass}
                            </Text>
                        </View>
                        <View className="bg-red-500 px-3 py-1 rounded-r-lg">
                            <Text className="text-white">
                                {requisitionDetail?.RBresponse?.quota}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Journey Date */}
                <Text className="text-center text-white mt-3">
                    {requisitionDetail?.RBrequest?.journeyDate}
                </Text>

                {/* From → To */}
                <View className="flex-row items-center bg-gray-700/30 p-2 rounded-lg mt-3">
                    <Text className="text-green-400 flex-1 text-center">
                        {requisitionDetail?.RBresponse?.from}
                    </Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color="white" />
                    <Text className="text-red-400 flex-1 text-center">
                        {requisitionDetail?.RBresponse?.to}
                    </Text>
                </View>

                {/* Boarding Station */}
                <View className="mt-3 items-center">
                    <Text className="text-lg font-semibold text-white">Boarding At</Text>
                    <Text className="text-white">
                        {requisitionDetail?.RBrequest?.boardingStation}
                    </Text>
                </View>
            </View>

            {/* Passenger Details */}
            {requisitionDetail?.RBrequest?.passengerList?.length > 0 && (
                <View className="bg-gray-800/40 p-3 rounded-lg mb-4">
                    <Text className="text-xl text-white font-bold mb-2">
                        Passenger Details
                    </Text>
                    <View className="flex-row justify-between p-2 bg-primary">
                        <Text className="text-white">Name</Text>
                        <Text className="text-white ml-6">Age</Text>
                        <Text className="text-white">Gender</Text>
                    </View>
                    {requisitionDetail.RBrequest.passengerList.map(
                        (passenger: any, idx: number) => (
                            <View key={idx} className="flex-row justify-between p-2">
                                <Text className="text-white">{passenger?.passengerName}</Text>
                                <Text className="text-white mr-8">{passenger?.passengerAge}</Text>
                                <Text className="text-white">{passenger?.passengerGender}</Text>
                            </View>
                        )
                    )}
                </View>
            )}

            {/* Other Details */}
            <View className="bg-gray-800/40 p-3 rounded-lg mb-4">
                <Text className="text-xl font-bold text-white mb-2">Other Details</Text>
                {[
                    ["Passenger Mobile", requisitionDetail?.RBrequest?.mobileNumber],
                    ["Customer Mobile", requisitionDetail?.RBrequest?.customerMobileNumber],
                    ["Email", requisitionDetail?.RBrequest?.email],
                    ["User ID", requisitionDetail?.userID],
                    ["Owner ID", requisitionDetail?.ownerID],
                    ["Ref ID", requisitionDetail?.refID],
                ].map(
                    ([label, value], idx) =>
                        value && (
                            <View key={idx} className="flex-row justify-between mb-2">
                                <Text className="text-white">{label}</Text>
                                <Text className="text-blue-300">{value}</Text>
                            </View>
                        )
                )}
            </View>

            {/* Informational Details */}
            <View className="bg-gray-800/40 p-3 rounded-lg">
                <Text className="text-xl font-bold text-white mb-2">
                    Informational Details
                </Text>
                <Text className="text-white">
                    Requisition ID: {requisitionDetail?.railBookingID || "N/A"}
                </Text>
                <Text className="text-white">
                    Updated At:{" "}
                    {requisitionDetail?.createdAt
                        ? DateTime.fromISO(requisitionDetail.createdAt).toFormat(
                            "dd LLL yyyy HH:mm"
                        )
                        : "N/A"}
                </Text>
                <View className={`mt-4 p-2 rounded items-center w-1/2 ${statusClass}`}>
                    <Text className="text-white">Status: <Text className="bg-danger text-white px-2 rounded-sm ml-2">{requisitionDetail?.RStatus}</Text></Text>
                </View>

                {statusError ? (
                    <Text className="text-red-500 mt-2">{statusError}</Text>
                ) : null}
            </View>
        </ScrollView>
    );
}
