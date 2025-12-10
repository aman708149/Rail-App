import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ReduxProvider from "@/src/store/ReduxProvider";
import { store } from "@/src/store";
import { RoleProvider } from "@/src/context/RoleProvider";
import AuthWebSocketProvider from "@/src/context/authSocketGatewayProvider";
import WebSocketProvider from "@/src/context/transSocketgatewayProvider";
import Toast from "react-native-toast-message";
import { LogBox, View } from "react-native";
import Header from "./Header";
import DrawerLayout from "./(drawer)/_layout";   // <-- LOAD YOUR DRAWER HERE!


// Fix SafeAreaView warning globally
(View as any).SafeAreaView = SafeAreaView;

LogBox.ignoreLogs(["props.pointerEvents is deprecated"]);

export default function RootLayout() {
  const currentDateISO = new Date().toISOString();

  return (
    <SafeAreaProvider>
      <ReduxProvider store={store}>
        <RoleProvider currentDateISO={currentDateISO}>
          <AuthWebSocketProvider>
            <WebSocketProvider>
              <SafeAreaView style={{ flex: 1 }}>
                {/* ❗ Only one Stack (Expo Router auto-detects screens) */}
                {/* <Stack screenOptions={{ headerShown: false }} /> */}
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="auth" />    
                  <Stack.Screen name="(drawer)" />       
                </Stack>
                <Toast />
              </SafeAreaView>
            </WebSocketProvider>
          </AuthWebSocketProvider>
        </RoleProvider>
      </ReduxProvider>
    </SafeAreaProvider>
  );
}


