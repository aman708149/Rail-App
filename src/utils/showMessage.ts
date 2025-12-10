// utils/showMessage.ts
import { Alert, Platform } from "react-native";
import Toast from 'react-native-toast-message';

export const showMessage = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    Toast.show({
      type: title === "Error" ? "error" : "success",
      text1: title,
      text2: message || "",
    });
  } else {
    Alert.alert(title, message);
  }
};
