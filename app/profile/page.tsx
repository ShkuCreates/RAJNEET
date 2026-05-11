'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Instagram, LogOut, Pen, Clock, Heart, TrendingUp, Users } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalComments: 0,
    totalLikes: 0,
    totalEngagement: 0,
    debateParticipation: 0,
    totalArticles: 0
  })
  const [activities, setActivities] = useState([])
  const [articles, setArticles] = useState([])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchProfileData = async () => {
      try {
        // Fetch stats
        const [totalComments, totalLikesResult, totalArticles] = await Promise.all([
          prisma.opinion.count({
            where: { userId: session.user.id }
          }),
          prisma.opinion.aggregate({
            where: { userId: session.user.id },
            _sum: { likeCount: true }
          }),
          prisma.news.count({
            where: { postedBy: session.user.id }
          })
        ])

        const totalLikes = totalLikesResult._sum.likeCount || 0
        const totalEngagement = totalComments + totalLikes

        // Fetch activities
        const userActivities = await prisma.opinion.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { 
            news: { select: { headline: true, slug: true } } 
          }
        })

        // Fetch user articles
        const userArticles = await prisma.news.findMany({
          where: { postedBy: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 50,
          select: {
            id: true,
            headline: true,
            slug: true,
            createdAt: true,
            status: true,
            _count: {
              select: {
                pageViews: true
              }
            }
          }
        })

        setStats({
          totalComments,
          totalLikes,
          totalEngagement,
          debateParticipation: totalComments, // For now, using comments as debate participation
          totalArticles
        })

        // Format activities
        const formattedActivities = userActivities.map(activity => {
          const activityType = activity.news ? 'comment' : 'debate'
          const color = activityType === 'comment' ? '#3B82F6' : '#8B5CF6'
          const icon = activityType === 'comment' ? '💬' : '🗳️'
          
          return {
            id: activity.id,
            type: activityType,
            description: `You ${activityType === 'comment' ? 'commented on' : 'participated in'} "${activity.news?.headline || 'Article'}"`,
            timestamp: new Date(activity.createdAt).toLocaleDateString('en-IN'),
            color,
            icon,
            articleSlug: activity.news?.slug
          }
        })

        setActivities(formattedActivities)
        setArticles(userArticles)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    fetchProfileData()
  }, [session?.user?.id])

  const handleSignOut = async () => {
    const confirmed = confirm('Are you sure you want to sign out?')
    if (confirmed) {
      await signOut({ redirect: false })
      router.push('/')
    }
  }

  if (!session?.user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0F1E' }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', color: '#F9FAFB' }}>
      {/* Top Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 24px', 
        background: '#111827',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Link 
          href="/dashboard"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#D1D5DB', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>
        
        <Link 
          href="https://instagram.com/rajneet"
          target="_blank"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            color: '#E11D48', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Instagram size={18} />
          <span>Follow us on Instagram</span>
        </Link>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Profile Header Card */}
        <div style={{
          background: '#111827',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left side - Avatar and info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `url(${session.user.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: '3px solid #3B82F6',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '20px',
                  height: '20px',
                  background: '#10B981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
              </div>
              
              <div>
                <h1 style={{
                  color: '#FFFFFF',
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: '0 0 4px 0',
                  fontFamily: 'Sora, sans-serif'
                }}>
                  {session.user.name}
                </h1>
                <p style={{
                  color: '#9CA3AF',
                  fontSize: '14px',
                  margin: '0',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  @{session.user.username || session.user.email?.split('@')[0]}
                </p>
              </div>
            </div>

            {/* Right side - Sign Out button */}
            <button
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                border: '2px solid #EF4444',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 150ms'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#EF4444'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#FFFFFF'
              }}
            >
              <LogOut size={16} style={{ marginRight: '8px' }} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          {/* Total Comments */}
          <div style={{
            background: '#1F2937',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Heart size={24} style={{ color: '#3B82F6', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', fontFamily: 'Sora, sans-serif' }}>
              {stats.totalComments.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Total Comments
            </div>
          </div>

          {/* Total Likes */}
          <div style={{
            background: '#1F2937',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <TrendingUp size={24} style={{ color: '#10B981', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', fontFamily: 'Sora, sans-serif' }}>
              {stats.totalLikes.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Total Likes
            </div>
          </div>

          {/* Total Engagement */}
          <div style={{
            background: '#1F2937',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Users size={24} style={{ color: '#F59E0B', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', fontFamily: 'Sora, sans-serif' }}>
              {stats.totalEngagement.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Total Engagement
            </div>
          </div>

          {/* Debate Participation */}
          <div style={{
            background: '#1F2937',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <TrendingUp size={24} style={{ color: '#8B5CF6', marginBottom: '8px' }} />
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#FFFFFF', fontFamily: 'Sora, sans-serif' }}>
              {stats.debateParticipation.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Debate Participant
            </div>
          </div>
        </div>

        {/* Activity Log Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Clock size={20} style={{ color: '#FFFFFF' }} />
            <h2 style={{ 
              color: '#FFFFFF', 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0',
              fontFamily: 'Sora, sans-serif'
            }}>
              Activity Log
            </h2>
          </div>
          
          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
            {activities.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>
                No activity yet. Start engaging with articles to see your activity here.
              </p>
            ) : (
              activities.map((activity, index) => (
                <div 
                  key={activity.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderBottom: index < activities.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background 150ms'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: activity.color,
                    flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      color: '#D1D5DB',
                      fontSize: '14px',
                      margin: '0 0 4px 0',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {activity.description}
                    </p>
                    <span style={{ color: '#6B7280', fontSize: '12px', marginLeft: 'auto' }}>
                      {activity.timestamp}
                    </span>
                  </div>
                  {activity.articleSlug && (
                    <Link 
                      href={`/news/${activity.articleSlug}`}
                      style={{ 
                        color: '#3B82F6', 
                        fontSize: '12px', 
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      View Article →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Articles Published Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Pen size={20} style={{ color: '#FFFFFF' }} />
            <h2 style={{ 
              color: '#FFFFFF', 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: '0',
              fontFamily: 'Sora, sans-serif'
            }}>
              Articles Published
            </h2>
          </div>
          
          <div style={{ background: '#111827', borderRadius: '12px', padding: '20px' }}>
            {articles.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px' }}>
                You have not published any articles yet.
              </p>
            ) : (
              articles.map((article, index) => (
                <div 
                  key={article.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: index < articles.length - 1 ? '12px' : '0',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 150ms'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{
                      color: '#FFFFFF',
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0',
                      fontFamily: 'Sora, sans-serif',
                      flex: 1
                    }}>
                      {article.headline}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: article.status === 'PUBLISHED' ? '#10B981' : '#6B7280',
                      color: '#FFFFFF'
                    }}>
                      {article.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#9CA3AF', fontSize: '12px' }}>
                    <span>
                      {new Date(article.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span>
                      {article._count?.pageViews || 0} views
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
