import IconUser from "./Icon/IconUser";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { FontAwesome as Icon } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getProfileImageApi } from "@/src/service/profileservice";
import { useRole } from "../context/RoleProvider";
import { useWebSocket } from "../context/transSocketgatewayProvider";
import Toast from "react-native-toast-message";
import AgentWalletBalance from "./Layout/AgentWalletBalance";
import { logoutUser } from "@/src/service/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserRoleProfile() {
  const router = useRouter();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [blockedBalance, setBlockedBalance] = useState(0);
  const [userId, setUserId] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [role, setRole] = useState("");
  const [profileLogo, setProfileLogo] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const userData: any = useRole();
  const currentSocket = useWebSocket();

  useEffect(() => {
    if (userData && userData.user) {
      setUserId(userData.user.userID);
      setUserFullName(userData.user.userFullName);
      const formattedRole =
        userData.user.role.charAt(0).toUpperCase() +
        userData.user.role.slice(1);
      setRole(formattedRole);

      if (formattedRole === "Partner" && currentSocket) {
        currentSocket.on("balanceData", (data: any) => {
          setAvailableBalance(data.available_balance);
          setBlockedBalance(data.block_balance);
        });

        return () => {
          currentSocket.off("balanceData");
        };
      }
    }
  }, [userData, currentSocket]);

  const getProfileLogo = async () => {
    try {
      const imageUrl = await getProfileImageApi();
      setProfileLogo(imageUrl);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getProfileLogo();
  }, []);

  const logOut = async () => {
    try {
      await logoutUser();
      AsyncStorage.setItem("logout-event", "true");
      AsyncStorage.removeItem("login-role");
      setTimeout(() => AsyncStorage.removeItem("logout-event"), 200);
      router.push("/auth/login");
    } catch (error: any) {
      Toast.show({ type: "error", text1: error.message });
    }
  };

  return (
    <View>
      {/* profile icon */}
      <TouchableOpacity
        onPress={() => setModalVisible(!modalVisible)} // <-- toggle
        className="bg-black/60 p-2 rounded-full items-center justify-center"
      >
        <Icon name="user" size={20} color="#fff" />
      </TouchableOpacity>

      {/* modal dropdown */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Detect outside press */}
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 bg-black/40 justify-center items-center">
            {/* Stop outside touch closing modal */}
            <TouchableWithoutFeedback>
              <View className="bg-zinc-900 rounded-2xl w-11/12 p-4 shadow-lg">
                <ScrollView>
                  {/* Header */}
                  <View className="flex-row items-center border-b border-zinc-700 pb-3">
                    {/* <Image
                      source={
                        profileLogo
                          ? { uri: profileLogo }
                          : require("../../assets/images/profile-photo.png")
                      }
                      className="w-12 h-12 rounded-lg mr-3"
                    /> */}
                    <View>
                      <Text className="text-white text-lg font-bold">
                        {userFullName || "User"}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-gray-300 text-xs">{userId}</Text>
                        <Text
                          className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            role === "Admin"
                              ? "bg-green-600"
                              : role === "Partner"
                              ? "bg-blue-600"
                              : "bg-cyan-600"
                          } text-white`}
                        >
                          {role}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Partner Balances */}
                  {role === "Partner" && (
                    <View className="mt-3 bg-zinc-800 p-3 rounded-lg">
                      <Text className="text-gray-400 text-xs mb-1">
                        Wallet Balance
                      </Text>
                      <Text className="text-white text-sm">
                        Available: ₹{availableBalance.toFixed(2)}
                      </Text>
                      <Text className="text-white text-sm">
                        Blocked: ₹{blockedBalance.toFixed(2)}
                      </Text>
                      <Text className="text-white text-sm">
                        Running: ₹
                        {(availableBalance - blockedBalance).toFixed(2)}
                      </Text>
                    </View>
                  )}

                  {/* Agent Balance */}
                  {role === "Agent" && <AgentWalletBalance />}

                  {/* Profile link */}
                  <TouchableOpacity
                    // onPress={() => {
                    //   setModalVisible(false);
                    //   router.push("/profile");
                    // }}
                    className="flex-row items-center mt-4 p-2 bg-zinc-800 rounded-lg"
                  >
                    <Icon name="user-circle" size={16} color="#fff" />
                    <Text className="text-white text-sm ml-2">Profile</Text>
                  </TouchableOpacity>

                  {/* Logout */}
                  <TouchableOpacity
                    onPress={logOut}
                    className="flex-row items-center mt-5 border-t border-zinc-700 pt-3"
                  >
                    <Icon name="sign-out" size={16} color="red" />
                    <Text className="text-red-500 text-sm ml-2">Sign Out</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}