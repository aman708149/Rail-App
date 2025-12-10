// ModifySearchModal.tsx
import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Pressable,
    Animated,
    Dimensions,
    StatusBar,
    Platform,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CrossPlatformDatePicker } from "@/src/components/CrossPlatformDatePicker";
import DateInput from "@/src/utils/dateInput";
import DatePicker from "react-native-date-picker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
(View as any).SafeAreaView = SafeAreaView;


const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface Station {
    _id: string;
    stationName: string;
    stationCode: string;
    location?: string;
}

interface ModifySearchModalProps {
    modalVisible: boolean;
    setModalVisible: (v: boolean) => void;
    fromStation: string;
    setFromStation: (v: string) => void;
    toStation: string;
    setToStation: (v: string) => void;
    fromSuggestions: Station[];
    toSuggestions: Station[];
    fetchSuggestions: (type: "from" | "to", text: string) => void;
    handleSelectStation: (type: "from" | "to", item: Station) => void;
    handleSwap: () => void;
    showDatePicker: boolean;
    setShowDatePicker: (v: boolean) => void;
    journeyDateObj: Date;
    setJourneyDateObj: (d: Date) => void;
    setJourneyDate: (v: string) => void;
    minDate: Date;
    isLoading: boolean;
    handleNavigation: () => void;
    recentSearches?: Station[];
    popularStations?: Station[];
}

