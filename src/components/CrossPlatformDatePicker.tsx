import React from "react";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import DatePicker from "react-native-date-picker";
import { DateTime } from "luxon";

interface Props {
  showDatePicker: boolean;
  setShowDatePicker: (v: boolean) => void;
  journeyDateObj: Date;
  setJourneyDateObj: (v: Date) => void;
  setJourneyDate: (v: string) => void;
  minDate: Date;
}

export function CrossPlatformDatePicker({
  showDatePicker,
  setShowDatePicker,
  journeyDateObj,
  setJourneyDateObj,
  setJourneyDate,
  minDate,
}: Props) {
  const handleConfirm = (date: Date) => {
    setShowDatePicker(false);
    setJourneyDateObj(date);
    setJourneyDate(DateTime.fromJSDate(date).toFormat("yyyy-MM-dd"));
  };

  // 🌐 SIMPLE WEB FALLBACK (NO MODAL)
  if (Platform.OS === "web") {
    return (
      <input
        type="date"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#ccc",
        }}
        min={DateTime.fromJSDate(minDate).toFormat("yyyy-MM-dd")}
        value={DateTime.fromJSDate(journeyDateObj).toFormat("yyyy-MM-dd")}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleConfirm(new Date(e.target.value))
        }
      />
    );
  }

  // 📱 ANDROID / iOS (MAIN APP)
  return (
    <DatePicker
      modal
      open={showDatePicker}
      date={journeyDateObj}
      minimumDate={minDate}
      mode="date"
      onConfirm={handleConfirm}
      onCancel={() => setShowDatePicker(false)}
    />
  );
}
