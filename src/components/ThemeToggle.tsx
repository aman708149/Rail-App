import React, { JSX, useEffect, useState } from "react";
import { TouchableOpacity, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { Feather, Ionicons } from "@expo/vector-icons";
import { toggleTheme } from "@/src/store/themeConfigSlice";
import { useRole } from "../context/RoleProvider";

interface ThemeMode {
  id: "system" | "light" | "dark";
  icon: JSX.Element;
}

const ThemeToggle = () => {
  const systemTheme = useColorScheme(); // 'light' or 'dark'
  const dispatch = useDispatch();
  const { setThemeModeGlobal } = useRole();
  const [themeMode, setThemeMode] = useState<ThemeMode["id"]>("system");

  const themeModes: ThemeMode[] = [
    { id: "system", icon: <Ionicons name="laptop-outline" size={20} color="white" /> },
    { id: "light", icon: <Feather name="sun" size={20} color="white" /> },
    { id: "dark", icon: <Feather name="moon" size={20} color="white" /> },
  ];

  // ✅ Load saved theme
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("themeMode");
        if (savedTheme === "system" || savedTheme === "light" || savedTheme === "dark") {
          setThemeMode(savedTheme);
          applyTheme(savedTheme);
        } else {
          setThemeMode("system");
          applyTheme("system");
        }
      } catch (err) {
        console.log("Error loading theme:", err);
      }
    })();
  }, []);

  // ✅ Apply and store theme changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("themeMode", themeMode);
        applyTheme(themeMode);
        setThemeModeGlobal(themeMode);
        dispatch(toggleTheme(themeMode));
      } catch (err) {
        console.log("Error saving theme:", err);
      }
    })();
  }, [themeMode]);

  const applyTheme = (mode: ThemeMode["id"]) => {
    // In Expo + Tailwind, you typically control dark/light with context or Redux.
    // Here we just dispatch and notify Role context; Tailwind uses "dark:" classes automatically.
    const effectiveTheme = mode === "system" ? systemTheme : mode;
    console.log("🌗 Applying theme:", effectiveTheme);
  };

  const toggleThemeMode = () => {
    const currentIndex = themeModes.findIndex((m) => m.id === themeMode);
    const nextIndex = (currentIndex + 1) % themeModes.length;
    setThemeMode(themeModes[nextIndex].id);
  };

  const currentIcon =
    themeModes.find((mode) => mode.id === themeMode)?.icon ??
    themeModes[0].icon;

  return (
    <TouchableOpacity
      onPress={toggleThemeMode}
      className="bg-black bg-opacity-30 p-2 rounded-full active:opacity-80"
    >
      {currentIcon}
    </TouchableOpacity>
  );
};

export default ThemeToggle;
