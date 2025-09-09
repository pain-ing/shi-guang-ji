# Decorations 指南（Sakura / Butterflies / Starlight）

本文档简述装饰系统的参数、默认值、性能建议与无障碍策略。

## 参数与默认值
- Sakura（樱花）
  - enabled: boolean (default: true)
  - density: number 10–150 (default: 40 at Provider，组件默认 30)
  - speed: number 0.5–2.0 (default: 1)
- Butterflies（蝴蝶）
  - butterfliesEnabled: boolean (default: false)
  - butterfliesCount: number 1–10 (default: 2)
- Starlight（星光）
  - starlightEnabled: boolean (default: false)
  - starlightDensity: number 10–100 (default: 20)

## 无障碍与自适应
- 当系统设置为“减少动态”（prefers-reduced-motion: reduce）时：
  - CSS 层面强制关闭动画
  - 运行时不创建节点（密度与数量置 0）
- 设备能力自适应：依据 deviceMemory 与触控特征（pointer: coarse）缩放密度与元素尺寸，确保流畅

## 性能建议
- 尽量使用 transform 动画，避免 layout/paint 级别的高成本操作
- 控制滤镜数量与强度；移动端可降低或禁用 drop-shadow/filter
- 避免无谓创建与销毁 DOM，使用 init/destroy 生命周期管理

## 结构与可维护性
- useSakuraDOM Hook 封装了 DOM 生成与清理逻辑；Sakura 组件本身只负责容器与参数传递
- Decoration 类型位于 src/components/decorations/types.ts，便于后续扩展其他装饰实现

## 路由范围控制（Provider）
- sakuraScope: 'all' | 'include' | 'exclude'
- sakuraPages: string[]（前缀匹配）
- 规则：
  - all：始终显示
  - include：仅当 pathname 以任一前缀开头时显示
  - exclude：当 pathname 以任一前缀开头时隐藏


