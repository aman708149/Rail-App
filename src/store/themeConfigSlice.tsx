import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import themeConfig from "@/theme.config";

export type ThemeMode = "light" | "dark" | "system";
export type RTLMode = "ltr" | "rtl";

export interface ThemeState {
  isDarkMode: boolean;
  sidebar: boolean;
  theme: ThemeMode;
  menu: string;
  layout: string;
  rtlClass: RTLMode;
  animation: string;
  navbar: string;
  locale: string;
  semidark: boolean;
  languageList: { code: string; name: string }[];
}

// ✅ Safe fallback converter for theme
const normalizeTheme = (theme: string | undefined): ThemeMode => {
  if (theme === "light" || theme === "dark" || theme === "system") return theme;
  return "system";
};

// ✅ Safe fallback converter for RTL
const normalizeRTL = (rtl: string | undefined): RTLMode => {
  if (rtl === "rtl" || rtl === "ltr") return rtl;
  return "ltr";
};

const initialState: ThemeState = {
  isDarkMode: false,
  sidebar: false,
  theme: normalizeTheme(themeConfig.theme),
  menu: themeConfig.menu,
  layout: themeConfig.layout,
  rtlClass: normalizeRTL(themeConfig.rtlClass),
  animation: themeConfig.animation,
  navbar: themeConfig.navbar,
  locale: themeConfig.locale,
  semidark: themeConfig.semidark,
  languageList: [
    { code: "zh", name: "Chinese" },
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "es", name: "Spanish" },
    { code: "tr", name: "Turkish" },
  ],
};

const themeConfigSlice = createSlice({
  name: "themeConfig",
  initialState,
  reducers: {
    toggleTheme(state, action: PayloadAction<ThemeMode | undefined>) {
      const newTheme = normalizeTheme(action.payload || state.theme);
      state.theme = newTheme;

      const colorScheme = Appearance.getColorScheme();
      state.isDarkMode =
        newTheme === "dark" ||
        (newTheme === "system" && colorScheme === "dark");

      AsyncStorage.setItem("theme", newTheme).catch(console.error);
    },

    toggleRTL(state, action: PayloadAction<RTLMode | undefined>) {
      const newRTL = normalizeRTL(action.payload || state.rtlClass);
      state.rtlClass = newRTL;
      AsyncStorage.setItem("rtlClass", newRTL).catch(console.error);
    },

    toggleMenu(state, action: PayloadAction<string | undefined>) {
      state.sidebar = false;
      state.menu = action.payload || state.menu;
      AsyncStorage.setItem("menu", state.menu).catch(() => {});
    },

    toggleLayout(state, action: PayloadAction<string | undefined>) {
      state.layout = action.payload || state.layout;
      AsyncStorage.setItem("layout", state.layout).catch(() => {});
    },

    toggleAnimation(state, action: PayloadAction<string | undefined>) {
      state.animation = (action.payload || state.animation).trim();
      AsyncStorage.setItem("animation", state.animation).catch(() => {});
    },

    toggleNavbar(state, action: PayloadAction<string | undefined>) {
      state.navbar = action.payload || state.navbar;
      AsyncStorage.setItem("navbar", state.navbar).catch(() => {});
    },

    toggleSemidark(state, action: PayloadAction<boolean | string | undefined>) {
      const val = action.payload === true || action.payload === "true";
      state.semidark = val;
      AsyncStorage.setItem("semidark", JSON.stringify(val)).catch(() => {});
    },

    toggleLocale(state, action: PayloadAction<string | undefined>) {
      state.locale = action.payload || state.locale;
      AsyncStorage.setItem("locale", state.locale).catch(() => {});
    },

    toggleSidebar(state) {
      state.sidebar = !state.sidebar;
    },
  },
});

export const {
  toggleTheme,
  toggleMenu,
  toggleLayout,
  toggleRTL,
  toggleAnimation,
  toggleNavbar,
  toggleSemidark,
  toggleLocale,
  toggleSidebar,
} = themeConfigSlice.actions;

export default themeConfigSlice.reducer;
