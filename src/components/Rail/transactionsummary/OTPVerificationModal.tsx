import React, { useState, useEffect } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { DateTime } from "luxon";
import { formatNumberToSouthAsian } from "@/src/utils/Number";

interface OTPVerificationModalProps {
    isOpen: boolean;
    toggle: () => void;
    mobile: string;
    messageInfo: string;
    cancellationId: string;
    railCancellation: {
        cancellationid: string;
        OTPStatus: boolean;
        pnrNo: string;
        RefundStatus: boolean;
        cancelledDate: string;
        totalRefundAmount: number;
    }[];
    pnrNumber?: string;
    handleResendOTP: () => void;
    handleVerifyOTP: (otp: string) => void;
    timeLeftnumber: number;
    isDisabled: boolean;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
    isOpen,
    toggle,
    mobile,
    cancellationId,
    railCancellation,
    pnrNumber,
    handleResendOTP,
    handleVerifyOTP,
    timeLeftnumber,
    isDisabled,
    messageInfo,
}) => {
    const [otpCode, setOtpCode] = useState("");
    const [alreadyVerified, setAlreadyVerified] = useState(false);

    useEffect(() => {
        setOtpCode("");
    }, [isOpen]);

    return (
        <Modal visible={isOpen} transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-center items-center px-4">
                <View className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-4 shadow-lg">

                    {/* Header */}
                    <View className="flex-row justify-between items-center pb-2">
                        <Text className="text-lg font-semibold dark:text-white">
                            OTP Verification for Refund
                        </Text>
                        <TouchableOpacity onPress={toggle}>
                            <Ionicons name="close" size={24} color="white" style={{ marginLeft: 10 }} />
                        </TouchableOpacity>
                    </View>

                    {/* Modal Body */}
                    <ScrollView className="max-h-[60%]">
                        {railCancellation?.length > 0 && (
                            railCancellation.map((item) =>
                                item.cancellationid === cancellationId ? (
                                    <View key={item.cancellationid} className="mt-2">
                                        {/* Row */}
                                        <View className="flex-row justify-between">
                                            <Text className="text-white">PNR Number:</Text>
                                            <Text className="text-green-500">
                                                {pnrNumber || item?.pnrNo}
                                            </Text>
                                        </View>

                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-white">Cancelled Date:</Text>
                                            <Text className="text-green-500">
                                                {DateTime.fromISO(item.cancelledDate).toFormat("dd-LLL-yyyy 'at' hh:mm")}
                                            </Text>
                                        </View>

                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-white">Cancellation ID:</Text>
                                            <Text className="text-green-500">{item.cancellationid}</Text>
                                        </View>

                                        <View className="flex-row justify-between mt-1">
                                            <Text className="text-white">Refund Amount:</Text>
                                            <Text className="text-green-500">
                                                ₹ {item?.totalRefundAmount
                                                    ? formatNumberToSouthAsian(item?.totalRefundAmount)
                                                    : "0.00"}
                                            </Text>
                                        </View>
                                    </View>
                                ) : null
                            )
                        )}

                        {/* Message Info */}
                        {messageInfo && (
                            <View className="p-3 bg-gray-800 rounded-md mt-3">
                                <Text className="text-yellow-500 text-center">{messageInfo}</Text>
                            </View>
                        )}

                        {/* OTP Input */}
                        {!alreadyVerified && (
                            <View className="mt-3">
                                <Text className="text-center text-white mb-2">
                                    <Text className="text-center text-white mb-2">
                                        {mobile ? `Enter OTP sent to Mobile Number ${mobile}` : ""}
                                    </Text>
                                </Text>
                                <TextInput
                                    placeholder="Enter OTP"
                                    value={otpCode}
                                    onChangeText={setOtpCode}
                                    keyboardType="numeric"
                                    className="bg-gray-700 text-white px-4 py-2 rounded-lg"
                                />
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View className="mt-4">

                        {!alreadyVerified ? (
                            <>
                                {/* Resend OTP Button */}
                                <TouchableOpacity
                                    disabled={isDisabled}
                                    onPress={() => {
                                        handleResendOTP();
                                        setOtpCode("");
                                    }}
                                >
                                    <Text
                                        className={`text-sm text-center ${isDisabled ? "text-gray-400" : "text-blue-400 underline"
                                            }`}
                                    >
                                        {isDisabled
                                            ? `Resend OTP in ${Math.floor(timeLeftnumber / 60)}:${timeLeftnumber % 60 < 10 ? `0${timeLeftnumber % 60}` : timeLeftnumber % 60}`
                                            : "Resend OTP"}
                                    </Text>
                                </TouchableOpacity>

                                {/* Buttons */}
                                <View className="flex-row justify-between mt-3">
                                    <TouchableOpacity
                                        onPress={() => handleVerifyOTP(otpCode)}
                                        disabled={!otpCode}
                                        className={`${!otpCode ? "bg-gray-600" : "bg-green-500"
                                            } py-2 px-4 rounded-lg`}
                                    >
                                        <Text className="text-white font-bold">Verify</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={toggle}
                                        className="bg-red-500 py-2 px-4 rounded-lg"
                                    >
                                        <Text className="text-white font-bold">Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View className="flex-row justify-between mt-3">
                                <TouchableOpacity
                                    onPress={() => handleVerifyOTP("12345")}
                                    className="bg-blue-600 py-2 px-4 rounded-lg"
                                >
                                    <Text className="text-white font-bold">Initiate Refund</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={toggle}
                                    className="bg-red-500 py-2 px-4 rounded-lg"
                                >
                                    <Text className="text-white font-bold">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Checkbox */}
                        <View className="flex-row items-center mt-4">
                            <Checkbox
                                value={alreadyVerified}
                                onValueChange={setAlreadyVerified}
                                className="mr-2"
                            />
                            <Text className="text-yellow-400">I have Already Verified OTP</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default OTPVerificationModal;
