"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { balloons, textBalloons } from "balloons-js"

export interface BalloonsProps {
  type?: "default" | "text"
  text?: string
  fontSize?: number
  color?: string
  className?: string
  onLaunch?: () => void
}

interface BalloonsRef {
  launchAnimation: () => void
}

const Balloons = React.forwardRef<BalloonsRef, BalloonsProps>(
  ({ type = "default", text, fontSize = 120, color = "#000000", className, onLaunch }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    
    // Verificar se está em mobile de forma simples
    const isMobile = React.useMemo(() => {
      return typeof window !== 'undefined' && window.innerWidth < 768
    }, [])

    const launchAnimation = React.useCallback(() => {
      // Abordagem simplificada para reduzir bugs
      if (type === "default") {
        // Em dispositivos móveis, lançar vários balões para um bom efeito visual
        balloons()
        
        // Usar setTimeout para criar uma sequência de balões
        setTimeout(() => balloons(), 100)
        
        // Em desktop, lançar uma terceira vez para mais balões
        if (!isMobile) {
          setTimeout(() => balloons(), 200)
        }
      } else if (type === "text" && text) {
        // Balões de texto apenas em desktop
        textBalloons([{ text, fontSize, color }])
      }
      
      if (onLaunch) {
        onLaunch()
      }
    }, [type, text, fontSize, color, onLaunch, isMobile])

    React.useImperativeHandle(ref, () => ({
      launchAnimation
    }), [launchAnimation])

    return <div ref={containerRef} className={cn("balloons-container", className)} />
  }
)
Balloons.displayName = "Balloons"

export { Balloons } 