import { DecorationsProvider } from "@/components/decorations/DecorationsProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative">
      {/* 氛围装饰效果（统一管理，可在主题设置中开关与调节） */}
      <DecorationsProvider />
      {children}
    </div>
  )
}
