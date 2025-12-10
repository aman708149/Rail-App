import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import { useDispatch } from "react-redux";
import { TrainScheduleService } from "@/src/service/apiservice";
import { setArrivalCode, setBoardingAtCode, setDepartureCode } from "@/src/store/rail/train-route/trainRouteSlices";
import { handleAxiosError } from "@/src/utils/handleAxiosError";

export default function PnrDetailsModal({
  modalPNRStatus,
  setModalPNRStatus,
  pnrDetail,
  quota,
}: {
  modalPNRStatus: boolean;
  setModalPNRStatus: any;
  pnrDetail: any;
  quota: string | undefined;
}) {
  const [getScheduleModal, setGetScheduleModal] = useState<boolean>(false);
  const [trainSchedule, setTrainSchedule] = useState<any>();
  const dispatch = useDispatch();

  const GetTrainSchedule = async () => {
    try {
      const response = await TrainScheduleService(
        pnrDetail?.trainNumber,
        DateTime.fromISO(pnrDetail?.dateOfJourney).toFormat("yyyyMMdd"),
        pnrDetail?.sourceStation
      );

      if (response?.data) {
        setTrainSchedule(response.data);
        setGetScheduleModal(true);

        dispatch(setDepartureCode(pnrDetail?.sourceStation));
        dispatch(setArrivalCode(pnrDetail?.destinationStation));
        dispatch(setBoardingAtCode(pnrDetail?.boardingPoint));
      }
    } catch (error: any) {
      handleAxiosError(error);
    }
  };

  return (
    <Modal visible={modalPNRStatus} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center">

        {/* MODAL BODY */}
        <View className="bg-gray-900 w-[95%] h-[85%] rounded-2xl p-4">

          {/* HEADER */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg text-white font-semibold">
              Passenger Current Status Enquiry
            </Text>

            <TouchableOpacity onPress={() => setModalPNRStatus(false)}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* SCROLLABLE CONTENT */}
          <ScrollView className="flex-1">
            <View className="w-full">

              {/* PNR NUMBER */}
              <View className="bg-gray-800 p-3 rounded mb-3">
                <Text className="text-white text-sm">
                  PNR Number:{" "}
                  <Text className="text-green-500 font-bold">
                    {pnrDetail?.pnrNumber}
                  </Text>
                </Text>
              </View>

              {/* TRAIN DETAILS */}
              <View className="bg-gray-800 rounded p-3 mb-3">
                <Text className="text-white font-bold mb-2">Train Details</Text>
                <View className="flex flex-col gap-2">
                  <Text className="text-white text-sm">
                    Train Number: {pnrDetail?.trainNumber}
                  </Text>
                  <Text className="text-white text-sm">
                    Train Name: {pnrDetail?.trainName}
                  </Text>
                  <Text className="text-white text-sm">
                    Boarding Date:{" "}
                    {pnrDetail?.dateOfJourney
                      ? DateTime.fromISO(pnrDetail?.dateOfJourney).toFormat(
                          "d-L-yyyy"
                        )
                      : ""}
                  </Text>
                  <Text className="text-white text-sm">
                    From: {pnrDetail?.sourceStation}
                  </Text>
                  <Text className="text-white text-sm">
                    To: {pnrDetail?.destinationStation}
                  </Text>
                  <Text className="text-white text-sm">
                    Reserved Upto: {pnrDetail?.reservationUpto}
                  </Text>
                  <Text className="text-white text-sm">
                    Boarding Point: {pnrDetail?.boardingPoint}
                  </Text>
                  <Text className="text-white text-sm">
                    Class: {pnrDetail?.journeyClass}
                  </Text>
                </View>
              </View>

              {/* PASSENGER DETAILS */}
              <View className="bg-gray-800 rounded p-3 mb-3">
                <Text className="text-white font-bold mb-2">
                  Passenger Details
                </Text>
                {pnrDetail?.passengerList?.map((passenger: any, index: number) => (
                  <View key={index} className="bg-gray-700 rounded mb-2 p-2">
                    <Text className="text-white text-sm">
                      S. No: {passenger?.passengerSerialNumber}
                    </Text>
                    <Text className="text-white text-sm">
                      Age: {passenger?.passengerAge}
                    </Text>
                    <Text className="text-white text-sm">
                      Booking Status:{" "}
                      {`${passenger?.bookingStatus || ""}${
                        passenger?.bookingCoachId
                          ? `/${passenger?.bookingCoachId}`
                          : ""
                      }${
                        passenger?.bookingBerthNo
                          ? `/${passenger?.bookingBerthNo}`
                          : ""
                      }${
                        passenger?.bookingBerthCode
                          ? `/${passenger?.bookingBerthCode}`
                          : ""
                      }${quota ? `/${quota}` : ""}`}
                    </Text>
                    <Text className="text-white text-sm">
                      Current Status:{" "}
                      {[
                        passenger?.currentStatus,
                        passenger?.currentCoachId,
                        passenger?.currentBerthNo,
                        ...(passenger?.currentStatus?.includes("WL") ||
                        passenger?.currentStatus?.includes("TQWL") ||
                        passenger?.currentStatus?.includes("NOSB")
                          ? []
                          : [passenger?.currentBerthCode]),
                      ]
                        .filter((prop) => prop !== "0" && Boolean(prop))
                        .map((prop, i, arr) =>
                          arr.indexOf(prop) > 0 ? `/${prop}` : prop
                        )
                        .join("")}
                    </Text>
                  </View>
                ))}
              </View>

              {/* ADDITIONAL DETAILS */}
              <View className="bg-gray-800 rounded p-3 mb-16">
                <Text className="text-white font-bold mb-2">
                  Additional Details
                </Text>
                <Text className="text-white text-sm">
                  Total Fare: {pnrDetail?.bookingFare}
                </Text>
                <Text className="text-white text-sm">
                  Chart Status: {pnrDetail?.chartStatus}
                </Text>
                <Text className="text-white text-sm">
                  Train Status: {pnrDetail?.trainCancelStatus}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* ACTION BUTTONS */}
          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              onPress={GetTrainSchedule}
              className="bg-blue-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Get Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalPNRStatus(false)}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
