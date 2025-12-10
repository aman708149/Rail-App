import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { RailProfileTypes } from "@/src/types/railprofile";
import { getProfileData } from "@/src/service/apiservice";



interface Props {
  fromStation: string;
  toStation: string;
  journeydate: string;
}

export default function SearchTypeChange({
  fromStation,
  toStation,
  journeydate,
}: Props) {
  const [railprofile, setRailProfile] = useState<RailProfileTypes | null>(null);
  const [searchType, setSearchType] = useState(1);

  const router = useRouter();

  // ----------------------------- LOAD USER PROFILE -----------------------------
  const userProfile = async () => {
    // Load saved Search Type
    const savedType = await AsyncStorage.getItem("searchType");
    if (savedType) setSearchType(Number(savedType));

    // Fetch Profile Data
    const response = await getProfileData({
      mainprofile: true,
      railprofile: true,
    });

    const profile = response?.data?.mainprofile?.railprofiles?.railprofile;
    if (profile) setRailProfile(profile);
  };

  useEffect(() => {
    userProfile();
  }, []);

  // ----------------------------- HANDLE TYPE CHANGE -----------------------------
  const handleSearchTypeChange = async (value: number) => {
    setSearchType(value);

    // Store selected type
    await AsyncStorage.setItem("searchType", String(value));

    // Update existing session data
    const existing = JSON.parse((await AsyncStorage.getItem("searchInitData")) || "{}");
    await AsyncStorage.setItem(
      "searchInitData",
      JSON.stringify({ ...existing, journeyDate: journeydate })
    );

    // Navigation logic
    const allowed = railprofile?.allowedSearchTypes || [];

    if (value === 2 && allowed.includes(2)) router.replace("/rail/trainbetweenstation" as any);
    else if (value === 3 && allowed.includes(3)) router.replace("/rail/rail-birdeye-view");
    else if (value === 4 && allowed.includes(4)) router.replace("/rail/smart-search" as any);
    else router.replace("/rail/trainavailability");
  };

  // ----------------------------- UI RENDER -----------------------------
  if (!railprofile || railprofile.allowedSearchTypes.length <= 1) return null;

  return (
    <View className="w-full mt-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
      <Picker
        selectedValue={searchType}
        onValueChange={(value) => handleSearchTypeChange(Number(value))}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
      >
        {railprofile.allowedSearchTypes.includes(1) && (
          <Picker.Item label="Compact" value={1} />
        )}
        {railprofile.allowedSearchTypes.includes(2) && (
          <Picker.Item label="Expanded" value={2} />
        )}
        {railprofile.allowedSearchTypes.includes(3) && (
          <Picker.Item label="Bird Eye" value={3} />
        )}
        {railprofile.allowedSearchTypes.includes(4) && (
          <Picker.Item label="Smart Book" value={4} />
        )}
      </Picker>
    </View>
  );
}
