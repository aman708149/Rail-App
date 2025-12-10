import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";     // 👈 replacing ImInfo & tooltip
import { showMessage } from "@/src/utils/showMessage";  // 👈 instead of toast
import PnrDetailsModal from "./PnrDetailsModal";        // (Already converted)
import { GetPNrDetailsService } from "@/src/service/apiservice";
import { handleAxiosError } from "@/src/utils/handleAxiosError";

export default function PnrStatusCheck({
  pnrNumber,
  quota,
}: {
  pnrNumber: string;
  quota: string;
}) {
  const [modalPNRStatus, setModalPNRStatus] = useState<boolean>(false);
  const [pnrDetail, setPnrDetail] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);

  const GetPNrDetail = async () => {
    try {
      setLoading(true);
      const response = await GetPNrDetailsService(pnrNumber);

      if (
        (response?.status === 200 || response?.status === 201) &&
        !response?.data?.errorMessage
      ) {
        setPnrDetail(response.data);
        setModalPNRStatus(true);
      } else {
        showMessage("Error", response?.data?.errorMessage || "Something went wrong");
      }
    } catch (error: any) {
      handleAxiosError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {/* Button */}
      <TouchableOpacity
        onPress={GetPNrDetail}
        activeOpacity={0.7}
        className="bg-gray-700 px-4 py-2 rounded-lg flex-row items-center justify-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            {/* Icon like ImInfo */}
            <Ionicons name="information-circle" size={20} color="white" />
            <Text className="text-white ml-2">PNR Status</Text>
          </>
        )}
      </TouchableOpacity>

      {/* MODAL (Already converted earlier) */}
      <PnrDetailsModal
        modalPNRStatus={modalPNRStatus}
        setModalPNRStatus={setModalPNRStatus}
        pnrDetail={pnrDetail}
        quota={quota}
      />
    </View>
  );
}
