// src/components/Icon.tsx
import React, { useEffect, useState } from "react";
import { loadIcons } from "@/src/utils/icons";

type IconProps = {
  name: string;
  color?: string;
  size?: number;
  className?: string; // works with NativeWind
};

export function Icon({ name, color = "black", size = 24, className }: IconProps) {
  const [Icons, setIcons] = useState<any>(null);

  useEffect(() => {
    loadIcons().then(setIcons);
  }, []);

  if (!Icons) return null;

  const IconComp = Icons[name];
  if (!IconComp) return null;

  return <IconComp color={color} size={size} className={className} />;
}
