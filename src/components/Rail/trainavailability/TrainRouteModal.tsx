import React from "react";
import { View, Text, ScrollView, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Station {
    stationCode: string;
    stationName: string;
    arrivalTime: string;
    departureTime: string;
    haltTime: string;
    distance: number;
    dayCount: number;
}

interface Props {
    trainName: string;
    trainNumber: string;
    stationList: Station[];
    onClose: () => void;
    arrivalCode: string;
    departureCode: string

}

const TrainRouteModal: React.FC<Props> = ({ trainName, trainNumber, stationList,arrivalCode, departureCode,  onClose }) => {
    return (
        <Modal visible={true} animationType="slide">
            <View className="flex-1 bg-[#1E293B]">

                {/* HEADER */}
                <View className="flex-row justify-between items-center p-4 bg-[#0B1220]">
                    <Text className="text-white font-bold text-lg">{trainNumber} - {trainName}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={26} color="white" />
                    </TouchableOpacity>
                </View>

                {/* STATION LIST SCROLL */}
                <ScrollView contentContainerStyle={{ padding: 10 }}>
                    {stationList.map((item, index) => (
                        <View key={index}>

                            {/* 🚉 STATION CARD (same as before) */}
                            <View className={`relative mt-1 p-2 ${arrivalCode === item.stationCode
                                ? 'bg-danger/30'
                                : departureCode === item.stationCode
                                    ? 'bg-primary/30'
                                    : 'dark:bg-gray-800 dark:text-white'}`}
                            >

                                {/* Station Name and Day */}
                                <View className="flex-row justify-between items-center w-full">
                                    <Text className="text-white font-bold text-base">
                                        {item.stationName} ({item.stationCode})
                                    </Text>
                                    <Text className="text-gray-300 text-sm font-semibold">
                                        Day {item.dayCount}
                                    </Text>
                                </View>


                                <View className="flex-row justify-between mt-2">
                                    <View>
                                        <Text className="text-red-400 font-semibold">Arrival</Text>
                                        <Text className="text-gray-300">{item.arrivalTime || "--"}</Text>
                                    </View>

                                    <View>
                                        <Text className="text-blue-400 font-semibold">Departure</Text>
                                        <Text className="text-gray-300">{item.departureTime || "--"}</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-gray-300">Halt Time: {item.haltTime || "--"}</Text>
                                    <Text className="text-gray-300">Distance: {item.distance} km</Text>
                                </View>
                            </View>

                            {/* 🔽 Arrow – only if NOT last item */}
                            {index !== stationList.length - 1 && (
                                <View className="items-center mb-2">
                                    <Ionicons name="arrow-down" size={20} color="#9CA3AF" />
                                </View>
                            )}
                        </View>
                    ))}

                </ScrollView>

            </View>
        </Modal>
    );
};

export default TrainRouteModal;
