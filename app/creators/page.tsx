'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Award, Star, Heart } from 'lucide-react'
import Link from 'next/link'

interface Creator {
  id: string
  name: string
  avatar: string
  bio: string
  articles: number
  followers: number
  reputation: number
  verified: boolean
  specialties: string[]
}

const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494710102-2ec2?auto=format&fit=crop&w=150&h=150',
    bio: 'Political analyst with 10+ years of experience covering Indian elections and policy analysis',
    articles: 156,
    followers: 12500,
    reputation: 950,
    verified: true,
    specialties: ['Political Analysis', 'Election Coverage', 'Policy Research']
  },
  {
    id: '2',
    name: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1507003217-0?auto=format&fit=crop&w=150&h=150',
    bio: 'Journalist specializing in investigative reporting and fact-checking political claims',
    articles: 89,
    followers: 8900,
    reputation: 820,
    verified: true,
    specialties: ['Investigative Journalism', 'Fact-Checking', 'Political Commentary']
  },
  {
    id: '3',
    name: 'Anjali Nair',
    avatar: 'https://images.unsplash.com/photo-1494710102-2ec2?auto=format&fit=crop&w=150&h=150',
    bio: 'Data journalist and visualization expert creating interactive political dashboards and insights',
    articles: 234,
    followers: 6700,
    reputation: 780,
    verified: false,
    specialties: ['Data Visualization', 'Political Analytics', 'Dashboard Design']
  },
  {
    id: '4',
    name: 'Vikram Singh',
    avatar: 'https://images.unsplash.com/photo-1507003217-0?auto=format&fit=crop&w=150&h=150',
    bio: 'Political strategist and campaign manager with expertise in digital political engagement',
    articles: 312,
    followers: 15600,
    reputation: 1100,
    verified: true,
    specialties: ['Digital Strategy', 'Campaign Management', 'Social Media Analytics']
  },
  {
    id: '5',
    name: 'Kavita Menon',
    avatar: 'https://images.unsplash.com/photo-1494710102-2ec2?auto=format&fit=crop&w=150&h=150',
    bio: 'Fact-checker and researcher dedicated to combating misinformation in Indian politics',
    articles: 67,
    followers: 4500,
    reputation: 650,
    verified: true,
    specialties: ['Fact-Checking', 'Research', 'Myth Busting']
  }
]

export default function CreatorsPage() {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#1e3a8a] to-[#0f172a]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Meet Our <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent bg-clip-text">Creators</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover talented content creators shaping political discourse in India
          </p>
        </motion.div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4 py-12">
          {mockCreators.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.6,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0_20px_40px_rgba(59,130,246,0.3)"
              }}
              onClick={() => setSelectedCreator(creator)}
              className="relative group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                {/* Blue Glow Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Creator Content */}
                <div className="relative z-10 p-6">
                  {/* Verification Badge */}
                  {creator.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg"
                    >
                      <Award className="w-4 h-4" />
                    </motion.div>
                  )}

                  {/* Avatar */}
                  <motion.img
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-20 h-20 rounded-full border-4 border-white/20 object-cover group-hover:scale-110"
                  />

                  {/* Creator Info */}
                  <div className="ml-24">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {creator.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {creator.bio}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">{creator.articles}</div>
                        <div className="text-sm text-gray-500">Articles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">{creator.followers.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">{creator.reputation}</div>
                        <div className="text-sm text-gray-500">Reputation</div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2">
                      {creator.specialties.map((specialty, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                          className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Creator Modal */}
        {selectedCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedCreator(null)}
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCreator.name}</h2>
                <button
                  onClick={() => setSelectedCreator(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={selectedCreator.avatar} 
                    alt={selectedCreator.name}
                    className="w-24 h-24 rounded-full border-4 border-white/20 object-cover"
                  />
                  <div>
                    <p className="text-gray-600 mb-2">{selectedCreator.bio}</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-semibold">{selectedCreator.followers.toLocaleString()}</span>
                      <span className="text-gray-500 ml-2">followers</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{selectedCreator.articles}</div>
                    <div className="text-sm text-gray-500">Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{selectedCreator.reputation}</div>
                    <div className="text-sm text-gray-500">Reputation</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-semibold">{selectedCreator.followers.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">followers</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedCreator.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
