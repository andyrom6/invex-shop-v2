"use client"

import { motion } from "framer-motion"
import { Timer } from "lucide-react"

export const SaleBanner = () => {
  return (
    <div className="bg-black text-white overflow-hidden py-1.5 fixed top-0 left-0 right-0 z-50">
      <div className="flex whitespace-nowrap animate-scroll-x">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-8">
            <span className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              LIMITED TIME!
            </span>
            <span className="font-semibold">
              25% OFF WHOLE STORE
            </span>
            <span>|</span>
            <span className="font-semibold">
              50% OFF ALL SUPPLIER BUNDLE
            </span>
            <span>|</span>
            <span>
              INSTANT DELIVERY!
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
