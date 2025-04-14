"use client"

import { GridBackground } from "@/components/ui/grid-background"
import { useState } from "react"

export function GridBackgroundDemo() {
  const [colorVariant, setColorVariant] = useState<'green' | 'darker-green' | 'light-green'>('green')
  
  const colorVariants = {
    'green': {
      centerColor: "#15803d", // Green-700
      outerColor: "#000000",
      textGradient: "from-green-200 to-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    'darker-green': {
      centerColor: "#166534", // Green-800
      outerColor: "#000000",
      textGradient: "from-green-300 to-green-700",
      buttonColor: "bg-green-700 hover:bg-green-800"
    },
    'light-green': {
      centerColor: "#22c55e", // Green-500
      outerColor: "#111111",
      textGradient: "from-green-100 to-green-500",
      buttonColor: "bg-green-500 hover:bg-green-600"
    }
  }
  
  const currentVariant = colorVariants[colorVariant]

  return (
    <div className="relative min-h-screen">
      <GridBackground 
        centerColor={currentVariant.centerColor}
        outerColor={currentVariant.outerColor}
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-xl mx-auto p-8">
          <h2 className={`text-4xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-br ${currentVariant.textGradient} mb-8`}>
            Join Our Product Launch Waitlist
          </h2>
          
          <div className="flex gap-3 justify-center mt-8">
            <button 
              onClick={() => setColorVariant('green')}
              className={`px-4 py-2 rounded-md text-white ${colorVariant === 'green' ? 'ring-2 ring-white' : ''} bg-green-600 hover:bg-green-700`}
            >
              Green
            </button>
            <button 
              onClick={() => setColorVariant('darker-green')}
              className={`px-4 py-2 rounded-md text-white ${colorVariant === 'darker-green' ? 'ring-2 ring-white' : ''} bg-green-700 hover:bg-green-800`}
            >
              Dark Green
            </button>
            <button 
              onClick={() => setColorVariant('light-green')}
              className={`px-4 py-2 rounded-md text-white ${colorVariant === 'light-green' ? 'ring-2 ring-white' : ''} bg-green-500 hover:bg-green-600`}
            >
              Light Green
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 