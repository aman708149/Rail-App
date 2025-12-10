// import React, { useEffect, useState } from "react";
// import { View, Text, TouchableOpacity } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Toast from "react-native-toast-message";
// import { useDispatch, useSelector } from "react-redux";
// import { DateTime } from "luxon";


// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { AppDispatch, RootStore } from "@/src/store";
// import useAutoUpdatingTimestamp from "@/src/hooks/useAutoUpdatingTimestamp";
// import { fetchTrainsBetweenStations } from "@/src/store/rail/trainBetweenStation/trainSlice";
// import StationInputRow from "./searchinput";
// import SearchTypeChange from "./SearchTypeChange";


// export default function SearchCard() {
//   const dispatch = useDispatch<AppDispatch>();

//   const [fromStation, setFromStation] = useState("");
//   const [toStation, setToStation] = useState("");
//   const [date, setDate] = useState("");
//   const [minDate, setMinDate] = useState("");

//   const timestamp = useAutoUpdatingTimestamp();
//   const { trainBtwnStnsList } = useSelector(
//     (state: RootStore) => state.trainBetweenStation
//   );

//   // ------------------------ SEARCH BUTTON HANDLER ------------------------
//   const handleSearch = async () => {
//     if (!fromStation || !toStation || !date) {
//       Toast.show({ type: "error", text1: "Please fill in all fields." });
//       return;
//     }

//     const formattedDate = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat(
//       "yyyyMMdd"
//     );

//     await AsyncStorage.setItem(
//       "searchInitData",
//       JSON.stringify({
//         fromStation,
//         toStation,
//         journeyDate: date,
//       })
//     );

//     dispatch(
//       fetchTrainsBetweenStations({
//         fromStation,
//         toStation,
//         date: formattedDate,
//         source: "cache",
//       })
//     );
//   };

//   // ------------------ LOAD SAVED SEARCH ON INITIAL MOUNT ------------------
//   useEffect(() => {
//     (async () => {
//       const searchData = await AsyncStorage.getItem("searchInitData");
//       if (searchData) {
//         const { fromStation, toStation, journeyDate } = JSON.parse(searchData);

//         if (fromStation && toStation && journeyDate) {
//           setFromStation(fromStation);
//           setToStation(toStation);
//           setDate(journeyDate);

//           if (trainBtwnStnsList.length === 0) {
//             dispatch(
//               fetchTrainsBetweenStations({
//                 fromStation,
//                 toStation,
//                 date: DateTime.fromFormat(journeyDate, "yyyy-MM-dd").toFormat(
//                   "yyyyMMdd"
//                 ),
//                 source: "cache",
//               })
//             );
//           }
//         }
//       }
//     })();
//   }, []);

//   // ------------------ AUTO SET TODAY DATE IF EMPTY ------------------
//   useEffect(() => {
//     if (timestamp && !date) {
//       const zonedDate = DateTime.fromJSDate(timestamp)
//         .setZone("Asia/Kolkata")
//         .toFormat("yyyy-MM-dd");
//       setDate(zonedDate);
//     }
//   }, [timestamp]);

//   // ------------------ MIN DATE LOGIC ------------------
//   useEffect(() => {
//     if (timestamp && !minDate) {
//       const now = DateTime.fromJSDate(timestamp)
//         .setZone("Asia/Kolkata")
//         .startOf("day")
//         .toFormat("yyyy-MM-dd");
//       setMinDate(now);
//     }
//   }, [timestamp]);

//   // ------------------ CHANGE DATE WITH ARROWS ------------------
//   const arrowChange = async (newDateString: string) => {
//     const newDate = DateTime.fromFormat(newDateString, "yyyy-MM-dd");

//     setDate(newDateString);

//     await AsyncStorage.setItem(
//       "searchInitData",
//       JSON.stringify({
//         fromStation,
//         toStation,
//         journeyDate: newDateString,
//       })
//     );

//     dispatch(
//       fetchTrainsBetweenStations({
//         fromStation,
//         toStation,
//         date: newDate.toFormat("yyyyMMdd"),
//         source: "cache",
//       })
//     );
//   };

//   // ------------------ LIVE REFRESH ------------------
//   const refreshDataLive = () => {
//     if (!fromStation || !toStation || !date) {
//       Toast.show({ type: "error", text1: "Please fill in all fields." });
//       return;
//     }

//     dispatch(
//       fetchTrainsBetweenStations({
//         fromStation,
//         toStation,
//         date: DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("yyyyMMdd"),
//         source: "live",
//       })
//     );
//   };

//   return (
//     <View className="w-full p-3 bg-white dark:bg-gray-900 rounded-lg shadow">

