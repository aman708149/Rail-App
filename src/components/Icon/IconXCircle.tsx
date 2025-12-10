import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { View } from "react-native";

interface IconXCircleProps {
  className?: string;
  size?: number;
  color?: string;
}

const IconXCircle: React.FC<IconXCircleProps> = ({
  className,
  size = 20,
  color = "currentColor",
}) => {
  return (
    <View className={className}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle
          opacity="0.5"
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="1.5"
        />
        <Path
          d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

export default IconXCircle;
