import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    View,
    Pressable,
    Animated,
    StyleSheet,
    Dimensions,
    TouchableOpacity
} from "react-native";

const { height } = Dimensions.get("window");
const SHEET_HEIGHT = height * 0.95;

// ✅ FIXED: Add props type
interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function BottomSheetModal({
    visible,
    onClose,
    children
}: BottomSheetProps) {
    const slideAnim = React.useRef(new Animated.Value(SHEET_HEIGHT)).current;

    React.useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? 0 : SHEET_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            {/* BACKDROP */}
            <Pressable style={styles.backdrop} onPress={onClose} />

            {/* BOTTOM SHEET */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        height: SHEET_HEIGHT,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* TOP-RIGHT CLOSE BUTTON */}
                <TouchableOpacity
                    onPress={onClose}
                    className="absolute top-3 right-3 p-2 z-50"
                >
                    <Ionicons name="close" size={26} color="#fff" />
                </TouchableOpacity>

                {/* CONTENT WRAPPER (keeps your original padding) */}
                 <View style={styles.dragHandle} />

                {children}
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#0F172A",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 2,
    },
    dragHandle: {
        width: 50,
        height: 5,
        backgroundColor: "#64748B",
        borderRadius: 5,
        alignSelf: "center",
        marginBottom: 12,
        marginTop: 6,
    },
});
