import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Dimensions } from "react-native";
import IPAddress from "./IPAdress";

const MarqueeNotice = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    animatedValue.setValue(screenWidth); // Start from right
    Animated.timing(animatedValue, {
      toValue: -screenWidth, // Move completely to left
      duration: 12000, // 12 seconds (same as web)
      useNativeDriver: true,
    }).start(() => startAnimation()); // Loop
  };

  return (
    <View className="w-full bg-yellow-200 dark:bg-gray-900 border-l-4 border-yellow-500 rounded-lg p-2 overflow-hidden">
      <Animated.View
        style={{
          transform: [{ translateX: animatedValue }],
        }}
      >
        <Text className="text-sm text-gray-900 dark:text-gray-200 whitespace-nowrap">
          ⚠️ Please ensure you have NOT created any booking using{" "}
          <Text className="text-yellow-600 font-semibold">a personal IRCTC ID</Text>{" "}
          on this IP address <Text className="text-red-600 font-bold"><IPAddress /></Text>.
        </Text>
      </Animated.View>
    </View>
  );
};

export default MarqueeNotice;
