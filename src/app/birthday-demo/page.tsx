"use client"

import { useState } from "react"
import { BirthdayBackgroundEffect } from "@/components/BirthdayBackgroundEffect"

export default function BirthdayBackgroundDemo() {
  const [variant, setVariant] = useState<'default' | 'celebration' | 'confirmation'>('default')

  return (
    <div className="relative min-h-screen">
      <BirthdayBackgroundEffect variant={variant} />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-xl mx-auto p-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white mb-8">
            Birthday Theme Background
          </h1>
          
          <div className="flex gap-3 justify-center mb-12">
            <button 
              onClick={() => setVariant('default')}
              className={`px-4 py-2 rounded-md text-white ${variant === 'default' ? 'ring-2 ring-white' : ''} bg-green-700 hover:bg-green-800`}
            >
              Default
            </button>
            <button 
              onClick={() => setVariant('celebration')}
              className={`px-4 py-2 rounded-md text-white ${variant === 'celebration' ? 'ring-2 ring-white' : ''} bg-green-500 hover:bg-green-600`}
            >
              Celebration
            </button>
            <button 
              onClick={() => setVariant('confirmation')}
              className={`px-4 py-2 rounded-md text-white ${variant === 'confirmation' ? 'ring-2 ring-white' : ''} bg-green-600 hover:bg-green-700`}
            >
              Confirmation
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg border border-green-800/30">
              <h3 className="text-xl font-bold text-green-400 mb-2">Birthday Invitation</h3>
              <p className="text-gray-300 mb-4">
                You're invited to celebrate my birthday! Join us for food, drinks, and fun.
              </p>
              <div className="flex justify-end">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                  RSVP Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 