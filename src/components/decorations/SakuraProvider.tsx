"use client";

import React from "react";
import { Sakura } from "@/components/decorations/Sakura";
import { useThemeStore } from "@/stores/themeStore";
import { usePathname } from "next/navigation";

const matchPath = (path: string, prefix: string) => {
  try {
    return path.startsWith(prefix);
  } catch {
    return false;
  }
};

export const SakuraProvider: React.FC = () => {
  const { decorations } = useThemeStore();
  const pathname = usePathname() || "/";

  console.log('SakuraProvider: decorations =', decorations);
  console.log('SakuraProvider: pathname =', pathname);

  let show = decorations.sakuraEnabled;
  if (show) {
    if (decorations.sakuraScope === 'include') {
      show = (decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    } else if (decorations.sakuraScope === 'exclude') {
      show = !(decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    }
  }

  console.log('SakuraProvider: show =', show);

  if (!show) return null;

  const { butterfliesEnabled, butterfliesCount, starlightEnabled, starlightDensity } = decorations.surprises || {} as any;

  return (
    <Sakura
      enabled={show}
      density={decorations.sakuraDensity}
      speed={decorations.sakuraSpeed}
      butterfliesEnabled={!!butterfliesEnabled}
      butterfliesCount={butterfliesCount ?? 2}
      starlightEnabled={!!starlightEnabled}
      starlightDensity={starlightDensity ?? 20}
      zIndex={5}
    />
  );
};

