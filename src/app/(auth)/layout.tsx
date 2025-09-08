import { SakuraProvider } from "@/components/decorations/SakuraProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen relative">
      {/* 樱花飘落效果 */}
      <SakuraProvider />
      {children}
    </div>
  )
}
