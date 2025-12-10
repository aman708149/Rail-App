import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface FoodChoiceCheckboxProps {
  dontWantFood: boolean;
  setDontWantFood: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FoodChoiceCheckbox({
  dontWantFood,
  setDontWantFood,
}: FoodChoiceCheckboxProps) {
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePress = () => {
    if (!dontWantFood) {
      setShowModal(true);
    } else {
      setDontWantFood(false);
    }
  };

  const confirmChoice = (proceed: boolean) => {
    if (proceed) {
      setDontWantFood(true);
    } else {
      setDontWantFood(false);
    }
    setShowModal(false);
  };

  return (
    <>
      {/* Checkbox Row */}
      <Pressable
        onPress={handlePress}
        className="flex-row items-center gap-3 mt-2"
      >
        <View
          className={`w-5 h-5 rounded border justify-center items-center ${
            dontWantFood
              ? "bg-red-600 border-red-600"
              : isDark
              ? "border-gray-500"
              : "border-gray-700"
          }`}
        >
          {dontWantFood && (
            <MaterialIcons name="close" size={16} color="#fff" />
          )}
        </View>

        <Text
          className={`text-base ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          No, I don’t want food
        </Text>
      </Pressable>

      {/* Confirmation Modal */}
      <Modal transparent visible={showModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View
            className={`w-full rounded-xl p-5 ${
              isDark ? "bg-gray-900" : "bg-white"
            }`}
          >
            {/* Header */}
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialIcons name="warning" size={28} color="#DC2626" />
              <Text
                className={`text-lg font-semibold ${
                  isDark ? "text-gray-100" : "text-gray-800"
                }`}
              >
                Confirm Food Choice
              </Text>
            </View>

            {/* Body */}
            <View className="items-center mb-5">
              <MaterialIcons name="error-outline" size={60} color="#DC2626" />
              <Text
                className={`text-base font-medium mt-3 text-center ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Food will not be provided for any of the passengers.
              </Text>

              <Text
                className={`text-sm mt-2 text-center ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Do you want to proceed?
              </Text>
            </View>

            {/* Buttons */}
            <View className="flex-row justify-center gap-4">
              <TouchableOpacity
                onPress={() => confirmChoice(false)}
                className="px-5 py-2 rounded-md border border-gray-400"
              >
                <Text className={isDark ? "text-gray-200" : "text-gray-700"}>
                  No
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => confirmChoice(true)}
                className="px-5 py-2 rounded-md bg-red-600"
              >
                <Text className="text-white font-semibold">Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
