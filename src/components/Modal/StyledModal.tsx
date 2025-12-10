// 🧾 components/StyledModal.tsx

import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StyledModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  showConfirmButton?: boolean;
  size?: number;
  children: React.ReactNode;
}

export default function StyledModal({
  isOpen,
  onClose,
  onConfirm,
  title = "",
  showConfirmButton = false,
  size = 400,
  children,
}: StyledModalProps) {
  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View className="flex-1 bg-black/60 items-center justify-center">
        <View
          className="bg-gray-900 rounded-xl p-0"
          style={{ width: size, maxHeight: "80%" }}
        >
          {/* ❌ CROSS ICON (WORKING) */}
          <TouchableOpacity
            onPress={onClose}
            style={{ position: "absolute", top: 10, right: 10, zIndex: 50 }}
          >
            <Ionicons name="close-circle" size={30} color="white" />
          </TouchableOpacity>

          {/* Title */}
          {title ? (
            <Text className="text-xl font-semibold text-white mb-3 text-center">
              {title}
            </Text>
          ) : null}

          {/* Scrollable Content */}
          <ScrollView className="mt-2">{children}</ScrollView>

          {/* Confirm Button */}
          {showConfirmButton && (
            <TouchableOpacity
              onPress={onConfirm}
              className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
            >
              <Text className="text-white text-center">Confirm</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
