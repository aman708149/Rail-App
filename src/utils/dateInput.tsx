// import React, { useState } from "react";
// import { View, Text, Pressable, useColorScheme } from "react-native";
// import DatePicker from "react-native-date-picker";

// interface DateInputProps {
//     date: Date;
//     setDate: (d: Date) => void;
//     minDate: Date;
// }

// const DateInput = ({ date, setDate, minDate }: DateInputProps) => {
//     const [open, setOpen] = useState(false);
//     const isDark = useColorScheme() === "dark";

//     return (
//         <View>
//             <Pressable
//                 onPress={() => setOpen(true)}
//                 className={`p-4 rounded-xl border ${
//                     isDark ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"
//                 }`}
//             >
//                 <Text
//                     className={`${date ? (isDark ? "text-white" : "text-black") : "text-gray-400"}`}
//                 >
//                     {date ? date.toDateString() : "Select Journey Date"}
//                 </Text>
//             </Pressable>

//             <DatePicker
//                 modal
//                 open={open}
//                 date={date}
//                 minimumDate={minDate}
//                 mode="date"
//                 onConfirm={(selectedDate: Date) => {
//                     setOpen(false);
//                     setDate(selectedDate);
//                 }}
//                 onCancel={() => setOpen(false)}
//                 theme={isDark ? "dark" : "light"}
//             />
//         </View>
//     );
// };

// export default DateInput;

// src/utils/DateInput.tsx
import React, { useState } from "react";
import { View, Text, Pressable, Platform, useColorScheme } from "react-native";
import DatePicker from "react-native-date-picker";

interface Props {
  date: string | Date;
  setDate: (d: string) => void;
  minDate?: string | Date;
  maxDate?: string | Date;
}

export default function DateInput({ date, setDate, minDate, maxDate }: Props) {
  const [open, setOpen] = useState(false);
  const isDark = useColorScheme() === "dark";

  // helper → check valid date
  const toValidDate = (val?: string | Date) => {
    if (!val) return undefined;
    const d = typeof val === "string" ? new Date(val) : val;
    return isNaN(d.getTime()) ? undefined : d; // ❗ invalid date check
  };

  const currentDate = toValidDate(date) || new Date();   // fallback
  const min = toValidDate(minDate);
  const max = toValidDate(maxDate);

  // 🖥️ WEB INPUT
  if (Platform.OS === "web") {
    return (
      <input
        type="date"
        min={min ? min.toISOString().split("T")[0] : undefined}
        max={max ? max.toISOString().split("T")[0] : undefined}
        value={currentDate.toISOString().split("T")[0]}
        onChange={(e) => setDate(e.target.value)}
        style={{
          padding: 4,
          width: "100%",
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: isDark ? "#4B5563" : "#D1D5DB",
          background: isDark ? "#1F2937" : "#FFFFFF",
          color: isDark ? "#FFFFFF" : "#000000",
          fontSize: 16,
        }}
      />
    );
  }

  // 📱 MOBILE PICKER
  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className="p-4 rounded-xl border"
        style={{
          borderColor: isDark ? "#4B5563" : "#D1D5DB",
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        }}
      >
        <Text style={{ color: isDark ? "white" : "black" }}>
          {currentDate.toDateString()}
        </Text>
      </Pressable>

      <DatePicker
        modal
        open={open}
        date={currentDate}
        minimumDate={min}
        maximumDate={max}
        mode="date"
        onConfirm={(d) => {
          setOpen(false);
          setDate(d.toISOString().split("T")[0]); // string only
        }}
        onCancel={() => setOpen(false)}
        theme={isDark ? "dark" : "light"}
      />
    </View>
  );
}





