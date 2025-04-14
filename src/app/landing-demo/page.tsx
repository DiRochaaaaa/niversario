"use client"

import { GridBackground } from "@/components/ui/grid-background"
import { useState } from "react"

// Forçar renderização dinâmica para evitar problemas de pré-renderização com o Supabase
export const dynamic = 'force-dynamic'

export default function LandingDemo() {
  const [email, setEmail] = useState("")
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Thank you for joining our waitlist with email: ${email}`)
    setEmail("")
  }
  
  return (
    <div className="relative min-h-screen">
      <GridBackground 
        centerColor="#15803d"
        outerColor="#000000"
        gridOpacity={0.03}
      />
      
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="py-4 px-6 flex justify-between items-center">
          <div className="text-green-500 font-bold text-2xl">Eco Products</div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-green-300 transition">About</a>
            <a href="#" className="text-white hover:text-green-300 transition">Features</a>
            <a href="#" className="text-white hover:text-green-300 transition">Contact</a>
          </div>
        </nav>
        
        {/* Hero section */}
        <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-200 to-green-600 mb-4">
            Sustainable Tomorrow
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Join our waitlist to be the first to experience our eco-friendly products 
            that will revolutionize your daily routine while protecting our planet.
          </p>
          
          {/* Waitlist form */}
          <form onSubmit={handleSubmit} className="w-full max-w-md">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 rounded-md bg-black/50 border border-green-700/50 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition duration-200"
              >
                Join Waitlist
              </button>
            </div>
          </form>
          
          {/* Features section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl">
            {[
              {
                title: "Eco-Friendly",
                description: "All products made from sustainable materials with zero waste packaging.",
              },
              {
                title: "Carbon Neutral",
                description: "Our manufacturing process is 100% carbon neutral, protecting our environment.",
              },
              {
                title: "Fair Trade",
                description: "Supporting ethical labor practices and fair compensation for workers.",
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg bg-black/30 backdrop-blur-sm border border-green-800/30">
                <h3 className="text-xl font-bold text-green-400 mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 