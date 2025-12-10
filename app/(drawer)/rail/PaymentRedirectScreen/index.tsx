// ⛔ DO NOT PUT BookingReviewDetails CODE HERE

import React, { useEffect, useState } from "react";
import { View, Text, Platform, Linking } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";

export default function PaymentRedirectScreen() {
  const { formData } = useLocalSearchParams();
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    if (formData) {
      const parsed = typeof formData === "string" ? JSON.parse(formData) : formData;

      // 🧠 Auto Submit Form
      let html = `<form id="autoForm" method="POST" action="${parsed.actionUrl}">`;
      Object.keys(parsed).forEach((key) => {
        html += `<input type="hidden" name="${key}" value="${parsed[key]}" />`;
      });
      html += `
        </form>
        <script>document.getElementById('autoForm').submit();</script>
      `;
      setHtmlContent(html);

      // 🔗 Handle Web (NO WebView Support)
      if (Platform.OS === "web") {
        Linking.openURL(parsed.actionUrl); // 🧠 opens in browser
      }
    }
  }, [formData]);

  // ❌ WebView doesn't support Web platform
  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>⚠ WebView Not Supported on Web.</Text>
        <Text>Open on Android / iOS physical device 🚀</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {htmlContent !== "" && (
        <WebView
          source={{ html: htmlContent }}
          javaScriptEnabled
          originWhitelist={["*"]}
        />
      )}
    </View>
  );
}
