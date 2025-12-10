// src/utils/Number.tsx

import React, { JSX } from "react";
import { Text } from "react-native";

/**
 * ✅ Converts number to South Asian format (plain string version)
 * Example: 1234567.89 → "12,34,567.89"
 */
export function formatNumberToSouthAsian(n: number = 0): string {
  const numParts = n?.toString()?.split(".");
  const intPart = numParts[0];
  let decimalPart = numParts.length > 1 ? numParts[1] : "00";

  // Ensure two decimal places
  decimalPart =
    decimalPart.length < 2 ? decimalPart + "0" : decimalPart.slice(0, 2);

  if (intPart.length <= 3) {
    return intPart + "." + decimalPart;
  } else if (intPart.length <= 5) {
    return (
      intPart.substring(0, intPart.length - 3) +
      "," +
      intPart.substring(intPart.length - 3) +
      "." +
      decimalPart
    );
  } else {
    const lastThreeDigits = intPart.substring(intPart.length - 3);
    const restOfTheDigits = intPart.substring(0, intPart.length - 3);
    const formattedRest = restOfTheDigits.replace(
      /\B(?=(\d{2})+(?!\d))/g,
      ","
    );
    return formattedRest + "," + lastThreeDigits + "." + decimalPart;
  }
}

/**
 * ✅ JSX Version (for UI)
 * Renders formatted number with decimal part colored (like `text-warning`).
 */
export const formatToSouthAsian = (n: number = 0): JSX.Element => {
  const numParts = n?.toString().split(".");
  const intPart = numParts[0];
  let decimalPart = numParts.length > 1 ? numParts[1] : "00";

  // Ensure 2 decimal digits
  decimalPart =
    decimalPart.length < 2 ? decimalPart + "0" : decimalPart.slice(0, 2);

  let formattedIntPart = "";

  if (intPart.length <= 3) {
    formattedIntPart = intPart;
  } else if (intPart.length <= 5) {
    formattedIntPart =
      intPart.substring(0, intPart.length - 3) +
      "," +
      intPart.substring(intPart.length - 3);
  } else {
    const lastThreeDigits = intPart.substring(intPart.length - 3);
    const restOfTheDigits = intPart.substring(0, intPart.length - 3);
    const formattedRest = restOfTheDigits.replace(
      /\B(?=(\d{2})+(?!\d))/g,
      ","
    );
    formattedIntPart = formattedRest + "," + lastThreeDigits;
  }

  return (
    <Text>
      {formattedIntPart}
      <Text className="text-yellow-500">.{decimalPart}</Text>
    </Text>
  );
};
