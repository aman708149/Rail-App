import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PnrDetailsModal from "./PnrDetailsModal"; // (Already converted)

interface Props {
  lastStatus: any;        // PNRStatusTypes (still valid)
  quota: string;
}

export default function LastBookingStatus({ lastStatus, quota }: Props) {
  const [modalPNRStatus, setModalPNRStatus] = useState(false);

  return (
    <View>
      {/* Button */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalPNRStatus(true)}
        className="bg-blue-600 px-4 py-2 rounded-lg"
      >
        <Text className="text-white font-bold text-center">Last Status</Text>
      </TouchableOpacity>

      {/* Modal */}
      <PnrDetailsModal
        modalPNRStatus={modalPNRStatus}
        setModalPNRStatus={setModalPNRStatus}
        pnrDetail={lastStatus}   // same logic
        quota={quota || ""}      // quota passed correctly
      />
    </View>
  );
}
