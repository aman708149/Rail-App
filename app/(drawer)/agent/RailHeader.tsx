import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons"; // For optional icons
import { GetWsUserlogin } from "@/src/service/apiservice";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useRole } from "@/src/context/RoleProvider";
import ThemeToggle from "@/src/components/ThemeToggle";
import UserRoleProfile from "@/src/components/UserRoleProfile";
import { DrawerActions } from "@react-navigation/native"; // MUST IMPORT


export default function RailHeader() {
  const router = useRouter();
  const { user } = useRole();
  const [wsUserLogin, setWsUserLogin] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch WebSocket login name if user is an agent
  useEffect(() => {
    if (user?.role === "agent") {
      fetchWsUserLogin();
    }
  }, [user]);

  const fetchWsUserLogin = async () => {
    try {
      setLoading(true);
      const response = await GetWsUserlogin();
      if (response?.status === 200) {
        setWsUserLogin(response.data);
      }
      console.log("ws user login is", response.data)
    } catch (err) {
      console.error("Error fetching wsUserLogin:", err);
    } finally {
      setLoading(false);
    }
  };
  const navigation = useNavigation<DrawerNavigationProp<any>>();


  return (
    <View className="w-full bg-white dark:bg-[#2D2D30] shadow-md px-3 py-2 flex-row items-center justify-between">
      {/* Left side (Title or App Name) */}
      <View className="flex-row items-center">
        {/* <Feather name="activity" size={20} color="#3B82F6" /> */}
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Text style={{ fontSize: 28, color: "white" }}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Right side controls */}
      <View className="flex-row items-center space-x-2 gap-1 ">
        {/* refID Badge */}
        {user?.refID ? (
          <View className="bg-blue-500 rounded-full px-2 py-0.5">
            <Text className="text-white text-xs">{user.refID}</Text>
          </View>
        ) : null}

        {/* Role Badge */}
        {user?.role && (
          <View
            className={`rounded-full px-2 py-0.5 ${user.role === "agent"
              ? "bg-sky-400"
              : user.role === "partner"
                ? "bg-blue-600"
                : user.role === "admin"
                  ? "bg-green-500"
                  : "bg-gray-500"
              }`}
          >
            <Text className="text-white text-xs font-semibold">
              {user.userID}{" "}
              {user.role === "agent" ? "(Agent)" : user.role.toUpperCase()}
            </Text>
          </View>
        )}



        {/* WebSocket login (if agent) */}
        {user?.role === "agent" && (
          <View>
            
              {loading ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                wsUserLogin && (
                  <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {wsUserLogin}
                  </Text>
                )
              )}
           
          </View>

        )}

        {/* Theme toggle */}
        {/* <ThemeToggle /> */}

        {/* User Profile dropdown */}
        <UserRoleProfile />
      </View>
    </View>
  );
}
