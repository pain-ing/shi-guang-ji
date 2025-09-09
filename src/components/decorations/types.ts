export interface DecorationInstance {
  init(container: HTMLElement): void;
  destroy(): void;
}

export interface SakuraConfig {
  enabled?: boolean;
  density?: number; // 10 - 150
  speed?: number; // 0.5 - 2.0
  butterfliesEnabled?: boolean;
  butterfliesCount?: number; // 1 - 10
  starlightEnabled?: boolean;
  starlightDensity?: number; // 10 - 100
}

