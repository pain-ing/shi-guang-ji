"use client";

import React, { useState, useEffect } from "react";
import { useThemeStore } from "@/stores/themeStore";
import { usePathname } from "next/navigation";
import { OptimizedSakura } from "./OptimizedSakura";

const matchPath = (path: string, prefix: string) => {
  try {
    return path.startsWith(prefix);
  } catch {
    return false;
  }
};

export const OptimizedDecorationsProvider: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { decorations } = useThemeStore();
  const pathname = usePathname() || "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 基于 sakuraScope 的路由范围控制
  let show = decorations?.sakuraEnabled ?? true;
  if (show && decorations) {
    if (decorations.sakuraScope === 'include') {
      show = (decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    } else if (decorations.sakuraScope === 'exclude') {
      show = !(decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    }
  }

  if (!show) return null;

  const { butterfliesEnabled, butterfliesCount } = decorations?.surprises || {};

  return (
    <OptimizedSakura
      enabled={true}
      density={decorations?.sakuraDensity ?? 30}
      speed={decorations?.sakuraSpeed ?? 1}
      butterfliesEnabled={!!butterfliesEnabled}
      butterfliesCount={butterfliesCount ?? 2}
    />
  );
};
