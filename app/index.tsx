

// // app/index.tsx
// import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
// import { useRouter } from "expo-router";

// export default function App() {
//   const router = useRouter();

//   return (
//     <ImageBackground
//       source={require("../assets/images/track-your-booking-in-real-time.jpg")} // <-- add your background image here
//       resizeMode="cover"
//       className="flex-1"
//     >
//       <View className="flex-1 bg-black/50 items-center justify-center px-6">
//         <Text className="text-2xl md:text-3xl font-extrabold text-white text-center mb-3">
//           Next Generation Train Ticket Booking
//         </Text>

//         <Text className="text-sm text-gray-200 text-center mb-1">
//           Experience seamless, fast, and intelligent train ticket booking with
//           our next-gen platform.
//         </Text>

//         <Text className="text-sm text-gray-200 text-center mb-6">
//           Plan your journey effortlessly with real-time tracking and smart
//           recommendations.
//         </Text>

//         <TouchableOpacity
//           className="bg-indigo-600 px-6 py-3 rounded-lg"
//           onPress={() => router.push("/auth/login" as any)}
//         >
//           <Text className="text-white font-semibold text-base">
//             Login Now
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ImageBackground>
//   );
// }


import { View, Text, ImageBackground, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function App() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth-token");
        const role = await AsyncStorage.getItem("login-role");

        // ----------------------------------
        // 🔥 If user logged in → redirect
        // ----------------------------------
        if (token && role) {
          if (role === "admin") {
            router.replace("/admin");
          } else if (role === "agent") {
            router.replace("/agent");
          } else if (role === "partner") {
            router.replace("/partner");
          }
          return; 
        }

      } catch (err) {
        console.log("AsyncStorage error:", err);
      }

      // No token → show landing screen
      setChecking(false);
    };

    checkAuth();
  }, []);

  // -----------------------------------------
  // ⏳ Loading screen while checking storage
  // -----------------------------------------
  if (checking) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // ----------------------------------------------
  // ⭐ No token → show your landing UI
  // ----------------------------------------------
  return (
    <ImageBackground
      source={require("../assets/images/track-your-booking-in-real-time.jpg")}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <Text className="text-2xl md:text-3xl font-extrabold text-white text-center mb-3">
          Next Generation Train Ticket Booking
        </Text>

        <Text className="text-sm text-gray-200 text-center mb-1">
          Experience seamless, fast, and intelligent train ticket booking with
          our next-gen platform.
        </Text>

        <Text className="text-sm text-gray-200 text-center mb-6">
          Plan your journey effortlessly with real-time tracking and smart
          recommendations.
        </Text>

        <TouchableOpacity
          className="bg-indigo-600 px-6 py-3 rounded-lg"
          onPress={() => router.push("/auth/login")}
        >
          <Text className="text-white font-semibold text-base">Login Now</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}


