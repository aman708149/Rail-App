import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";

// ========= INSIDE SAME COMPONENT ========= //

// 📌 imports


interface StationItem {
  stationCode: string;
  stationName: string;
  boardingDate: string;
  departureTime: string;
}

interface BoardingPointProps {
  boardingStationList: StationItem[];
  selectedBoardingPoint: string;
  initialBooking?: { value: string; label: string } | null;  // ✔ FIXED
  handleSelectChange: (item: { value: string; label: string }) => void;
  disabled?: boolean;
}

export const BoardingAtChange: React.FC<BoardingPointProps> = ({
  boardingStationList,
  selectedBoardingPoint,
  handleSelectChange,
  initialBooking,
  disabled = false,
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔁 Convert API to options
  const options = boardingStationList.map((station: StationItem) => ({
    value: station.stationCode,
    label: `${station.stationName} - ${station.stationCode} | ${station?.boardingDate
      ? DateTime.fromISO(station.boardingDate)
        .setZone("Asia/Kolkata")
        .toFormat("EEE dd LLL") + " at " + station.departureTime
      : station.departureTime
      }`,
  }));

  // 🔎 Search filter
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🔘 Selected Value
  const selectedOption =
    options.find((o) => o.value === selectedBoardingPoint) || initialBooking;

  const handleChange = (item: { value: string; label: string }) => {
    handleSelectChange(item);
    setMenuIsOpen(false);
  };

  return (
    <View className="mt-0 w-full">

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setMenuIsOpen(true)}
        className={`flex-row items-center justify-between px-3 py-2 rounded-lg w-full 
        ${disabled ? "bg-gray-600" : "bg-gray-700"}
      `}
      >
        <Text
          className="text-white text-sm flex-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedOption?.label || "Select Boarding Point"}
        </Text>

        {!disabled && (
          <Ionicons name="chevron-down" size={20} color="#ccc" />
        )}
      </TouchableOpacity>

      <Modal transparent animationType="slide" visible={menuIsOpen}>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-gray-800 rounded-t-2xl p-5 h-[60%]">

            <Text className="text-lg text-white font-bold mb-3 text-center">
              Select Boarding Point
            </Text>

            <TextInput
              placeholder="Search station..."
              placeholderTextColor="#aaa"     // important in dark
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="border border-gray-300 text-white rounded-lg p-2 mb-3"
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleChange(item)}
                  className="p-3 mb-2 rounded-lg border border-gray-300"
                >
                  <Text className="text-white">{item.label}</Text>
                </Pressable>
              )}
            />

            <TouchableOpacity
              onPress={() => setMenuIsOpen(false)}
              className="mt-4 bg-red-600 w-full py-2 rounded-lg"
            >
              <Text className="text-center text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

};

