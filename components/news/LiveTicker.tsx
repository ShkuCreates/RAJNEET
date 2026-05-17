'use client'

import { useState, useEffect } from 'react'
import { Zap, TrendingUp } from 'lucide-react'

interface TickerItem {
  id: string
  headline: string
  category: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export default function LiveTicker() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([])
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const fetchTickerNews = async () => {
      try {
        const res = await fetch('/api/public/ticker', { cache: 'no-store' })
        if (!res.ok) throw new Error('Ticker fetch failed')
        const data = await res.json()
        const items: TickerItem[] = data.map((item: any, index: number) => ({
          id: `ticker-${Date.now()}-${index}`,
          headline: item.headline,
          category: item.category,
          urgency: index < 3 ? 'high' : index < 8 ? 'medium' : 'low'
        }))
        setTickerItems(items)
      } catch (error) {
        console.error('Ticker fetch error:', error)
      }
    }
    
    fetchTickerNews()
    
    const interval = setInterval(() => {
      fetchTickerNews()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
      case 'high': return <Zap size={12} className="text-white" />
      default: return <TrendingUp size={12} className="text-white" />
    }
  }

  if (tickerItems.length === 0) return null

  return (
    <div 
      className="bg-red-600 text-white overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center">
        <div className="bg-red-700 px-4 py-2 flex items-center gap-2 whitespace-nowrap z-10 relative">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-wider">Breaking News</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div 
            className={`flex whitespace-nowrap ${isPaused ? '' : 'animate-scroll'}`}
            style={{
              animation: isPaused ? 'none' : 'scroll 60s linear infinite',
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex items-center gap-3 px-6 py-2 inline-flex">
                <div className={`w-5 h-5 rounded-full ${getUrgencyColor(item.urgency)} flex items-center justify-center`}>
                  {getUrgencyIcon(item.urgency)}
                </div>
                <span className="text-sm font-medium">{item.headline}</span>
                <span className="text-xs opacity-75 bg-red-700 px-2 py-1 rounded">
                  {item.category}
                </span>
                {index < tickerItems.length - 1 && (
                  <span className="text-red-300 mx-2">•</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          display: flex;
          width: fit-content;
        }
        
        .animate-scroll > div {
          display: flex;
        }
      `}</style>
    </div>
  )
}