//       {/* ---------------------- INPUT ROW ---------------------- */}
//       <StationInputRow
//         initialFromStation={fromStation}
//         initialToStation={toStation}
//         initialJourneyDate={date}
//         minDate={minDate}
//         isbirdeye={false}
//         onValuesChange={(from, to, journeyDate) => {
//           setFromStation(from);
//           setToStation(to);
//           setDate(journeyDate);
//         }}
//         arrowChange={arrowChange}
//       />

//       {/* ---------------------- SEARCH TYPE DROPDOWN ---------------------- */}
//       <View className="w-full mt-3">
//         <SearchTypeChange
//           fromStation={fromStation}
//           toStation={toStation}
//           journeydate={date}
//         />
//       </View>

//       {/* ---------------------- SEARCH BUTTON ---------------------- */}
//       <View className="flex-row justify-between mt-4">

//         <TouchableOpacity
//           onPress={handleSearch}
//           className="flex-row items-center bg-green-600 px-4 py-3 rounded-lg"
//         >
//           <Text className="text-white font-semibold mr-2">Search</Text>
//           <MaterialCommunityIcons name="magnify" size={20} color="white" />
//         </TouchableOpacity>

//         {/* ---------------------- LIVE REFRESH BUTTON ---------------------- */}
//         <TouchableOpacity
//           onPress={refreshDataLive}
//           className="flex-row items-center bg-blue-600 px-4 py-3 rounded-lg"
//         >
//           <MaterialCommunityIcons name="refresh" size={22} color="white" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }


import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { DateTime } from "luxon";
import { AppDispatch, RootStore } from "@/src/store";
import useAutoUpdatingTimestamp from "@/src/hooks/useAutoUpdatingTimestamp";
import { fetchTrainsBetweenStations } from "@/src/store/rail/trainBetweenStation/trainSlice";
import { router } from "expo-router";
import { ModifySearchModal } from "../trainavailability/ModifySearchModal";
import { stationService } from "@/src/service/apiservice";

interface Station {
    _id: string;
    stationName: string;
    stationCode: string;
}