export const ModifySearchModal = ({
    modalVisible,
    setModalVisible,
    fromStation,
    setFromStation,
    toStation,
    setToStation,
    fromSuggestions,
    toSuggestions,
    fetchSuggestions,
    handleSelectStation,
    handleSwap,
    showDatePicker,
    setShowDatePicker,
    journeyDateObj,
    setJourneyDateObj,
    setJourneyDate,
    minDate,
    isLoading,
    handleNavigation,
    recentSearches = [],
    popularStations = [],
}: ModifySearchModalProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    const [showSearchScreen, setShowSearchScreen] = useState(false);
    const [activeInputType, setActiveInputType] = useState<"from" | "to" | null>(null);
    const [searchText, setSearchText] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);  // ensures picker loads only after mount
    }, []);

    // Animation refs
    const slideAnim = useRef(new Animated.Value(-SCREEN_HEIGHT)).current;
    const searchSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    // Animate main modal from TOP
    useEffect(() => {
        if (modalVisible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 65,
                    friction: 11,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [modalVisible]);

    // Animate search screen
    useEffect(() => {
        if (showSearchScreen) {
            Animated.spring(searchSlideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        } else {
            Animated.timing(searchSlideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [showSearchScreen]);

    const handleClose = () => {
        setShowSearchScreen(false);
        setModalVisible(false);
        setActiveInputType(null);
        setSearchText("");
    };

    const handleInputPress = (type: "from" | "to") => {
        setActiveInputType(type);
        setSearchText(type === "from" ? fromStation : toStation);
        setShowSearchScreen(true);
    };

    const handleStationSelect = (item: Station) => {
        if (activeInputType) {
            handleSelectStation(activeInputType, item);
            setSearchText("");
            setShowSearchScreen(false);
            setActiveInputType(null);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchText(text);
        if (activeInputType) {
            fetchSuggestions(activeInputType, text);
        }
    };

    const closeSearchScreen = () => {
        setShowSearchScreen(false);
        setActiveInputType(null);
        setSearchText("");
    };

    const activeSuggestions =
        activeInputType === "from" ? fromSuggestions : toSuggestions;

    const showRecents = searchText.length === 0 && recentSearches.length > 0;
    const showPopular = searchText.length === 0 && popularStations.length > 0;

    // Theme colors
    const theme = {
        bg: isDark ? "#1F2937" : "#FFFFFF",
        cardBg: isDark ? "#374151" : "#F9FAFB",
        text: isDark ? "#F9FAFB" : "#1F2937",
        textSecondary: isDark ? "#D1D5DB" : "#6B7280",
        border: isDark ? "#4B5563" : "#E5E7EB",
        inputBg: isDark ? "#374151" : "#F3F4F6",
        iconColor: isDark ? "#9CA3AF" : "#6B7280",
    };

    useEffect(() => setIsMounted(true), []);

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
        <>
            {/* Main Modal - Slides from TOP */}
            <Modal
                animationType="none"
                transparent
                visible={modalVisible}
                onRequestClose={handleClose}
                statusBarTranslucent
            >
                <StatusBar
                    backgroundColor="rgba(0,0,0,0.7)"
                    barStyle={isDark ? "light-content" : "dark-content"}
                />

                <View style={{ flex: 1 }}>
                    {/* Backdrop */}
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            opacity: backdropOpacity,
                        }}
                    >
                        <Pressable style={{ flex: 1 }} onPress={handleClose} />
                    </Animated.View>

                    {/* Main Modal Content - FROM TOP */}
                    <Animated.View
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            transform: [{ translateY: slideAnim }],
                            paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
                        }}
                    >
                        <SafeAreaView>
                            <View
                                style={{ backgroundColor: theme.bg }}
                                className=" overflow-hidden shadow-2xl"
                            >
                                {/* Header */}
                                <View
                                    style={{ borderBottomColor: theme.border }}
                                    className="px-5 py-4 border-b"
                                >
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-row items-center">
                                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                                            <Text
                                                style={{ color: theme.text }}
                                                className="text-xl font-bold ml-2"
                                            >
                                                Modify Search
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={handleClose}
                                            className="p-2"
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="close" size={24} color={theme.iconColor} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Form Content */}
                                <View className="px-5 py-6">
                                    {/* From Station */}
                                    <TouchableOpacity
                                        onPress={() => handleInputPress("from")}
                                        style={{ borderBottomColor: theme.border }}
                                        className="flex-row items-center py-4 border-b"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="train-outline" size={24} color={theme.iconColor} />
                                        <View className="flex-1 ml-3">
                                            <Text
                                                style={{ color: fromStation ? theme.text : theme.textSecondary }}
                                                className="font-semibold text-base"
                                            >
                                                {fromStation}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
                                    </TouchableOpacity>

                                    {/* Swap Button */}
                                    <View className="items-end -mt-4 -mb-2 z-10">
                                        <TouchableOpacity
                                            onPress={handleSwap}
                                            style={{
                                                backgroundColor: theme.bg,
                                                borderColor: theme.border,
                                            }}
                                            className="border-2 p-2 rounded-full shadow-sm"
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="swap-vertical" size={20} color={theme.iconColor} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* To Station */}
                                    <TouchableOpacity
                                        onPress={() => handleInputPress("to")}
                                        style={{ borderBottomColor: theme.border }}
                                        className="flex-row items-center py-4 border-b"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="train-outline" size={24} color={theme.iconColor} />
                                        <View className="flex-1 ml-3">
                                            <Text
                                                style={{ color: toStation ? theme.text : theme.textSecondary }}
                                                className="font-semibold text-base"
                                            >
                                                {toStation}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={theme.iconColor} />
                                    </TouchableOpacity>

                                    {/* Date Picker */}
                                    {/* <View className="mt-4">

                                        <DateInput
                                            date={journeyDateObj}         // must be Date
                                            setDate={(d) => {
                                                setJourneyDateObj(d);
                                                setJourneyDate(d.toISOString().split("T")[0]);
                                            }}
                                            minDate={minDate}             // must be Date
                                        />

                                    </View> */}

                                    <View className="mt-4">
                                        {/* Touchable to toggle calendar visibility */}
                                        <TouchableOpacity
                                            onPress={openNativePicker}
                                            className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg p-3"
                                        >
                                            <Ionicons name="calendar-outline" size={22} color="#6B7280" />
                                            <Text className="ml-3 text-gray-900 dark:text-white font-semibold">
                                                {journeyDateObj.toDateString()}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Search Button */}
                                    <Pressable
                                        className={`bg-green-600 py-3 rounded-xl mt-4 ${isLoading ? "opacity-60" : ""
                                            }`}
                                        onPress={handleNavigation}
                                        disabled={isLoading}
                                        android_ripple={{ color: "#059669" }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text className="text-white font-bold text-center text-base">
                                                SEARCH TRAINS
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Animated.View>
                </View>
            </Modal>

            {/* Full Page Search Screen */}
            <Modal
                animationType="none"
                transparent={false}
                visible={showSearchScreen}
                onRequestClose={closeSearchScreen}
                statusBarTranslucent
            >
                <StatusBar
                    backgroundColor={theme.bg}
                    barStyle={isDark ? "light-content" : "dark-content"}
                />
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
                    <Animated.View
                        style={{
                            flex: 1,
                            transform: [{ translateY: searchSlideAnim }],
                        }}
                    >
                        {/* Search Header */}
                        <View style={{ borderBottomColor: theme.border }} className="px-4 py-3 border-b">
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={closeSearchScreen}
                                    className="mr-3 p-2"
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                                </TouchableOpacity>
                                <View className="flex-1">
                                    <TextInput
                                        placeholder="Search for a station/city"
                                        placeholderTextColor={theme.textSecondary}
                                        style={{
                                            backgroundColor: theme.inputBg,
                                            color: theme.text,
                                        }}
                                        className="text-base px-4 py-2 rounded-full border-2 border-green-500"
                                        value={searchText}
                                        onChangeText={handleSearchChange}
                                        autoFocus
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Quick Actions */}
                        {/* <View
                            style={{ borderBottomColor: theme.border }}
                            className="flex-row justify-around py-3 border-b"
                        >
                            <TouchableOpacity className="flex-row items-center px-4">
                                <Ionicons name="location-outline" size={20} color={theme.iconColor} />
                                <Text style={{ color: theme.textSecondary }} className="ml-2 text-sm">
                                    Nearby Railway Stations
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2">
                                <Ionicons name="navigate-outline" size={20} color={theme.iconColor} />
                            </TouchableOpacity>
                        </View> */}

                        {/* Results */}
                        <FlatList
                            data={
                                searchText.length > 0
                                    ? activeSuggestions
                                    : showRecents
                                        ? recentSearches
                                        : popularStations
                            }
                            keyExtractor={(item, index) => `${item._id}-${index}`}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            ListHeaderComponent={
                                <>
                                    {showRecents && (
                                        <View style={{ backgroundColor: theme.cardBg }} className="px-5 py-3">
                                            <Text style={{ color: theme.text }} className="font-bold text-sm">
                                                Recent Searches
                                            </Text>
                                        </View>
                                    )}
                                    {showPopular && !showRecents && (
                                        <View style={{ backgroundColor: theme.cardBg }} className="px-5 py-3">
                                            <Text style={{ color: theme.text }} className="font-bold text-sm">
                                                Popular Searches
                                            </Text>
                                        </View>
                                    )}
                                </>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={{ borderBottomColor: theme.border }}
                                    className="px-5 py-4 border-b active:bg-opacity-50"
                                    onPress={() => handleStationSelect(item)}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center">
                                        <View
                                            style={{ backgroundColor: theme.inputBg }}
                                            className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                                        >
                                            <Ionicons
                                                name={showRecents ? "time-outline" : "location-outline"}
                                                size={20}
                                                color={theme.iconColor}
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text style={{ color: theme.text }} className="font-semibold text-base">
                                                {item.stationCode} - {item.stationName}
                                            </Text>
                                            {item.location && (
                                                <Text
                                                    style={{ color: theme.textSecondary }}
                                                    className="text-sm mt-0.5"
                                                >
                                                    {item.location}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View className="items-center justify-center py-20">
                                    <Ionicons name="search-outline" size={48} color={theme.border} />
                                    <Text style={{ color: theme.textSecondary }} className="mt-4 text-base">
                                        No stations found
                                    </Text>
                                </View>
                            }
                        />
                    </Animated.View>
                </SafeAreaView>
            </Modal>
        </>
    );
};