import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { addNotification } from "@/src/store/notificationSlice";
import Toast from "react-native-toast-message";
import { useRole } from "@/src/context/RoleProvider";
import { useWebSocket } from "@/src/context/transSocketgatewayProvider";
import { useAuthWebSocket } from "@/src/context/authSocketGatewayProvider";
import { PartnerNotificationList } from "@/src/components/PartnerNotificationList";
import ThemeToggle from "@/src/components/ThemeToggle";
import UserRoleProfile from "@/src/components/UserRoleProfile";


export default function PartnerHeader() {
  const [pendingOrder, setPendingOrder] = useState(0);
  const [profileRequestCount, setProfileRequestCount] = useState(0);
  const [agentRequestCount, setAgentRequestCount] = useState(0);

  const router = useRouter();
  const userData: any = useRole();
  const currentSocket = useWebSocket();
  const authSocket = useAuthWebSocket();
  const dispatch = useDispatch();

  // ✅ Handle Transaction Socket (pending orders)
  useEffect(() => {
    if (userData?.user?.role === "partner" && currentSocket) {
      currentSocket.on("connect", () => console.log("Transaction socket connected"));

      currentSocket.on("pendingOrder", (data: any) => {
        setPendingOrder(data.count || 0);

        if (data.message) {
          dispatch(addNotification({ message: data.message, type: data.type }));
          Toast.show({
            type: "info",
            text1: data.message,
            visibilityTime: 3000,
          });
        }
      });

      return () => {
        currentSocket.off("connect");
        currentSocket.off("pendingOrder");
      };
    }
  }, [currentSocket, userData]);

  // ✅ Handle Auth Socket (agent/profile requests)
  useEffect(() => {
    if (userData?.user?.role === "partner" && authSocket) {
      authSocket.on("connect", () => console.log("Auth socket connected"));

      authSocket.on("AgentRequestCount", (data: any) => {
        setAgentRequestCount(data.count || 0);
        if (data.message) {
          dispatch(addNotification({ message: data.message, type: data.type }));
          Toast.show({
            type: "success",
            text1: data.message,
            visibilityTime: 3000,
          });
        }
      });

      authSocket.on("ProfileRequestCount", (data: any) => {
        setProfileRequestCount(data.count || 0);
      });

      return () => {
        authSocket.off("connect");
        authSocket.off("AgentRequestCount");
        authSocket.off("ProfileRequestCount");
      };
    }
  }, [authSocket, userData]);

  return (
    <View className="w-full bg-white dark:bg-[#2D2D30] shadow-md px-3 py-2 flex-row items-center justify-between">
      {/* Left Section */}
      <View className="flex-row items-center space-x-3">
        {userData?.user?.role && (
          <View className="bg-blue-600 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-semibold">
              {userData.user.userID}{" "}
              {userData.user.role === "partner"
                ? "(Partner)"
                : userData.user.role.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Center Icons */}
      <View className="flex-row items-center space-x-4">
        {/* Profile Request Icon */}
        <TouchableOpacity
          className="relative bg-blue-500 rounded-full w-10 h-10 items-center justify-center"
        //   onPress={() => router.push("/partner/railprofilerequest")}
        >
          <Ionicons name="person-outline" size={22} color="white" />
          {profileRequestCount > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-[10px] font-bold">
                {profileRequestCount > 99 ? "99+" : profileRequestCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Agent Request Icon */}
        <TouchableOpacity
          className="relative bg-blue-500 rounded-full w-10 h-10 items-center justify-center"
        //   onPress={() => router.push("/partner/allagent")}
        >
          <Feather name="users" size={20} color="white" />
          {agentRequestCount > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-[10px] font-bold">
                {agentRequestCount > 99 ? "99+" : agentRequestCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Orders Icon */}
        <TouchableOpacity
          className="relative bg-blue-500 rounded-full w-10 h-10 items-center justify-center"
        //   onPress={() =>
        //     // router.push(
        //     //   `/reports/orders?pending=${Number(pendingOrder) > 0 ? true : false}`
        //     // )
        //   }
        >
          <Ionicons name="document-text-outline" size={22} color="white" />
          {pendingOrder > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-[10px] font-bold">
                {pendingOrder > 99 ? "99+" : pendingOrder}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notifications */}
        <PartnerNotificationList />
      </View>

      {/* Right Section */}
      <View className="flex-row items-center space-x-3">
        <ThemeToggle />
        <UserRoleProfile />
      </View>

      {/* Toast Component */}
      <Toast />
    </View>
  );
}
