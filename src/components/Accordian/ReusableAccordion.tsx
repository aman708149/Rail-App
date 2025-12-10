import React, { useEffect } from "react";
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager } from "react-native";
import { useColorScheme } from "react-native";
import { AccordionProps } from "./AccordionProps";
import { Ionicons } from "@expo/vector-icons";   // ← ADD THIS

// if (Platform.OS === "android") {
//     UIManager.setLayoutAnimationEnabledExperimental &&
//         UIManager.setLayoutAnimationEnabledExperimental(true);
// }

interface RNAccordionProps extends AccordionProps {
    activeId?: string | string[];
    stayOpen?: boolean;
    onToggle: (id: string) => void;
}

const ReusableAccordion: React.FC<RNAccordionProps> = ({
    items,
    activeId,
    onToggle,
    stayOpen = false
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    useEffect(() => {
        if (
            Platform.OS === 'android' &&
            UIManager.setLayoutAnimationEnabledExperimental
        ) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const isActive = (id: string) => {
        if (Array.isArray(activeId)) return activeId.includes(id);
        return activeId === id;
    };

    const handleToggle = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onToggle(id);
    };

    return (
        <View className="flex flex-col w-full">
            {items.map((item) => (
                <View
                    key={item.id}
                    className={`rounded mb-2 border 
                        ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}
                    `}
                >
                    {/* ===== HEADER WITH ICON ===== */}
                    <Pressable
                        onPress={() => handleToggle(item.id)}
                        className="p-3 flex-row justify-between items-center mr-4"
                    >
                        {typeof item.header === "string" ? (
                            <Text
                                className={`text-base font-semibold 
                                    ${isDark ? "text-white" : "text-gray-800"}
                                `}
                            >
                                {item.header}
                            </Text>
                        ) : (
                            item.header
                        )}

                        {/* ▼ / ▲ ICON */}
                        <Ionicons
                            name={isActive(item.id) ? "chevron-up-outline" : "chevron-down-outline"}
                            size={20}
                            color={isDark ? "#fff" : "#000"}
                        />
                    </Pressable>

                    {/* ===== BODY ===== */}
                    {isActive(item.id) && (
                        <View className="px-3 pb-3">
                            {typeof item.body === "string" ? (
                                <Text className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                    {item.body}
                                </Text>
                            ) : (
                                item.body
                            )}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
};

export default ReusableAccordion;
