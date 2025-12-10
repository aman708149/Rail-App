import React from "react";
import { View } from "react-native";

export const TrainListSkeleton = () => {
    return (
        <View style={{ backgroundColor: "#0F172A", padding: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <View
                    key={i}
                    style={{
                        backgroundColor: "#1E293B",
                        marginVertical: 8,
                        borderRadius: 12,
                        padding: 15,
                    }}
                >
                    {/* top row */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ width: 80, height: 14, backgroundColor: "#334155", borderRadius: 6 }} />
                        <View style={{ width: 60, height: 14, backgroundColor: "#334155", borderRadius: 6 }} />
                        <View style={{ width: 100, height: 14, backgroundColor: "#334155", borderRadius: 6 }} />
                    </View>

                    {/* middle */}
                    <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 12 }}>
                        <View style={{ width: 120, height: 14, backgroundColor: "#334155", borderRadius: 6 }} />
                    </View>

                    {/* bottom */}
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
                        <View style={{ width: 50, height: 18, backgroundColor: "#334155", borderRadius: 6 }} />
                        <View style={{ width: 50, height: 18, backgroundColor: "#334155", borderRadius: 6 }} />
                        <View style={{ width: 50, height: 18, backgroundColor: "#334155", borderRadius: 6 }} />
                    </View>
                </View>
            ))}
        </View>
    );
};
