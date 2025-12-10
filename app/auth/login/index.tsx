import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard, Alert, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native-paper";
import { authenticate, authenticateWithOtp } from "@/src/service/auth";
import "../../../global.css";
import { showMessage } from "@/src/utils/showMessage";
import { useRole } from "@/src/context/RoleProvider";

export default function LoginScreen() {
  const router = useRouter();
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTrustedDevice, setIsTrustedDevice] = useState(true);
  const [isDeviceMatched, setIsDeviceMatched] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isLogined, setIsLogined] = useState(false);
  const [resendOtpLimit, setResendOtpLimit] = useState(0);
  const [resendOtpTime, setResendOtpTime] = useState(0);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setIsCapsLockOn(false));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setIsCapsLockOn(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // const handleLogin = async () => {
  //   if (!userid || !password) return showMessage("Error", "Username and password are required.");
  //   setIsLoading(true);
  //   try {
  //     const response = await authenticate({ username: userid, password });

  //     if (response.message === "Device not matched") {
  //       setIsDeviceMatched(false);
  //       showMessage("OTP sent", "An OTP has been sent to your registered email.");
  //       return;
  //     }



  //     // await AsyncStorage.setItem("login-role", res.role);
  //     setIsLogined(true);

  //     await AsyncStorage.setItem("auth-token", response.token);
  //     await AsyncStorage.setItem("login-role", response.role);


  //     if (response.role === "admin") router.replace("/admin" as any);
  //     else if (response.role === "partner") router.replace("/partner" as any);
  //     else router.replace("/agent" as any);
  //   } catch (e: any) {
  //     showMessage("Login Error", e.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const { user } = useRole();

  const handleLogin = async () => {
    if (!userid || !password) return showMessage("Error", "Username and password are required.");
    setIsLoading(true);

    try {
      const response = await authenticate({ username: userid, password });

      if (response.message === "Device not matched") {
        setIsDeviceMatched(false);
        showMessage("OTP sent", "An OTP has been sent to your registered email.");
        return;
      }

      // Save token + role
      await AsyncStorage.setItem("auth-token", response.token);
      await AsyncStorage.setItem("login-role", response.role);

      // 🔥 Set role in Context


      // 🔥 Navigate to Drawer – not /admin /agent /partner
      if (response.role === "agent") {
        router.replace("/(drawer)/agent" as any);
      } else if (response.role === "admin") {
        router.replace("/(drawer)/admin" as any);
      } else {
        router.replace("/(drawer)/partner" as any);
      }

    } catch (e: any) {
      showMessage("Login Error", e.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleOtpSubmit = async () => {
    if (otp.length !== 6) return showMessage("Invalid OTP", "OTP must be 6 digits.");
    if (!userid || !password) return showMessage("Error", "Enter credentials first.");

    setOtpLoading(true);
    try {
      const response = await authenticateWithOtp({ username: userid, password, otp, isTrustedDevice });
      const res = await response.json();
      if (!response.ok) throw new Error(res.message || "Invalid OTP");

      await AsyncStorage.setItem("login-role", res.role);
      setIsLogined(true);

      if (res.role === "admin") router.push("/admin/dashboard");
      else if (res.role === "partner") router.push("/partner/dashboard");
      else router.push("/agent/dashboard");
    } catch (e: any) {
      showMessage("OTP Error", e.message);
    } finally {
      setOtpLoading(false);
    }
  };


  const handleResendOTP = () => {
    if (resendOtpLimit < 3) {
      setResendOtpLimit(resendOtpLimit + 1);
      setResendOtpTime(10);
      handleLogin();
    } else {
      showMessage("Limit reached", "You have reached the resend OTP limit.");
    }
  };

  useEffect(() => {
    let timer: number;
    if (resendOtpTime > 0) {
      timer = setTimeout(() => setResendOtpTime((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendOtpTime]);

  if (isLogined) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-white mt-3">Please wait...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/images/track-your-booking-in-real-time.jpg")} // Replace with your image path
      className="flex-1 justify-center items-center bg-gray-900/80"
      resizeMode="cover"
      blurRadius={2}
    >
      <View className="bg-[#0F172A]/90 w-11/12 md:w-1/3 rounded-2xl p-6 mb-44 shadow-2xl border border-white/10">
        <Text className="text-center text-2xl font-extrabold text-white mb-1">
          Welcome to Rail Agent
        </Text>
        <Text className="text-center text-gray-400 mb-5 text-sm">
          Enter Below Details To Login
        </Text>

        {isCapsLockOn && (
          <Text className="text-yellow-500 text-sm text-center mb-2">
            ⚠ Caps Lock is ON
          </Text>
        )}

        {/* Username */}
        <Text className="text-white text-sm mb-1">Username</Text>
        <TextInput
          placeholder="Enter your username"
          placeholderTextColor="#9CA3AF"
          value={userid}
          onChangeText={setUserid}
          editable={isDeviceMatched}
          className="bg-[#1E293B] text-white px-4 py-3 rounded-lg mb-3 border border-gray-600 focus:border-blue-500"
        />

        {/* Password */}
        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-white text-sm">Password</Text>
            <TouchableOpacity>
              <Text className="text-blue-400 text-xs italic">Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View className="relative">
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              editable={isDeviceMatched}
              className="bg-[#1E293B] text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 pr-10"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              <Text className="text-gray-300">{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OTP Flow */}
        {!isDeviceMatched ? (
          <>
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#9CA3AF"
              value={otp}
              onChangeText={(text) => text.length <= 6 && setOtp(text)}
              keyboardType="numeric"
              className="bg-[#1E293B] text-white px-4 py-3 rounded-lg mb-3 border border-gray-600 focus:border-blue-500"
            />

            <TouchableOpacity
              onPress={() => setIsTrustedDevice(!isTrustedDevice)}
              className="flex-row items-center mb-3"
            >
              <View
                className={`w-5 h-5 rounded border-2 ${isTrustedDevice ? "bg-blue-500 border-blue-600" : "border-gray-400"
                  }`}
              />
              <Text className="ml-2 text-gray-300 text-sm">Remember this device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={otpLoading}
              onPress={handleOtpSubmit}
              className="bg-green-600 py-3 rounded-lg flex-row justify-center items-center"
            >
              {otpLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">Submit OTP</Text>
              )}
            </TouchableOpacity>

            {resendOtpLimit < 3 && resendOtpTime <= 0 ? (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text className="text-blue-400 mt-3 text-center underline text-sm">
                  Resend OTP
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-red-400 mt-2 text-center text-sm">
                {resendOtpTime > 0
                  ? `Resend in ${resendOtpTime}s`
                  : resendOtpLimit >= 3
                    ? "Limit exceeded. Try later."
                    : ""}
              </Text>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              disabled={isLoading}
              onPress={handleLogin}
              className="bg-blue-600 py-3 rounded-lg flex-row justify-center items-center mt-2"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">Login</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ImageBackground>
  );
}
