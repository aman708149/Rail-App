import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface IconUserProps {
  className?: string;
  fill?: boolean;
  size?: number;
}

const IconUser: React.FC<IconUserProps> = ({
  className,
  fill = false,
  size = 24,
}) => {
  return (
    <>
      {!fill ? (
        <Svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
        >
          <Circle
            cx="12"
            cy="6"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <Path
            opacity={0.5}
            d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </Svg>
      ) : (
        <Svg
          className={className}
          width={size}
          height={size}
          viewBox="0 0 18 18"
          fill="none"
        >
          <Circle cx="9" cy="4.5" r="3" fill="currentColor" />
          <Path
            opacity={0.5}
            d="M15 13.125C15 14.989 15 16.5 9 16.5C3 16.5 3 14.989 3 13.125C3 11.261 5.68629 9.75 9 9.75C12.3137 9.75 15 11.261 15 13.125Z"
            fill="currentColor"
          />
        </Svg>
      )}
    </>
  );
};

export default IconUser;
