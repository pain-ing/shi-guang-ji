"use client";

import React from "react";
import { useThemeStore } from "@/stores/themeStore";
import { usePathname } from "next/navigation";
import { DecorationsHost } from "@/components/decorations/DecorationsHost";
import { createSakuraInitializer } from "@/components/decorations/createSakuraInitializer";

const matchPath = (path: string, prefix: string) => {
  try {
    return path.startsWith(prefix);
  } catch {
    return false;
  }
};

export const DecorationsProvider: React.FC = () => {
  const [mounted, setMounted] = React.useState(false);
  const { decorations } = useThemeStore();
  const pathname = usePathname() || "/";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 基于 sakuraScope 的路由范围控制（目前作为全局装饰开关范围）
  let show = decorations?.sakuraEnabled ?? true;
  if (show && decorations) {
    if (decorations.sakuraScope === 'include') {
      show = (decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    } else if (decorations.sakuraScope === 'exclude') {
      show = !(decorations.sakuraPages || []).some(p => matchPath(pathname, p));
    }
  }
  if (!show) return null;

  const { butterfliesEnabled, butterfliesCount, starlightEnabled, starlightDensity } = decorations?.surprises || {} as any;

  const inits = [] as Array<(container: HTMLElement) => void | (() => void)>;

  // Sakura 初始器（目前承载蝴蝶与星光子配置）
  inits.push(createSakuraInitializer({
    enabled: true,
    density: decorations?.sakuraDensity ?? 40,
    speed: decorations?.sakuraSpeed ?? 1,
    butterfliesEnabled: !!butterfliesEnabled,
    butterfliesCount: butterfliesCount ?? 2,
    starlightEnabled: !!starlightEnabled,
    starlightDensity: starlightDensity ?? 20,
  }));

  // 未来：可根据 store 配置再 push 其他装饰的 initializer

  return <DecorationsHost initializers={inits} zIndex={9999} />
};

