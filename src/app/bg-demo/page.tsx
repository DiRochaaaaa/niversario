import { GridBackgroundDemo } from "@/components/ui/grid-background-demo"

// Forçar renderização dinâmica para evitar problemas de pré-renderização com o Supabase
export const dynamic = 'force-dynamic'

export default function BackgroundDemoPage() {
  return <GridBackgroundDemo />
} 