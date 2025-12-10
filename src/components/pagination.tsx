// 📌 components/PaginationComponent.tsx

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // expo install @expo/vector-icons

interface PaginationProps {
  pageCount: number;            // total pages
  page: number;                 // current page
  onPageChange: (page: number) => void; // callback
}

export default function PaginationComponent({
  pageCount,
  page,
  onPageChange,
}: PaginationProps) {

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < pageCount) onPageChange(page + 1);
  };

  return (
    <View className="flex-row items-center justify-center my-3">

      {/* ◀️ Previous Page Button */}
      <TouchableOpacity
        onPress={handlePrev}
        disabled={page === 1}
        className={`px-3 py-2 rounded-md mx-1 ${
          page === 1 ? "bg-gray-700" : "bg-[#4b5175]"
        }`}
      >
        <Ionicons name="chevron-back-outline" size={18} color="white" />
      </TouchableOpacity>

      {/* 🔢 Page Numbers */}
      {Array.from({ length: pageCount }, (_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onPageChange(i + 1)}
          className={`px-3 py-2 rounded-md mx-1 ${
            page === i + 1 ? "bg-[#4c5eeb]" : "bg-[#4b5175]"
          }`}
        >
          <Text className="text-white text-xs">{i + 1}</Text>
        </TouchableOpacity>
      ))}

      {/* ▶️ Next Page Button */}
      <TouchableOpacity
        onPress={handleNext}
        disabled={page === pageCount}
        className={`px-3 py-2 rounded-md mx-1 ${
          page === pageCount ? "bg-gray-700" : "bg-[#4b5175]"
        }`}
      >
        <Ionicons name="chevron-forward-outline" size={18} color="white" />
      </TouchableOpacity>

    </View>
  );
}
