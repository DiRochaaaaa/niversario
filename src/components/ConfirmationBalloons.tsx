import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react"
import { Balloons } from "@/components/ui/balloons"

export interface ConfirmationBalloonsHandle {
  launchConfirmationBalloons: () => void;
}

interface ConfirmationBalloonsProps {
  // You can add props here if needed in the future
}

export const ConfirmationBalloons = forwardRef<ConfirmationBalloonsHandle, ConfirmationBalloonsProps>(
  (props, ref) => {
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

    // Função para lançar balões quando chamada externamente
    const launchConfirmationBalloons = () => {
      if (balloonsRef.current) {
        balloonsRef.current.launchAnimation()
      }
    }

    // Expondo a função para o componente pai
    useImperativeHandle(ref, () => ({
      launchConfirmationBalloons
    }), [])

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        <Balloons 
          ref={balloonsRef}
          type={isMobile ? "default" : "text"}
          text={!isMobile ? "Confirmado! 🎉" : undefined}
          fontSize={60}
          color="#22c55e"
          className="w-full h-full"
        />
      </div>
    )
  }
)

ConfirmationBalloons.displayName = "ConfirmationBalloons"

// Singleton para acesso global
let confirmationBalloonsInstance: ConfirmationBalloonsHandle | null = null;

export function setConfirmationBalloonsInstance(instance: ConfirmationBalloonsHandle) {
  confirmationBalloonsInstance = instance;
}

export function launchConfirmationBalloons() {
  if (confirmationBalloonsInstance) {
    confirmationBalloonsInstance.launchConfirmationBalloons();
  }
} 