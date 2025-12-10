import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-svg-charts";  // << works in Expo
import DateTimePicker from "@react-native-community/datetimepicker";
import * as shape from "d3-shape";
import { showMessage } from "@/src/utils/showMessage";
import { GetRailBookingChartDetailViaCustomFilterService, GetRailBookingChartDetailViaFilterService } from "@/src/service/railService/railbookingService";

// -------- PROPS FIX --------
interface ComponentsChartsAreaProps {
  isChartVisible: boolean;
}

export default function ComponentsChartsArea({ isChartVisible }: ComponentsChartsAreaProps) {
  const [filter, setFilter] = useState<string>("1 Month");
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 86400000 * 5));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [pickerVisible, setPickerVisible] = useState(false);

  const [chartData, setChartData] = useState<number[]>([]); // simplified

  const formatForAPI = (date: Date) => date.toISOString().split("T")[0];

  useEffect(() => {
    fetchChartData();
  }, [filter, startDate, endDate]);

  const apiTypeMap: Record<string, string> = {
    Today: "today",
    Yesterday: "yesterday",
    "3 Days": "3days",
    "1 Week": "7days",
    "1 Month": "1month",
    "1 Year": "1year",
  };

  const fetchChartData = async () => {
    try {
      let res;

      if (filter === "Custom Range") {
        res = await GetRailBookingChartDetailViaCustomFilterService(
          "custom",
          formatForAPI(startDate),
          formatForAPI(endDate)
        );
      } else {
        const apiKey = apiTypeMap[filter] ?? "1month";
        res = await GetRailBookingChartDetailViaFilterService(apiKey);
      }

      setChartData(res.data?.data?.PNRs || []);   // use only PNRs to test first!
    } catch (error) {
      showMessage("Error", "Failed to load chart data");
    }
  };

  if (!isChartVisible) return null;

  return (
    <View className="mt-3">
      {/* FILTER BUTTONS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        {Object.keys(apiTypeMap).concat(["Custom Range"]).map((time) => (
          <TouchableOpacity
            key={time}
            onPress={() => {
              setFilter(time);
              if (time === "Custom Range") setPickerVisible(true);
            }}
            className={`px-3 py-2 rounded-md mx-1 ${
              filter === time ? "bg-blue-600" : "bg-gray-600"
            }`}
          >
            <Text className="text-white text-xs">{time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* DATE PICKER */}
      {pickerVisible && (
        <View className="mt-2">
          <DateTimePicker
            value={startDate}
            mode="date"
            maximumDate={new Date()}
            onChange={(_, date) => date && setStartDate(date)}
          />

          <DateTimePicker
            value={endDate}
            mode="date"
            maximumDate={new Date()}
            onChange={(_, date) => {
              date && setEndDate(date);
              setPickerVisible(false);
            }}
          />
        </View>
      )}

      {/* LINE CHART */}
      {chartData.length > 0 ? (
        <LineChart
          style={{ height: 220 }}
          data={chartData}
          svg={{ stroke: "#22C55E", strokeWidth: 3 }} // green
          contentInset={{ top: 20, bottom: 20 }}
          curve={shape.curveMonotoneX} // smooth curve
        />
      ) : (
        <Text className="text-white text-center mt-4">No Data Available</Text>
      )}
    </View>
  );
}
