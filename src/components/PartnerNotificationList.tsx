import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { removeNotification } from "@/src/store/notificationSlice";
import { formatDistanceToNow } from "date-fns";

export function PartnerNotificationList() {
  const dispatch = useDispatch();
  const router = useRouter();
  const notifications = useSelector((state: any) => state.notification.messages);
  const [visibleCount, setVisibleCount] = useState(3);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRemoveNotification = (index: number) => {
    dispatch(removeNotification(index));
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const getRelativeTime = (time?: string) => {
    if (!time) return "";
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const openNotifications = () => {
    setVisibleCount(3);
    setModalVisible(true);
  };

  const closeNotifications = () => {
    setModalVisible(false);
  };

  const renderNotificationItem = ({
    item,
    index,
  }: {
    item: { message: string; type: string; time: string };
    index: number;
  }) => {
    let pagePath = "#";
    if (item.type === "otpFlag") pagePath = "/partner/rail/otpflagrequest";
    else if (item.type === "railId") pagePath = "/partner/railprofilerequest";
    else if (item.type === "dc") pagePath = "/partner/rail/digitalcertificatereq";

    return (
      <View
        key={index}
        className="border-b border-gray-300 dark:border-gray-700 py-2 px-1"
      >
        <TouchableOpacity
          onPress={() => {
            closeNotifications();
            // if (pagePath !== "#") router.push(pagePath);
          }}
          className="flex-row justify-between items-center"
        >
          <Text className="flex-1 text-gray-800 dark:text-gray-100 text-sm">
            {item.message}
          </Text>

          <TouchableOpacity
            onPress={() => handleRemoveNotification(index)}
            className="ml-3"
          >
            <Feather name="x-circle" size={18} color="#EF4444" />
          </TouchableOpacity>
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 mt-1">
          {getRelativeTime(item.time)}
        </Text>
      </View>
    );
  };

  return (
    <View>
      {/* 🔔 Notification Button */}
      <TouchableOpacity
        className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center relative"
        onPress={openNotifications}
      >
        <Ionicons name="notifications-outline" size={22} color="white" />
        {notifications.length > 0 && (
          <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <Text className="text-white text-[10px] font-bold">
              {notifications.length > 99 ? "99+" : notifications.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 🧾 Notification Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeNotifications}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={closeNotifications}
        >
          <Pressable
            className="w-11/12 max-h-[70%] bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="bg-gray-200 dark:bg-gray-800 px-4 py-3 flex-row justify-between items-center">
              <Text className="text-red-500 font-semibold">Notifications</Text>
              <TouchableOpacity onPress={closeNotifications}>
                <Feather name="x" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            {notifications.length > 0 ? (
              <FlatList
                data={notifications.slice().reverse().slice(0, visibleCount)}
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderNotificationItem}
                contentContainerStyle={{ paddingBottom: 10 }}
              />
            ) : (
              <View className="py-8">
                <Text className="text-center text-red-500">
                  No notification here
                </Text>
              </View>
            )}

            {/* Footer */}
            {visibleCount < notifications.length && (
              <View className="px-3 py-2 bg-gray-100 dark:bg-gray-800">
                <TouchableOpacity
                  onPress={handleShowMore}
                  className="bg-blue-600 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-medium">
                    Show More
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
