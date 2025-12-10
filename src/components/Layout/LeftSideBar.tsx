// src/components/LeftSideBar.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import MenuItems from "./MenuItems"; // existing component
import { FetchDynamicMenu } from "@/src/service/dynamicmenu";
import { AppDispatch } from "@/src/store";
import { fetchUserPreferences } from "@/src/store/userPreferencesSlice";
import "../../../global.css";
import { useRole } from "@/src/context/RoleProvider";


const screenWidth = Dimensions.get("window").width;

const LeftSideBar = () => {
  const [menuData, setMenuData] = useState<any[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [displayText, setDisplayText] = useState(false);
  const [resetExpandedMenu, setResetExpandedMenu] = useState(false);

  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const { user } = useRole();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Fetch menu & preferences
  useEffect(() => {
    if (user) {
      (async () => {
        const response: any = await FetchDynamicMenu();
        setMenuData(response.data || []);
        dispatch(fetchUserPreferences());
      })();
    }
  }, [user]);

  // Sidebar open/close animation
  const toggleSidebar = () => {
    const newValue = !isSidebarVisible;
    setIsSidebarVisible(newValue);
    Animated.timing(sidebarAnim, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // Set display text with small delay like your original logic
    if (newValue) {
      setTimeout(() => setDisplayText(true), 200);
    } else {
      setDisplayText(false);
    }
  };

  const sidebarWidth = sidebarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 250], // Collapsed and expanded
  });

  const handleMenuClick = () => {
    setIsSidebarVisible(false);
    setDisplayText(false);
    Animated.timing(sidebarAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View className="flex-row">
      {/* Hamburger Icon */}
      <TouchableOpacity
        onPress={toggleSidebar}
        className="p-3 bg-gray-800 rounded-r-lg"
      >
        <Text className="text-blue-600 text-lg">☰</Text>
      </TouchableOpacity>

      {/* Dim background overlay when sidebar open */}
      {isSidebarVisible && (
        <Pressable
          onPress={toggleSidebar}
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/40"
        />
      )}

      {/* Animated Sidebar */}
      <Animated.View
        style={{
          width: sidebarWidth,
          height: "100%",
          backgroundColor: "#2D2D30",
          position: "absolute",
          left: 0,
          top: 0,
          zIndex: 20,
          paddingTop: 50,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowOffset: { width: 2, height: 0 },
        }}
      >
        {/* Profile Image */}
        {user?.role && (
          <TouchableOpacity
            // onPress={() => router.push("/profile")}
            className="items-center mb-4"
          >
            <Image
              source={{
                uri: `/api/get-image?role=${user?.userID}&t=${Math.floor(
                  Date.now() / (1000 * 60 * 60 * 2)
                )}`,
              }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
              }}
            />
          </TouchableOpacity>
        )}

        {/* Menu Items */}
        <ScrollView className="flex-1 px-2">
          <MenuItems
            menuData={menuData}
            isSidebarVisible={isSidebarVisible}
            displayText={displayText}
            resetExpandedMenu={resetExpandedMenu}
            setResetExpandedMenu={setResetExpandedMenu}
            handleMenuClick={handleMenuClick}
            toggleSidebar={toggleSidebar}
          />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default LeftSideBar;
