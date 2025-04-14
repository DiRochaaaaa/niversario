'use client'

import { useState } from 'react'
import MiniKartGame from './MiniKartGame'

export default function MiniKartButton() {
  const [showGame, setShowGame] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowGame(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 hover:scale-110 z-50 flex items-center justify-center"
        aria-label="Jogar Mini Kart"
        title="Jogar Mini Kart"
      >
        <div className="w-10 h-10 relative">
          <img src="/miniKart/kart-icon.svg" alt="Mini Kart Game" width={40} height={40} />
        </div>
      </button>

      {showGame && <MiniKartGame onClose={() => setShowGame(false)} />}
    </>
  )
} 