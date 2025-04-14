"use client"

import * as React from "react"

interface GridBackgroundProps {
  centerColor?: string
  outerColor?: string
  gridOpacity?: number
}

export function GridBackground({
  centerColor = "#15803d", // Green-700 from your palette
  outerColor = "#000000",
  gridOpacity = 0.02
}: GridBackgroundProps = {}) {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(circle at center, ${centerColor}, ${outerColor})`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,${gridOpacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,${gridOpacity}) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  )
} 