"use client"

import * as React from "react"
import { GridBackground } from "./ui/grid-background"

interface BirthdayBackgroundEffectProps {
  variant?: 'default' | 'celebration' | 'confirmation'
}

export function BirthdayBackgroundEffect({ 
  variant = 'default'
}: BirthdayBackgroundEffectProps) {
  // Each variant has a different color scheme that matches the theme
  const variants = {
    default: {
      centerColor: "#15803d", // Green-700
      outerColor: "#000000",
      gridOpacity: 0.02
    },
    celebration: {
      centerColor: "#22c55e", // Green-500 (brighter for celebration)
      outerColor: "#052e16", // Green-950 (dark green instead of black)
      gridOpacity: 0.03
    },
    confirmation: {
      centerColor: "#16a34a", // Green-600
      outerColor: "#000000",
      gridOpacity: 0.025
    }
  }

  const currentVariant = variants[variant]

  return (
    <GridBackground 
      centerColor={currentVariant.centerColor}
      outerColor={currentVariant.outerColor}
      gridOpacity={currentVariant.gridOpacity}
    />
  )
} 