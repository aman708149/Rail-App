import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { DateTime } from "luxon";
import { stationService } from "@/src/service/apiservice";
import { ArrowLeft, ArrowLeftRight, ArrowRight } from "lucide-react-native";
import { CrossPlatformDatePicker } from "../../CrossPlatformDatePicker";

interface Station {
  _id: string;
  stationName: string;
  stationCode: string;
}

interface Props {
  initialFromStation: string;
  initialToStation: string;
  initialJourneyDate: string;
  minDate: string;
  onValuesChange: (from: string, to: string, date: string) => void;
  isbirdeye?: boolean;
  arrowChange?: (date: string) => void;
}

export default function StationInputRow({
  initialFromStation,
  initialToStation,
  initialJourneyDate,
  minDate,
  onValuesChange,
  isbirdeye = true,
  arrowChange,
}: Props) {
  const [fromStation, setFromStation] = useState(initialFromStation);
  const [toStation, setToStation] = useState(initialToStation);
  const [journeyDate, setJourneyDate] = useState(initialJourneyDate);

  const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Station[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [switchRotate, setSwitchRotate] = useState(false);

  const [journeyDateObj, setJourneyDateObj] = useState(
    DateTime.fromFormat(initialJourneyDate, "yyyy-MM-dd").toJSDate()
  );

  const memoMinDate = DateTime.fromFormat(minDate, "yyyy-MM-dd").toJSDate();

  useEffect(() => {
    onValuesChange(fromStation, toStation, journeyDate);
  }, [fromStation, toStation, journeyDate]);

  // ------------------------------- INPUT HANDLING ---------------------------------

  const handleInputChange = useCallback(async (type: string, value: string) => {
    if (type === "from") {
      setFromStation(value);
      if (value.length > 0) fetchSuggestions("from", value);
      else setFromSuggestions([]);
    } else {
      setToStation(value);
      if (value.length > 0) fetchSuggestions("to", value);
      else setToSuggestions([]);
    }
  }, []);

  const fetchSuggestions = async (type: "from" | "to", value: string) => {
    try {
      const list = await stationService.fetchStationSuggestions(type, value);

      if (type === "from") setFromSuggestions(list);
      else setToSuggestions(list);
    } catch (e) {
      console.log("Suggestion error:", e);
    }
  };

  const handleSelectStation = (station: Station, type: "from" | "to") => {
    const formatted = `${station.stationName} - ${station.stationCode}`;

    if (type === "from") {
      setFromStation(formatted);
      setFromSuggestions([]);
    } else {
      setToStation(formatted);
      setToSuggestions([]);
    }
  };

  // ------------------------------- SWAP STATIONS ---------------------------------

  const handleSwapStations = () => {
    setSwitchRotate(!switchRotate);
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  // ---------------------------- DATE HANDLING ------------------------------------

  const handleDateNavigation = (direction: "prev" | "next") => {
    const current = DateTime.fromFormat(journeyDate, "yyyy-MM-dd");
    const newDate =
      direction === "prev"
        ? current.minus({ days: 1 })
        : current.plus({ days: 1 });

    const minDt = DateTime.fromFormat(minDate, "yyyy-MM-dd");
    if (newDate < minDt) return;

    const newDateStr = newDate.toFormat("yyyy-MM-dd");
    setJourneyDate(newDateStr);
    setJourneyDateObj(newDate.toJSDate());
    arrowChange?.(newDateStr);
  };

  const handleDateConfirm = (date: Date) => {
    setJourneyDateObj(date);
    const formatted = DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
    setJourneyDate(formatted);
    arrowChange?.(formatted);
  };

  // ------------------------------------------------------------------------------

  return (
    <View className="w-full mt-2">

      {/* ------------------- FROM STATION INPUT ------------------- */}
      <View>
        <TextInput
          placeholder="Station From"
          value={fromStation}
          onChangeText={(t) => handleInputChange("from", t)}
          className="border p-3 rounded-lg bg-white"
        />

        {fromSuggestions.length > 0 && (
          <View className="absolute top-14 bg-white border rounded-lg w-full z-50">
            <FlatList
              data={fromSuggestions}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectStation(item, "from")}
                  className="p-3 border-b"
                >
                  <Text>{item.stationName} - {item.stationCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* ------------------- SWAP BUTTON ------------------- */}
      <View className="items-center my-2">
        <TouchableOpacity
          onPress={handleSwapStations}
          className="p-3 bg-gray-200 rounded-full"
        >
          <ArrowLeftRight
            size={20}
            color="black"
            style={{ transform: [{ rotate: switchRotate ? "180deg" : "0deg" }] }}
          />
        </TouchableOpacity>
      </View>

      {/* ------------------- TO STATION INPUT ------------------- */}
      <View>
        <TextInput
          placeholder="Station To"
          value={toStation}
          onChangeText={(t) => handleInputChange("to", t)}
          className="border p-3 rounded-lg bg-white"
        />

        {toSuggestions.length > 0 && (
          <View className="absolute top-14 bg-white border rounded-lg w-full z-50">
            <FlatList
              data={toSuggestions}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectStation(item, "to")}
                  className="p-3 border-b"
                >
                  <Text>{item.stationName} - {item.stationCode}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* ------------------- DATE PICKER ------------------- */}
      <View className="flex-row items-center mt-3">

        {/* Previous Day */}
        <TouchableOpacity
          onPress={() => handleDateNavigation("prev")}
          className="p-3 bg-gray-200 rounded-l-xl"
        >
          <ArrowLeft size={18} color="black" />
        </TouchableOpacity>

        {/* Date Display (opens picker) */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-1 p-3 border-y bg-white"
        >
          <Text className="text-center font-medium">
            {journeyDate}
          </Text>
        </TouchableOpacity>

        {/* Next Day */}
        <TouchableOpacity
          onPress={() => handleDateNavigation("next")}
          className="p-3 bg-gray-200 rounded-r-xl"
        >
          <ArrowRight size={18} color="black" />
        </TouchableOpacity>
      </View>

      <CrossPlatformDatePicker
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        journeyDateObj={journeyDateObj}
        setJourneyDateObj={setJourneyDateObj}
        setJourneyDate={setJourneyDate}
        minDate={memoMinDate}
      />
    </View>
  );
}