export default function SearchCard() {
    // ------------------------- STATE -------------------------
    const dispatch = useDispatch<AppDispatch>();

    const [fromStation, setFromStation] = useState("");
    const [toStation, setToStation] = useState("");

    const [tempFrom, setTempFrom] = useState("");
    const [tempTo, setTempTo] = useState("");

    const [date, setDate] = useState("");
    const [minDate, setMinDate] = useState("");

    const timestamp = useAutoUpdatingTimestamp();

    const { trainBtwnStnsList } = useSelector(
        (state: RootStore) => state.trainBetweenStation
    );

    const [modalVisible, setModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
    const [toSuggestions, setToSuggestions] = useState<Station[]>([]);



    // Convert to Date object for modal
    const journeyDateObj = date ? DateTime.fromFormat(date, "yyyy-MM-dd").toJSDate() : new Date();
    const setJourneyDateObj = (d: Date) =>
        setDate(DateTime.fromJSDate(d).toFormat("yyyy-MM-dd"));

    const formatDatePretty = (d: string) =>
        DateTime.fromFormat(d, "yyyy-MM-dd").toFormat("d LLL yyyy");

    // ------------------------- SEARCH HANDLER -------------------------
  

    // const handleSearch = async () => {
    //     if (!fromStation || !toStation || !date) {
    //         Toast.show({ type: "error", text1: "Please fill in all fields" });
    //         return;
    //     }

    //     const formattedDate = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("yyyyMMdd");

    //     await AsyncStorage.setItem(
    //         "searchInitData",
    //         JSON.stringify({ fromStation, toStation, journeyDate: date })
    //     );

    //     dispatch(
    //         fetchTrainsBetweenStations({
    //             fromStation,
    //             toStation,
    //             date: formattedDate,
    //             source: "cache",
    //         })
    //     )
    //         .unwrap()                // 👈 waits for success/failure
    //         .then(() => {
    //             setModalVisible(false);     // 👈 CLOSE MODAL on SUCCESS
    //         })
    //         .catch(() => {
    //             Toast.show({ type: "error", text1: "Unable to fetch trains" });
    //         });
    // };

    const handleSearch = async () => {
        const fromStationFinal = tempFrom || fromStation;
        const toStationFinal = tempTo || toStation;

        if (!fromStationFinal || !toStationFinal || !date) {
            Toast.show({ type: "error", text1: "Please fill all fields" });
            return;
        }

        setFromStation(fromStationFinal);
        setToStation(toStationFinal);

        const formattedDate = DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("yyyyMMdd");

        await AsyncStorage.setItem(
            "searchInitData",
            JSON.stringify({
                fromStation: fromStationFinal,
                toStation: toStationFinal,
                journeyDate: date,
            })
        );

        dispatch(
            fetchTrainsBetweenStations({
                fromStation: fromStationFinal,
                toStation: toStationFinal,
                date: formattedDate,
                source: "cache",
            })
        );

        setModalVisible(false);
    };



    const fetchSuggestions = async (type: "from" | "to", value: string) => {
        try {
            const list = await stationService.fetchStationSuggestions(type, value);

            if (type === "from") setFromSuggestions(list);
            else setToSuggestions(list);
        } catch (e) {
            console.log("Suggestion error:", e);
        }
    };


    // -------------------- LOAD SAVED SEARCH --------------------
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem("searchInitData");
            if (saved) {
                const { fromStation, toStation, journeyDate } = JSON.parse(saved);

                setFromStation(fromStation);
                setToStation(toStation);
                setDate(journeyDate);

                if (trainBtwnStnsList.length === 0) {
                    dispatch(
                        fetchTrainsBetweenStations({
                            fromStation,
                            toStation,
                            date: DateTime.fromFormat(journeyDate, "yyyy-MM-dd").toFormat(
                                "yyyyMMdd"
                            ),
                            source: "cache",
                        })
                    );
                }
            }
        })();
    }, []);

    // -------------------- SET DEFAULT DATE --------------------
    useEffect(() => {
        if (timestamp && !date) {
            const today = DateTime.fromJSDate(timestamp)
                .setZone("Asia/Kolkata")
                .toFormat("yyyy-MM-dd");
            setDate(today);
        }
    }, [timestamp]);

    // -------------------- SET MIN DATE --------------------
    useEffect(() => {
        if (timestamp && !minDate) {
            const today = DateTime.fromJSDate(timestamp)
                .setZone("Asia/Kolkata")
                .startOf("day")
                .toFormat("yyyy-MM-dd");
            setMinDate(today);
        }
    }, [timestamp]);

    // -------------------- LIVE REFRESH --------------------
    const refreshDataLive = () => {
        if (!fromStation || !toStation || !date) {
            Toast.show({ type: "error", text1: "Please fill in all fields" });
            return;
        }

        dispatch(
            fetchTrainsBetweenStations({
                fromStation,
                toStation,
                date: DateTime.fromFormat(date, "yyyy-MM-dd").toFormat("yyyyMMdd"),
                source: "live",
            })
        );
    };

    const handleSelectStation = (type: "from" | "to", station: Station) => {
        const formatted = `${station.stationName} - ${station.stationCode}`;
        if (type === "from") {
            setFromStation(formatted);
            setFromSuggestions([]);
        } else {
            setToStation(formatted);
            setToSuggestions([]);
        }
    };

    // Swap stations
    const handleSwap = () => {
        const t = tempFrom;
        setTempFrom(tempTo);
        setTempTo(t);
    };


    // -------------------- UI LAYOUT (MATCHES YOUR SCREENSHOT) --------------------
    return (
        <View className="w-full bg-[#0F172A] p-2 rounded-xl flex-row justify-between items-center">

            {/* BACK BUTTON */}
            <TouchableOpacity className="mr-4 mb-16" onPress={() => router.push("/rail/searchTrain")}>
                <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            {/* STATION DISPLAY */}
            <View className="items-center">
                <Text className="text-blue-400 font-semibold text-lg">
                    {fromStation?.split("-")[1]?.trim()}
                </Text>

                <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />

                <Text className="text-red-400 font-semibold text-lg">
                    {toStation?.split("-")[1]?.trim()}
                </Text>
            </View>

            {/* DATE */}
            <View className="flex-1 items-center">
                <Text className="text-yellow-400 font-medium">{formatDatePretty(date)}</Text>
            </View>

            {/* RIGHT BUTTONS */}
            <View className="flex-col">
                {/* PENCIL */}
                <TouchableOpacity
                    className="bg-green-500 p-2 rounded-lg mb-2"
                    onPress={() => {
                        setTempFrom(fromStation);
                        setTempTo(toStation);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="pencil" size={18} color="white" />
                </TouchableOpacity>

                {/* SEARCH BUTTON */}
                <TouchableOpacity
                    className="bg-blue-500 p-2 rounded-lg"
                    onPress={refreshDataLive}
                >
                    <Ionicons name="search" size={18} color="white" />
                </TouchableOpacity>
            </View>

            {/* ------------------------- MODIFY MODAL ------------------------- */}
            <ModifySearchModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                fromStation={tempFrom}
                setFromStation={setTempFrom}
                toStation={tempTo}
                setToStation={setTempTo}
                fetchSuggestions={fetchSuggestions}
                handleSelectStation={handleSelectStation}
                handleSwap={handleSwap}
                fromSuggestions={fromSuggestions}
                toSuggestions={toSuggestions}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                journeyDateObj={journeyDateObj}
                setJourneyDateObj={setJourneyDateObj}
                setJourneyDate={setDate}
                minDate={new Date(minDate)}
                isLoading={false}
                handleNavigation={handleSearch}
            />
        </View>
    );
}
