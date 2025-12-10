// src/components/Icon/IconCaretDown.tsx
import React, { FC } from "react";
import Svg, { Path } from "react-native-svg";

interface IconCaretDownProps {
  className?: string;
  size?: number;
  color?: string;
}

const IconCaretDown: FC<IconCaretDownProps> = ({
  className,
  size = 16,
  color = "currentColor",
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <Path
        d="M19 9L12 15L5 9"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default IconCaretDown;
