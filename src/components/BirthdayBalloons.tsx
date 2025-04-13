import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Balloons } from "@/components/ui/balloons"

export function BirthdayBalloons() {
  const balloonsRef = useRef<{ launchAnimation: () => void } | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Definir estado inicial
    handleResize()
    
    // Atualizar ao redimensionar
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLaunch = () => {
    if (balloonsRef.current) {
      balloonsRef.current.launchAnimation()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-6">      
      <Button 
        onClick={handleLaunch}
        className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-8 py-3 md:py-6 text-sm md:text-lg rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
      >
        <span className="animate-pulse">🎉</span>
        <span className="text-center">Clique para Comemorar!</span>
        <span className="animate-pulse">🎉</span>
      </Button>

      <Balloons 
        ref={balloonsRef}
        type={isMobile ? "default" : "text"}
        text={!isMobile ? "Parabéns Diego! 🏎️" : undefined}
        fontSize={60}
        color="#22c55e"
      />
    </div>
  )
} 