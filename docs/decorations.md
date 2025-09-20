# Decorations 指南（Sakura / Butterflies / Starlight）

本文档简述装饰系统的参数、默认值、性能建议与无障碍策略，并给出统一管理器的使用方式。

## 参数与默认值（表格）
- Sakura（樱花）
  - enabled: boolean（默认 true）
  - density: 10–150（默认 Provider 40，组件默认 30）
  - speed: 0.5–2.0（默认 1）
- Butterflies（蝴蝶）
  - butterfliesEnabled: boolean（默认 false）
  - butterfliesCount: 1–10（默认 2）
- Starlight（星光）
  - starlightEnabled: boolean（默认 false）
  - starlightDensity: 10–100（默认 20）

## 无障碍与自适应
- 系统减少动态（prefers-reduced-motion: reduce）：
  - CSS 层面关闭动画；运行时不创建节点（密度=0）
- 设备能力自适应：依据 deviceMemory 与触控特征（pointer: coarse）缩放密度与尺寸

## 性能建议
- 优先使用 transform；限制昂贵滤镜
- 按需加载与懒挂载；避免无谓的 DOM 创建/销毁

## 结构与可维护性
- useSakuraDOM：封装 DOM 生成与清理
- mountSakura：提供纯函数挂载能力，便于复用
- 统一管理器：useDecorationManager + DecorationsHost + createSakuraInitializer

### 统一管理器用法
示例：在某页面/布局中组合多个装饰（未来可扩展）

```tsx
import { DecorationsHost } from '@/components/decorations/DecorationsHost'
import { createSakuraInitializer } from '@/components/decorations/createSakuraInitializer'

export default function Page() {
  const inits = [
    createSakuraInitializer({ enabled: true, density: 40, speed: 1, butterfliesEnabled: true, butterfliesCount: 2, starlightEnabled: false })
  ]
  return <DecorationsHost initializers={inits} />
}
```

## 路由范围控制（SakuraProvider）
- sakuraScope: 'all' | 'include' | 'exclude'
- sakuraPages: string[]（前缀匹配）
- 规则：
  - all：始终显示
  - include：仅当 pathname 以任一前缀开头时显示
  - exclude：当 pathname 以任一前缀开头时隐藏


