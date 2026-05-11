'use client'

import { useState, useEffect } from 'react'
import { Bell, TrendingUp, Clock, Zap } from 'lucide-react'

interface LiveNewsItem {
  id: string
  headline: string
  category: string
  state: string
  timestamp: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

export default function LiveNewsTracker() {
  const [liveNews, setLiveNews] = useState<LiveNewsItem[]>([])
  const [isLive, setIsLive] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  useEffect(() => {
    // Simulate live news updates
    const interval = setInterval(() => {
      const mockNews: LiveNewsItem[] = [
        {
          id: '1',
          headline: 'Breaking: Major Policy Announcement Expected Today',
          category: 'POLITICAL',
          state: 'National',
          timestamp: new Date().toISOString(),
          urgency: 'high'
        },
        {
          id: '2',
          headline: 'Supreme Court to Hear Landmark Case Next Week',
          category: 'LEGAL',
          state: 'National',
          timestamp: new Date().toISOString(),
          urgency: 'medium'
        },
        {
          id: '3',
          headline: 'Economic Growth Data Shows Positive Trends',
          category: 'FINANCE',
          state: 'National',
          timestamp: new Date().toISOString(),
          urgency: 'low'
        }
      ]

      setLiveNews(mockNews)
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredNews = liveNews.filter(item => {
    if (activeFilter === 'all') return true
    return item.urgency === activeFilter
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <Zap size={16} />
      case 'high': return <TrendingUp size={16} />
      case 'medium': return <Clock size={16} />
      case 'low': return <Bell size={16} />
      default: return <Bell size={16} />
    }
  }

  return (
    <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h3 className="text-lg font-bold text-white">Live News Tracker</h3>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isLive 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {(['all', 'high', 'medium', 'low'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-accent-blue text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Live News Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNews.map((item, index) => (
          <div
            key={item.id}
            className="bg-surface/80 border border-white/10 rounded-lg p-3 transition-all hover:bg-surface/90"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getUrgencyColor(item.urgency)}`} />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  {item.urgency}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <h4 className="font-semibold text-white mb-2">{item.headline}</h4>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="bg-surface/70 px-2 py-1 rounded">
                {item.category}
              </span>
              <span>•</span>
              <span className="bg-surface/70 px-2 py-1 rounded">
                {item.state}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{liveNews.length} live news items</span>
          <span className="flex items-center gap-1">
            {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
            {isLive ? 'Tracking Live' : 'Paused'}
          </span>
        </div>
      </div>
    </div>
  )
}
