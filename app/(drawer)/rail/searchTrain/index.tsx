import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { DateTime } from "luxon";
import { useSelector } from "react-redux";
import { PostRailQuery, getProfileData, stationService } from "@/src/service/apiservice";
import { updateRailSearchPreferences } from "@/src/service/railService/updateRailSearch";
import { handleAxiosError } from "@/src/utils/handleAxiosError";
import { isValidIndianMobile } from "@/src/utils/isValidIndianMobile";
import { RootStore } from "@/src/store";
// import "../../../global.css";
import { RailProfileTypes } from "@/src/types/railprofile";
import { Ionicons } from "@expo/vector-icons";
import { CrossPlatformDatePicker } from "@/src/components/CrossPlatformDatePicker";
import { Icon } from "@/src/components/Icon";
import DatePicker from "react-native-date-picker";
import GlobalDatePicker from "@/src/utils/GlobalDatePicker";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { SafeAreaView } from "react-native-safe-area-context";

interface Station {
  _id: string;
  stationName: string;
  stationCode: string;
}

interface TrainData {
  fromStation: string;
  toStation: string;
  journeyDate: string;
  mobileNumber: string;
  quota: string;
}

const Search = () => {
  const router = useRouter();
  const [switchRotate, setSwitchRotate] = useState(false);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");

  const { preferences } = useSelector((state: RootStore) => state.userPreferences);
  const [searchType, setSearchType] = useState(1);
  const [quota, setQuota] = useState("GN");
  const [mobileNumber, setMobileNumber] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);
  const [toSuggestions, setToSuggestions] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [lastFiveSearch, setLastFiveSearch] = useState<any[] | null>(null);
  const [lastMobileNumber, setLastMobileNumber] = useState<string[]>([]);
  const [railProfile, setRailProfile] = useState<RailProfileTypes | null>(null);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [journeyDateObj, setJourneyDateObj] = useState(new Date());
  const [journeyDate, setJourneyDate] = useState(
    DateTime.now().toFormat("yyyy-MM-dd")
  );
  const [minDate, setMinDate] = useState(new Date());

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [activeSearchType, setActiveSearchType] = useState<"from" | "to">("from");
  const [searchText, setSearchText] = useState("");


  useEffect(() => {
    if (preferences?.rail?.searchPreference !== undefined) {
      setSearchType(preferences.rail.searchPreference);
    }
  }, [preferences]);

  useEffect(() => {
    const initializeDate = () => {
      const now = new Date();
      if (!journeyDateObj) {
        const zonedDate = DateTime.fromJSDate(now)
          .setZone("Asia/Kolkata", { keepLocalTime: false })
          .toJSDate();
        setJourneyDateObj(zonedDate);
        const formattedDateString = DateTime.fromJSDate(zonedDate)
          .startOf("day")
          .toFormat("yyyy-MM-dd");
        setJourneyDate(formattedDateString);
        setMinDate(
          DateTime.fromJSDate(now)
            .setZone("Asia/Kolkata")
            .startOf("day")
            .toJSDate()
        );
      }
    };
    initializeDate();
  }, []);

  const userProfile = async () => {
    const response = await getProfileData({
      mainprofile: true,
      railprofile: true,
    });
    if (response?.data?.mainprofile?.railprofiles?.railprofile) {
      setRailProfile(response?.data?.mainprofile?.railprofiles?.railprofile);
    }
  };

  useEffect(() => {
    userProfile();
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedSearchData = await AsyncStorage.getItem("searchInitData");
      const lastFiveSearches = await AsyncStorage.getItem("lastfivesearches");
      const currentDetails = await AsyncStorage.getItem("currentDetails");

      if (lastFiveSearches) {
        setLastFiveSearch(JSON.parse(lastFiveSearches));
      }

      if (storedSearchData) {
        const searchData = JSON.parse(storedSearchData);
        if (searchData.fromStation && currentDetails === "true")
          setFromStation(searchData.fromStation);
        if (searchData.toStation && currentDetails === "true")
          setToStation(searchData.toStation);
        if (searchData.mobileNumber && currentDetails === "true")
          setMobileNumber(searchData.mobileNumber);
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    }
  };

  const fetchStationSuggestions = async (type: string, value: string) => {
    try {
      const suggestions = await stationService.fetchStationSuggestions(type, value);
      if (type === "from") {
        setFromSuggestions(suggestions);
        setShowFromSuggestions(true);
      } else if (type === "to") {
        setToSuggestions(suggestions);
        setShowToSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching station suggestions:", error);
    }
  };

  const handleInputChange = async (type: string, value: string) => {
    if (type === "from") {
      setFromStation(value);
      if (value.length > 0) fetchStationSuggestions("from", value);
      else setShowFromSuggestions(false);
    } else if (type === "to") {
      setToStation(value);
      if (value.length > 0) fetchStationSuggestions("to", value);
      else setShowToSuggestions(false);
    } else if (type === "mobileNumber") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setMobileNumber(value);
        const lastFiveSearches = await AsyncStorage.getItem("lastfivesearches");
        if (lastFiveSearches) {
          const searches = JSON.parse(lastFiveSearches);
          const mobiles = searches.map((s: any) => s.mobileNumber);
          const uniqueMobiles = Array.from(new Set(mobiles)) as string[];
          const matching = uniqueMobiles.filter((num) => num.startsWith(value));
          setLastMobileNumber(matching);
          setShowMobileSuggestions(matching.length > 0);
        }
      }
    }
  };

  const handleSelectStation = (station: Station, type: string) => {
    const stationText = `${station.stationName} - ${station.stationCode}`;
    if (type === "from") {
      setFromStation(stationText);
      setShowFromSuggestions(false);
    } else if (type === "to") {
      setToStation(stationText);
      setShowToSuggestions(false);
    }
  };

  const handleSelectMobileNumber = (number: string) => {
    setMobileNumber(number);
    setShowMobileSuggestions(false);
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
    setSwitchRotate(!switchRotate);
  };

  const handleNavigation = async () => {
    setIsLoading(true);
    try {
      if (fromStation === toStation) {
        Toast.show({
          type: "error",
          text1: "From and To stations must be different!",
        });
        setIsLoading(false);
        return;
      }

      if (mobileNumber.length > 0 && !isValidIndianMobile(mobileNumber)) {
        Toast.show({ type: "error", text1: "Please enter a valid mobile number!" });
        setIsLoading(false);
        return;
      }

      if (!fromStation || !toStation || !journeyDate) {
        Toast.show({ type: "error", text1: "Please fill all required fields!" });
        setIsLoading(false);
        return;
      }

      const dataToPass: TrainData = {
        fromStation,
        toStation,
        journeyDate,
        mobileNumber,
        quota,
      };

      await AsyncStorage.setItem("searchInitData", JSON.stringify(dataToPass));

      let lastFiveSearches = JSON.parse(
        (await AsyncStorage.getItem("lastfivesearches")) || "[]"
      );

      const isDuplicate = lastFiveSearches.some(
        (search: any) =>
          search?.fromStation === dataToPass?.fromStation &&
          search?.toStation === dataToPass?.toStation &&
          search?.journeyDate === dataToPass?.journeyDate &&
          search?.mobileNumber === dataToPass?.mobileNumber
      );

      if (!isDuplicate) {
        lastFiveSearches.unshift(dataToPass);
        if (lastFiveSearches.length > 5) {
          lastFiveSearches = lastFiveSearches.slice(0, 5);
        }
        await AsyncStorage.setItem("lastfivesearches", JSON.stringify(lastFiveSearches));
      }

      if (mobileNumber.length > 0) {
        const data = {
          mobile: mobileNumber,
          queries: {
            rail: {
              from: fromStation,
              to: toStation,
              travelDate: journeyDate,
              queryTime: new Date().toISOString(),
            },
          },
        };
        await PostRailQuery(data);
      }

      await navigateToResults();
    } catch (error) {
      handleAxiosError(error);
      setIsLoading(false);
    }
  };

  const navigateToResults = async () => {
    try {
      await updateRailSearchPreferences(searchType);
      const newBooking = await AsyncStorage.getItem("currentDetails");

      if (newBooking === "true") {
        await AsyncStorage.removeItem("currentDetails");
      } else {
        await AsyncStorage.removeItem("initialBooking");
      }

      let route = "/rail/trainavailability";
      if (searchType === 2 && railProfile?.allowedSearchTypes.includes(2)) {
        route = "/rail/trainbetweenstation";
      } else if (searchType === 3 && railProfile?.allowedSearchTypes.includes(3)) {
        route = "/rail/rail-birdeye-view";
      }

      router.push(route as any);
    } catch (error) {
      handleAxiosError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchFromHistory = async (search: TrainData) => {
    await AsyncStorage.setItem("searchInitData", JSON.stringify(search));
    await navigateToResults();
  };

  const openNativePicker = () => {
    DateTimePickerAndroid.open({
      value: journeyDateObj,
      minimumDate: minDate,
      mode: 'date',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          setJourneyDateObj(selectedDate);
          setJourneyDate(selectedDate.toISOString().split("T")[0]);
        }
      },
    });
  };


  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-2">


        {/* Back Button - Top Right */}
        <TouchableOpacity
          onPress={() => router.push("/agent")}
          className="absolute top-0 mt-2 z-10  p-3 "
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} className="text-white" />
        </TouchableOpacity>

        {/* Header Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800 dark:text-white text-center">
            Search Trains
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-1">
            Find trains, check availability & book
          </Text>
        </View>

        {/* Search Card */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-6 border border-gray-100 dark:border-gray-700">
          {/* From Station */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location-outline" size={18} color="#4F46E5" />
              <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-2 text-sm">
                FROM STATION
              </Text>
            </View>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
              {/* <TextInput
                className="flex-1 text-gray-900 dark:text-white text-base"
                value={fromStation}
                onChangeText={(text) => handleInputChange("from", text)}
                placeholder="Enter source station"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              /> */}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveSearchType("from");
                  setSearchText(fromStation);
                  setSearchModalVisible(true);
                }}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white text-base">
                  {fromStation || "Enter source station"}
                </Text>
              </TouchableOpacity>


              <Ionicons name="train-outline" size={22} color="#6B7280" />
            </View>
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <View className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-56 overflow-hidden">
                <FlatList
                  nestedScrollEnabled
                  data={fromSuggestions}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                      onPress={() => handleSelectStation(item, "from")}
                      activeOpacity={0.7}
                    >
                      <Text className="text-gray-900 dark:text-white font-medium">
                        {item.stationName}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        {item.stationCode}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Swap Button */}
          <TouchableOpacity
            onPress={handleSwapStations}
            className="bg-indigo-50 dark:bg-gray-900 w-12 h-12 rounded-full self-center my-2 items-center justify-center border border-indigo-100 dark:border-gray-700 shadow-sm active:scale-95 transition-transform duration-150"
            activeOpacity={0.8}
          >
            <Ionicons
              name="swap-vertical"
              size={24}
              color="#4F46E5"
              className={`transition-transform duration-300 ${switchRotate ? "rotate-180" : ""}`}
            />
          </TouchableOpacity>

          {/* To Station */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="location" size={18} color="#10B981" />
              <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-2 text-sm">
                TO STATION
              </Text>
            </View>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
              {/* <TextInput
                className="flex-1 text-gray-900 dark:text-white text-base"
                value={toStation}
                onChangeText={(text) => handleInputChange("to", text)}
                placeholder="Enter destination station"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
              /> */}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveSearchType("to");
                  setSearchText(toStation);
                  setSearchModalVisible(true);
                }}
                className="flex-1"
              >
                <Text className="text-gray-900 dark:text-white text-base">
                  {toStation || "Enter destination station"}
                </Text>
              </TouchableOpacity>


              <Ionicons name="flag-outline" size={22} color="#6B7280" />
            </View>
            {showToSuggestions && toSuggestions.length > 0 && (
              <View className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-56 overflow-hidden">
                <FlatList
                  nestedScrollEnabled
                  data={toSuggestions}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                      onPress={() => handleSelectStation(item, "to")}
                      activeOpacity={0.7}
                    >
                      <Text className="text-gray-900 dark:text-white font-medium">
                        {item.stationName}
                      </Text>
                      <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        {item.stationCode}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Journey Date */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar-outline" size={18} color="#F59E0B" />
              <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-2 text-sm">
                JOURNEY DATE
              </Text>
            </View>
            <TouchableOpacity
              onPress={openNativePicker}
              className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 active:bg-gray-100 dark:active:bg-gray-700"
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={22} color="#F59E0B" />
              <Text className="ml-3 text-gray-900 dark:text-white font-medium text-base flex-1">
                {journeyDateObj.toDateString()}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Mobile Number */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="phone-portrait-outline" size={18} color="#8B5CF6" />
              <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-2 text-sm">
                MOBILE NUMBER (OPTIONAL)
              </Text>
            </View>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
              <TextInput
                className="flex-1 text-gray-900 dark:text-white text-base"
                value={mobileNumber}
                onChangeText={(text) => handleInputChange("mobileNumber", text)}
                placeholder="Enter 10-digit mobile"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
              />
              <Ionicons name="call-outline" size={22} color="#6B7280" />
            </View>
            {showMobileSuggestions && lastMobileNumber.length > 0 && (
              <View className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg">
                <FlatList
                  nestedScrollEnabled
                  data={lastMobileNumber}
                  keyExtractor={(item, index) => index.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
                      onPress={() => handleSelectMobileNumber(item)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-gray-900 dark:text-white font-medium">
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Search Type and Quota */}
          {railProfile && railProfile?.allowedSearchTypes?.length > 1 && (
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="options-outline" size={18} color="#EF4444" />
                <Text className="text-gray-700 dark:text-gray-300 font-semibold ml-2 text-sm">
                  SEARCH TYPE
                </Text>
              </View>
              <View className="flex-row bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                {railProfile.allowedSearchTypes.includes(1) && (
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg mx-1 ${searchType === 1 ? "bg-indigo-500 shadow" : ""}`}
                    onPress={() => setSearchType(1)}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-center font-medium ${searchType === 1 ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      Compact
                    </Text>
                  </TouchableOpacity>
                )}
                {railProfile.allowedSearchTypes.includes(2) && (
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg mx-1 ${searchType === 2 ? "bg-indigo-500 shadow" : ""}`}
                    onPress={() => setSearchType(2)}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-center font-medium ${searchType === 2 ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      Expanded
                    </Text>
                  </TouchableOpacity>
                )}
                {railProfile.allowedSearchTypes.includes(3) && (
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg mx-1 ${searchType === 3 ? "bg-indigo-500 shadow" : ""}`}
                    onPress={() => setSearchType(3)}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-center font-medium ${searchType === 3 ? "text-white" : "text-gray-700 dark:text-gray-300"
                        }`}
                    >
                      Bird's Eye
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Search Button */}
          <TouchableOpacity
            className={`bg-indigo-600 py-4 rounded-xl items-center justify-center shadow-lg mt-2 ${isLoading ? "opacity-70" : "active:opacity-90"
              }`}
            onPress={handleNavigation}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white font-semibold text-lg ml-3">
                  Searching...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="search" size={22} color="#fff" />
                <Text className="text-white font-semibold text-lg ml-3">
                  Search Trains
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Searches Section */}
        {lastFiveSearch && lastFiveSearch.length > 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#4F46E5" />
                <Text className="text-gray-800 dark:text-white font-bold text-lg ml-2">
                  Recent Searches
                </Text>
              </View>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">
                {lastFiveSearch.length} searches
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pb-4"
            >
              <View className="min-w-full">
                {/* Table Header */}
                <View className="flex-row bg-indigo-50 dark:bg-gray-900 rounded-lg px-4 py-3 mb-2">
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold w-12 text-center">#</Text>
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold w-32">From</Text>
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold w-32">To</Text>
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold w-28">Date</Text>
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold w-32">Mobile</Text>
                  <Text className="text-gray-700 dark:text-gray-300 font-semibold w-24 text-center">Action</Text>
                </View>

                {/* Table Rows */}
                {lastFiveSearch.map((search, index) => (
                  <View
                    key={index}
                    className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700"
                  >
                    <Text className="text-gray-600 dark:text-gray-400 w-12 text-center font-medium">
                      {index + 1}
                    </Text>
                    <Text className="text-gray-800 dark:text-white font-medium w-32">
                      {search.fromStation}
                    </Text>
                    <Text className="text-gray-800 dark:text-white font-medium w-32">
                      {search.toStation}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 font-medium w-28">
                      {search.journeyDate}
                    </Text>
                    <Text className="text-gray-600 dark:text-gray-400 font-medium w-32">
                      {search.mobileNumber || '—'}
                    </Text>
                    <TouchableOpacity
                      className="bg-emerald-500 px-4 py-2 rounded-lg w-24 active:bg-emerald-600"
                      onPress={() => handleSearchFromHistory(search)}
                      activeOpacity={0.8}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="search" size={16} color="#fff" />
                        <Text className="text-white font-semibold ml-2">Search</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center border border-gray-100 dark:border-gray-700 shadow">
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 font-medium mt-4">
              No recent searches
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Your search history will appear here
            </Text>
          </View>
        )}
      </View>

      <Toast />
      <Modal
        animationType="slide"
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">

          {/* Header with Search Input */}
          <View className="flex-row items-center px-4 py-3 border-b border-gray-300 dark:border-gray-700">
            <TouchableOpacity
              onPress={() => setSearchModalVisible(false)}
              className="mr-3 p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <TextInput
              autoFocus
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (activeSearchType === "from") handleInputChange("from", text);
                else if (activeSearchType === "to") handleInputChange("to", text);
              }}
              placeholder="Search station or city"
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-gray-200 dark:bg-gray-800 text-white px-4 py-2 rounded-full"
            />
          </View>

          {/* Station List */}
          <FlatList
            nestedScrollEnabled
            data={
              activeSearchType === "from"
                ? fromSuggestions
                : toSuggestions
            }
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-5 py-4 border-b border-gray-300 dark:border-gray-700"
                onPress={() => {
                  if (activeSearchType) {
                    handleSelectStation(item, activeSearchType);
                    setSearchModalVisible(false);
                  }
                  setSearchModalVisible(false);
                }}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-800 items-center justify-center mr-3">
                    <Ionicons name="location-outline" size={20} color="#6B7280" />
                  </View>
                  <View>
                    <Text className="text-white font-semibold text-base">
                      {item.stationCode} - {item.stationName}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center py-20">
                <Ionicons name="search-outline" size={40} color="#6B7280" />
                <Text className="text-gray-400 mt-4">No stations found</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

    </ScrollView>
  );
};

export default Search;