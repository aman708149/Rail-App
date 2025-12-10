import { GetCurrentTimestamp } from "@/src/service/apiservice";
import { updateTimestamp } from "@/src/store/timestampSlice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

/**
 * Custom hook to automatically fetch and update the current timestamp
 * from the server, and keep it incrementing locally every second.
 */
export default function useAutoUpdatingTimestamp() {
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const dispatch = useDispatch();

  // Fetch the current timestamp from the backend
  const fetchServerTime = async () => {
    try {
      const response = await GetCurrentTimestamp();

      if (response?.timestamp) {
        const serverDate = new Date(response.timestamp);
        setTimestamp(serverDate);
        dispatch(updateTimestamp(serverDate.toISOString()));
      }
    } catch (error) {
      console.error("Error fetching server time:", error);
    }
  };

  // Fetch once on mount and then every 60 seconds
  useEffect(() => {
    fetchServerTime(); // Initial fetch
    const fetchInterval = setInterval(fetchServerTime, 60000);
    return () => clearInterval(fetchInterval);
  }, []);

  // Increment timestamp every 1 second locally
  useEffect(() => {
    if (!timestamp) return;

    const incrementInterval = setInterval(() => {
      setTimestamp((prev) => {
        if (!prev) return null;
        const newDate = new Date(prev.getTime() + 1000);
        dispatch(updateTimestamp(newDate.toISOString()));
        return newDate;
      });
    }, 1000);

    return () => clearInterval(incrementInterval);
  }, [timestamp]);

  return timestamp;
}
