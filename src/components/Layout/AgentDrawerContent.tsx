// src/components/Layout/AgentDrawerContent.tsx

import React, { useState } from "react";
import { useRouter } from "expo-router";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { railMenu } from "@/src/constants/railMenu";

export default function AgentDrawerContent() {
  const [railOpen, setRailOpen] = useState(false);
  const router = useRouter();

  return (
    <DrawerContentScrollView>
      {/* MAIN MENU BUTTON */}
      <TouchableOpacity
        onPress={() => setRailOpen(!railOpen)}
        style={{ flexDirection: "row", alignItems: "center", padding: 12 }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Rail</Text>
        {railOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </TouchableOpacity>

      {/* RAIL SUBMENU */}
      {railOpen &&
        railMenu.map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route as any)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingLeft: 20,
              paddingVertical: 8,
              gap: 8,
            }}
          >
            <item.icon size={18} />
            <Text>{item.title}</Text>
          </TouchableOpacity>
        ))}
    </DrawerContentScrollView>
  );
}
