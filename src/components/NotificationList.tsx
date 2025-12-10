import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import IconXCircle from "./Icon/IconXCircle";
import { removeNotification } from "@/src/store/notificationSlice";

export function NotificationList() {
  const [modalVisible, setModalVisible] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const dispatch = useDispatch();
  const router = useRouter();

  const notifications = useSelector((state: any) => state.notification.messages);

  const handleRemoveNotification = (index: number) => {
    dispatch(removeNotification(index));
  };

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 3);
  };

  const handleDropdownToggle = () => {
    setVisibleCount(3);
    setModalVisible(true);
  };

  const getPagePath = (type: string) => {
    switch (type) {
      case "otpFlag":
        return "/admin/rail/otpflagrequest";
      case "railId":
        return "/admin/railprofilerequest";
      case "dc":
        return "/admin/rail/digitalcertificatereq";
      case "depositRequest":
        return "/admin/partner/depositrequest";
      default:
        return "/";
    }
  };

  return (
    <View>
      {/* 🔔 Notification Icon */}
      <TouchableOpacity
        onPress={handleDropdownToggle}
        className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center relative"
      >
        <Ionicons name="notifications" size={20} color="#fff" />
        {notifications.length > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-600 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {notifications.length > 99 ? "99+" : notifications.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* 🔽 Notification Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center items-center"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="bg-white dark:bg-neutral-800 w-80 rounded-xl shadow-lg p-3"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center border-b border-gray-300 pb-2">
              <Text className="text-lg font-semibold text-red-500">
                Notifications
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96 mt-2">
              {notifications.length > 0 ? (
                notifications
                  .slice()
                  .reverse()
                  .slice(0, visibleCount)
                  .map(
                    (
                      notification: { message: string; type: string; time: Date },
                      index: number
                    ) => {
                      const timeAgo = formatDistanceToNow(
                        new Date(notification.time),
                        { addSuffix: true }
                      );
                      return (
                        <View
                          key={index}
                          className="border-b border-gray-300 py-2 flex-row justify-between items-center"
                        >
                          <TouchableOpacity
                            className="flex-1 mr-2"
                            // onPress={() => {
                            //   setModalVisible(false);
                            //   router.push(getPagePath(notification.type));
                            // }}
                          >
                            <Text className="text-sm text-gray-700 dark:text-gray-200">
                              {notification.message}
                            </Text>
                            <Text className="text-xs text-gray-500 mt-1">
                              {timeAgo}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveNotification(
                                notifications.length - 1 - index
                              )
                            }
                            className="ml-2"
                          >
                            <IconXCircle className="text-red-500" />
                          </TouchableOpacity>
                        </View>
                      );
                    }
                  )
              ) : (
                <View className="py-6 items-center">
                  <Text className="text-red-500 text-base">
                    No notification here
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Show More Button */}
            {visibleCount < notifications.length && (
              <TouchableOpacity
                className="mt-2 bg-blue-600 py-2 rounded-md"
                onPress={handleShowMore}
              >
                <Text className="text-white text-center font-medium">
                  Show More
                </Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
