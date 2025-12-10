import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { addNotification } from "@/src/store/notificationSlice";
import { GetNotificationsService } from "@/src/service/adminservice";
import { useRole } from "@/src/context/RoleProvider";
import { useWebSocket } from "@/src/context/transSocketgatewayProvider";
import { useAuthWebSocket } from "@/src/context/authSocketGatewayProvider";
import { NotificationList } from "@/src/components/NotificationList";
import ThemeToggle from "@/src/components/ThemeToggle";
import UserRoleProfile from "@/src/components/UserRoleProfile";

export default function AdminHeader() {
  const [pendingDepositRequest, setPendingDepositRequest] = useState(0);
  const [pendingOrder, setPendingOrder] = useState(0);
  const [profileRequestCount, setProfileRequestCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const userData: any = useRole();
  const currentSocket = useWebSocket();
  const authSocket = useAuthWebSocket();

  // 🔔 Fetch notification count
  const GetNotifications = async () => {
    try {
      const response = await GetNotificationsService();
      setNotificationsCount(response.data.length);
    } catch (error: any) {
      console.log("Error fetching notifications:", error.message);
    }
  };

  useEffect(() => {
    GetNotifications();
  }, []);

  // 🔈 Speech for new notifications
  const speakMessage = (message: string) => {
    try {
      Speech.speak(message, {
        language: "en-IN",
        pitch: 0.9,
        rate: 0.9,
      });
    } catch (e) {
      console.log("Speech error:", e);
    }
  };

  // 🔌 WebSocket events
  useEffect(() => {
    if (userData?.user?.role === "admin" && currentSocket) {
      currentSocket.on("pendingdepositrequest", (data: any) => {
        setPendingDepositRequest(data.count);
        // if (data.message) {
        //   dispatch(addNotification({ message: data.message, type: "deposit" }));
        //   speakMessage(data.message);
        // }
      });

      currentSocket.on("pendingOrder", (data: any) => {
        setPendingOrder(data.count);
        // if (data.message) {
        //   dispatch(addNotification({ message: data.message, type: "order" }));
        //   speakMessage(data.message);
        // }
      });

      return () => {
        currentSocket.off("pendingdepositrequest");
        currentSocket.off("pendingOrder");
      };
    }
  }, [currentSocket, userData]);

  // 🔐 Auth WebSocket
  useEffect(() => {
    if (userData?.user?.role === "admin" && authSocket) {
      authSocket.on("ProfileRequestCount", (data: any) => {
        setProfileRequestCount(data.count);
        if (data.message) {
          dispatch(addNotification({ message: data.message, type: data.type }));
          speakMessage(data.message);
        }
      });

      return () => {
        authSocket.off("ProfileRequestCount");
      };
    }
  }, [authSocket, userData]);

  // 🧩 UI Render
  return (
    <View
      className={`flex-row justify-between items-center bg-white dark:bg-[#2D2D30] px-3 py-2 shadow`}
    >
      {/* Left: User Info */}
      <View className="flex-row items-center space-x-2">
        {userData?.user?.role && (
          <View className="bg-green-600 px-2 py-1 rounded-md">
            <Text className="text-white text-sm font-medium">
              {userData?.user?.userID} (
              {userData?.user?.role === "admin"
                ? "Admin"
                : userData?.user?.role === "agent"
                ? "Agent"
                : userData?.user?.role}
              )
            </Text>
          </View>
        )}
      </View>

      {/* Right: Icons */}
      <View className="flex-row items-center space-x-4">
        {/* Orders */}
        <TouchableOpacity
          className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center relative"
        //   onPress={() =>
        //     router.push(
        //       `/reports/orders?pending=${pendingOrder > 0 ? true : false}`
        //     )
        //   }
        >
          <Ionicons name="receipt" size={18} color="#fff" />
          {pendingOrder > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs">
                {pendingOrder > 99 ? "99+" : pendingOrder}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Deposit Requests */}
        <TouchableOpacity
          className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center relative"
        //   onPress={() => router.push("/admin/partner/depositrequest")}
        >
          <MaterialIcons name="account-balance-wallet" size={18} color="#fff" />
          {pendingDepositRequest > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs">
                {pendingDepositRequest > 99 ? "99+" : pendingDepositRequest}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Requests */}
        <TouchableOpacity
          className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center relative"
        //   onPress={() => router.push("/admin/railprofilerequest")}
        >
          <Ionicons name="train" size={18} color="#fff" />
          {profileRequestCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs">
                {profileRequestCount > 99 ? "99+" : profileRequestCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Notification List */}
        <NotificationList />

        {/* Theme & Profile */}
        <ThemeToggle />
        <UserRoleProfile />
      </View>
    </View>
  );
}
