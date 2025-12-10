// // 📌 components/DateFilter.tsx
// import React from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
// import { Ionicons } from "@expo/vector-icons";

// interface Props {
//   label: string;
//   date: Date;
//   minDate?: Date;
//   onChange: (newDate: string, dateObj: Date) => void;
// }

// export default function DateFilter({ label, date, minDate, onChange }: Props) {
//   const openNativePicker = () => {
//     DateTimePickerAndroid.open({
//       value: date,
//       minimumDate: minDate,
//       mode: "date",
//       is24Hour: true,
//       onChange: (event, selectedDate) => {
//         if (selectedDate) {
//           const iso = selectedDate.toISOString().split("T")[0];
//           onChange(iso, selectedDate);
//         }
//       },
//     });
//   };

//   return (
//     <View className="mt-4">
//       <Text className="text-gray-400 dark:text-gray-300 mb-1">{label}</Text>

//       <TouchableOpacity
//         onPress={openNativePicker}
//         className="flex-row items-center border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-100 dark:bg-gray-800"
//       >
//         <Ionicons name="calendar-outline" size={22} color="#6B7280" />
//         <Text className="ml-3 text-gray-900 dark:text-white font-semibold">
//           {date.toDateString()}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// 📌 components/DateFilter.tsx
import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

// 👉 Props Interface
interface Props {
  label: string;
  date: Date;
  onChange: (newDate: string, dateObj: Date) => void;
  minDate?: Date; // Optional - only used when needed
}

export default function DateFilter({ label, date, onChange, minDate }: Props) {
  const openNativePicker = () => {
    // 📌 For Web – Open a simple <input type="date">
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "date";

      // Pre-fill date
      input.value = date.toISOString().split("T")[0];
      if (minDate) input.min = minDate.toISOString().split("T")[0];

      input.onchange = (e: any) => {
        const selected = new Date(e.target.value);
        onChange(e.target.value, selected);
      };

      input.click(); // Trigger
      return;
    }

    // 📌 For Android / iOS – Native Picker
    DateTimePickerAndroid.open({
      value: date,
      minimumDate: minDate, // will allow past dates when not provided
      mode: "date",
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          const iso = selectedDate.toISOString().split("T")[0];
          onChange(iso, selectedDate);
        }
      },
    });
  };

  return (
    <View className="mt-4">
      <Text className="text-gray-400 dark:text-gray-300 mb-1">{label}</Text>

      <TouchableOpacity
        onPress={openNativePicker}
        className="flex-row items-center border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-100 dark:bg-gray-800"
      >
        <Ionicons name="calendar-outline" size={22} color="#6B7280" />
        <Text className="ml-3 text-gray-900 dark:text-white font-semibold">
          {date.toDateString()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

