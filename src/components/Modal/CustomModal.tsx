import React, { JSX, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";

/* --------------------------------------------------
   CUSTOM LOADING BUTTON (Tailwind Styled)
---------------------------------------------------*/
const LoadingButton = ({
  text,
  loading,
  onPress,
  disabled,
  icon,
}: {
  text: string;
  loading: boolean;
  onPress?: () => void;
  disabled?: boolean;
  icon?: JSX.Element;
}) => (
  <TouchableOpacity
    disabled={disabled || loading}
    onPress={onPress}
    className={`bg-blue-600 flex-row items-center px-4 py-2 rounded-lg 
      ${disabled || loading ? "opacity-50" : ""}`}
  >
    {loading ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : (
      <>
        {icon}
        <Text className="text-white font-semibold ml-1">{text}</Text>
      </>
    )}
  </TouchableOpacity>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  onThirdButtonClick?: () => void;
  confirmText?: string;
  cancelText?: string;
  thirdButtonText?: string;
  confirmIcon?: JSX.Element;
  thirdButtonIcon?: JSX.Element;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  showThirdButton?: boolean;
  btnloading?: boolean;
  disableConfirmButton?: boolean;
  disableThirdButton?: boolean;
  size?: number;
  title: string;
  children?: React.ReactNode;
  outSideClick?: boolean;
  centered?: boolean;
}

/* --------------------------------------------------
                       MODAL
---------------------------------------------------*/
const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  onThirdButtonClick,
  confirmText = "Confirm",
  cancelText = "Cancel",
  thirdButtonText,
  confirmIcon,
  thirdButtonIcon,
  showConfirmButton = true,
  showCancelButton = true,
  showThirdButton = false,
  btnloading = false,
  disableConfirmButton = false,
  disableThirdButton = false,
  size = 350,
  title,
  children,
  outSideClick = true,
  centered = false,
}) => {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(scale, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [isOpen]);

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      {/* BACKDROP */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => outSideClick && onClose()}
        className="absolute inset-0 bg-black/80"
      />

      {/* WRAPPER */}
      <View
        className={`flex-1 items-center px-4 ${
          centered ? "justify-center" : "pt-12"
        }`}
      >
        <Animated.View
          style={{ width: size, transform: [{ scale }], opacity }}
          className="bg-white dark:bg-[#0B1220] rounded-2xl shadow-xl overflow-hidden"
        >
          {/* HEADER */}
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-300 dark:border-gray-700">
            <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-400 text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View className="max-h-[420px] p-4">{children}</View>

          {/* FOOTER */}
          <View className="flex-row justify-end gap-3 px-4 pb-4 pt-2 bg-gray-200 dark:bg-gray-900 rounded-b-xl">

            {/* THIRD BUTTON */}
            {showThirdButton && (
              <TouchableOpacity
                onPress={onThirdButtonClick}
                disabled={disableThirdButton}
                className={`bg-red-600 px-3 py-2 rounded-lg flex-row items-center ${
                  disableThirdButton ? "opacity-50" : ""
                }`}
              >
                {thirdButtonIcon}
                <Text className="text-white font-semibold ml-1">
                  {thirdButtonText}
                </Text>
              </TouchableOpacity>
            )}

            {/* CANCEL BUTTON */}
            {showCancelButton && (
              <TouchableOpacity
                onPress={onCancel || onClose}
                className="border border-red-600 px-3 py-2 rounded-lg"
              >
                <Text className="text-red-600 font-semibold">{cancelText}</Text>
              </TouchableOpacity>
            )}

            {/* CONFIRM BUTTON */}
            {showConfirmButton && (
              <LoadingButton
                text={confirmText}
                loading={btnloading}
                disabled={disableConfirmButton}
                onPress={onConfirm}
                icon={confirmIcon}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CustomModal;
