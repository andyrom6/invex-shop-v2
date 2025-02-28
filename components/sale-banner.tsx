"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Timer } from "lucide-react"
import { SaleBannerData } from "@/app/api/sale-banner/route"

interface SaleBannerProps {
  data?: SaleBannerData;
  className?: string;
}

export const SaleBanner = ({ data, className }: SaleBannerProps) => {
  const [bannerData, setBannerData] = useState<SaleBannerData | null>(data || null)
  const [loading, setLoading] = useState(!data)
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    // If data is provided via props, use it instead of fetching
    if (data) {
      setBannerData(data);
      setLoading(false);
      return;
    }

    const fetchBannerData = async () => {
      try {
        const response = await fetch("/api/sale-banner")
        if (response.ok) {
          const data = await response.json()
          setBannerData(data)
        }
      } catch (error) {
        console.error("Error fetching sale banner data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBannerData()
  }, [data])

  // Update banner data when props change
  useEffect(() => {
    if (data) {
      setBannerData(data);
    }
  }, [data]);

  // Calculate time left if endDate is provided
  useEffect(() => {
    if (!bannerData?.endDate || !bannerData.showTimer) return

    const calculateTimeLeft = () => {
      const difference = new Date(bannerData.endDate!).getTime() - new Date().getTime()
      
      if (difference <= 0) {
        setTimeLeft("ENDED")
        return
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute
    
    return () => clearInterval(timer)
  }, [bannerData])

  if (loading || !bannerData || !bannerData.enabled) {
    return null
  }

  return (
    <div 
      className={`py-1.5 overflow-hidden ${!className ? 'fixed top-0 left-0 right-0 z-50' : className}`}
      style={{ 
        backgroundColor: bannerData.backgroundColor,
        color: bannerData.textColor
      }}
    >
      <div className="flex whitespace-nowrap animate-scroll-x">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 mx-8">
            {bannerData.showTimer && (
              <span className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                {timeLeft ? `ENDS IN: ${timeLeft}` : "LIMITED TIME!"}
              </span>
            )}
            
            {bannerData.messages.map((message, index) => (
              <React.Fragment key={`message-${index}`}>
                <span className="font-semibold">
                  {message}
                </span>
                {index < bannerData.messages.length - 1 && <span>|</span>}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
