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
  const [mounted, setMounted] = React.useState(false);
  const { decorations } = useThemeStore();
  const pathname = usePathname() || "/";

  React.useEffect(() => {
    setMounted(true);
    console.log('SakuraProvider: mounted, decorations =', decorations);
  }, [decorations]);

  // 避免服务端渲染问题
  if (!mounted) {
    console.log('SakuraProvider: not mounted yet');
    return null;
  }

  console.log('SakuraProvider: decorations =', decorations);
  console.log('SakuraProvider: pathname =', pathname);

  let show = decorations?.sakuraEnabled ?? true;
  if (show && decorations) {
    if (decorations.sakuraScope === 'include') {
      show = (decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    } else if (decorations.sakuraScope === 'exclude') {
      show = !(decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    }
  }

  console.log('SakuraProvider: show =', show);

  if (!show) return null;

  const { butterfliesEnabled, butterfliesCount, starlightEnabled, starlightDensity } = decorations?.surprises || {} as any;

  return (
    <Sakura
      enabled={show}
      density={decorations?.sakuraDensity ?? 40}
      speed={decorations?.sakuraSpeed ?? 1}
      butterfliesEnabled={!!butterfliesEnabled}
      butterfliesCount={butterfliesCount ?? 2}
      starlightEnabled={!!starlightEnabled}
      starlightDensity={starlightDensity ?? 20}
      zIndex={5}
    />
  );
};

