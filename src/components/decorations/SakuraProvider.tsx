"use client";

import React from "react";
import { Sakura } from "@/components/decorations/Sakura";
import { useThemeStore } from "@/stores/themeStore";

export const SakuraProvider: React.FC = () => {
  const { decorations } = useThemeStore();
  return (
    <Sakura
      enabled={decorations.sakuraEnabled}
      density={decorations.sakuraDensity}
      speed={decorations.sakuraSpeed}
      zIndex={5}
    />
  );
};

