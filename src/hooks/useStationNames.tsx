// 📌 src/hooks/useStationNames.ts

import { useState } from "react";
import { Alert } from "react-native";     // 👈 instead of toast
import { GetStationNameByCode } from "../service/apiservice"; // same API
import { showMessage } from "../utils/showMessage";

const useStationNames = () => {
  const [loading, setLoading] = useState(false);
  const [stationNames, setStationNames] = useState<{
    fromStation: string;
    toStation: string;
  } | null>(null);

  const fetchStationNames = async (fromCode: string, toCode: string) => {
    setLoading(true);
    try {
      const [fromResponse, toResponse] = await Promise.all([
        GetStationNameByCode(fromCode),
        GetStationNameByCode(toCode),
      ]);

      if (
        (fromResponse.status === 200 || fromResponse.status === 201) &&
        (toResponse.status === 200 || toResponse.status === 201)
      ) {
        setStationNames({
          fromStation: fromResponse.data || "Unknown",
          toStation: toResponse.data || "Unknown",
        });
      } else {
        throw new Error("Failed to fetch station names");
      }
    } catch (error: any) {
     showMessage(
        "Error",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return { stationNames, loading, fetchStationNames };
};

export default useStationNames;
