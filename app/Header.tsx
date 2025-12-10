// Header.tsx
import React from "react";
import { View } from "react-native";

import { useRole } from "@/src/context/RoleProvider";
import AdminHeader from "./(drawer)/admin/AdminHeader";
import PartnerHeader from "./(drawer)/partner/PartnerHeader";
import RailHeader from "./(drawer)/agent/RailHeader";


export default function Header() {
  const { user } = useRole();

  return (
    <View className="w-full bg-white dark:bg-gray-900 shadow-md flex-row items-center justify-between">
      {/* Render header based on user role */}
      {user?.role === "admin" ? (
        <AdminHeader />
      ) : user?.role === "partner" ? (
        <PartnerHeader />
      ) : (
        <RailHeader />
      )}
    </View>
  );
}
