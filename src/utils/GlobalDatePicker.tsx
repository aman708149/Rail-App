import React from "react";
import DatePicker from "react-native-date-picker";

export default function GlobalDatePicker({
  open,
  onCancel,
  onConfirm,
  date,
  minDate,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (date: Date) => void;
  date: Date;
  minDate?: Date;
}) {
  return (
    <DatePicker
      modal
      open={open}         // open = showDatePicker
      date={date}         // journeyDateObj
      minimumDate={minDate}
      mode="date"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
