// src/components/MenuItems.tsx
import React, { useState, FC, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import IconCaretDown from "../Icon/IconCaretDown";
import "../../../global.css";


interface MenuItem {
  id: number;
  caption: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
}

interface MenuItemsProps {
  menuData: MenuItem[];
  resetExpandedMenu: boolean;
  setResetExpandedMenu: React.Dispatch<React.SetStateAction<boolean>>;
  displayText: boolean;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  handleMenuClick: () => void;
  parentExpanded?: boolean;
  depth?: number;
}

const MenuItems: FC<MenuItemsProps> = ({
  menuData,
  displayText,
  parentExpanded = true,
  depth = 0,
  resetExpandedMenu,
  setResetExpandedMenu,
  handleMenuClick,
  isSidebarVisible,
  toggleSidebar,
}) => {
  const [expandedMenu, setExpandedMenu] = useState<number | null>(null);
  const [activePath, setActivePath] = useState<string>("");
  const router = useRouter();
  const heightAnim = new Animated.Value(parentExpanded ? 1 : 0);

  // 🌀 Smooth height toggle (like AnimateHeight)
  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: parentExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [parentExpanded]);

  // Reset expanded menu when triggered
  useEffect(() => {
    if (resetExpandedMenu) {
      setExpandedMenu(null);
      setResetExpandedMenu(false);
    }
  }, [resetExpandedMenu, setResetExpandedMenu]);

  // Active path sync
//   useEffect(() => {
//     setActivePath(router.pathname || "");
//   }, [router.pathname]);

  const toggleSubmenu = useCallback(
    (menuId: number) => {
      setExpandedMenu(expandedMenu === menuId ? null : menuId);
    },
    [expandedMenu]
  );

  const HandelNavigate = (path: string) => {
    setActivePath(path);
    setResetExpandedMenu(false);
    // router.push(path);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.children && item.children.length > 0) {
      toggleSubmenu(item.id);
    } else {
      HandelNavigate(item.path || "");
      setResetExpandedMenu(false);
      handleMenuClick();
      toggleSidebar();
    }
  };

  // Simple icon render (optional: use MaterialIcons)
  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    return <MaterialIcons name={iconName as any} size={20} color="#fff" />;
  };

  return (
    <Animated.View
      style={{
        height: heightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        overflow: "hidden",
      }}
    >
      <ScrollView>
        {menuData.map((item) => {
          const newDepth = depth + 1;
          const isActive = activePath === item.path;

          return (
            <View key={item.id}>
              <TouchableOpacity
                onPress={() => handleItemClick(item)}
                className={`flex-row justify-between items-center px-3 py-2 ${
                  isActive ? "bg-gray-200" : "bg-transparent"
                }`}
                style={{
                  marginLeft: depth * 10,
                }}
              >
                <View className="flex-row items-center gap-3">
                  {renderIcon(item.icon)}
                  {displayText && (
                    <Text
                      className={`text-white text-base ${
                        isActive ? "font-semibold text-yellow-300" : ""
                      }`}
                    >
                      {item.caption}
                    </Text>
                  )}
                </View>

                {item.children && item.children.length > 0 && displayText && (
                  <Animated.View
                    style={{
                      transform: [
                        {
                          rotate: expandedMenu === item.id
                            ? "180deg"
                            : "0deg",
                        },
                      ],
                    }}
                  >
                    <IconCaretDown color="white" />
                  </Animated.View>
                )}
              </TouchableOpacity>

              {/* Recursive Children */}
              {item.children && isSidebarVisible && (
                <View
                  className="bg-gray-700/30 ml-3 rounded-lg"
                  style={{
                    borderLeftWidth: 1,
                    borderColor: "#555",
                    paddingLeft: 5,
                  }}
                >
                  <MenuItems
                    displayText={displayText}
                    resetExpandedMenu={resetExpandedMenu}
                    setResetExpandedMenu={setResetExpandedMenu}
                    isSidebarVisible={isSidebarVisible}
                    menuData={item.children}
                    parentExpanded={expandedMenu === item.id}
                    depth={newDepth}
                    handleMenuClick={handleMenuClick}
                    toggleSidebar={toggleSidebar}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
};

export default MenuItems;
