'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Opinion {
  id: string
  user: {
    name: string
    image: string
    username: string
  }
  news?: {
    headline: string
    slug: string
  }
  stance: string
  content: string
  like_count: number
  created_at: string
  replies?: Opinion[]
}

interface Stances {
  for: number
  against: number
  neutral: number
  total: number
}

function OpinionSection({ newsId }: { newsId: string }) {
  const [opinions, setOpinions] = useState<Opinion[]>([])
  const [stance, setStance] = useState('')
  const [content, setContent] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const { data: session } = useSession()

  useEffect(() => {
    fetch(`/api/opinions?newsId=${newsId}`)
      .then(r => r.json())
      .then(setOpinions)
  }, [newsId])

  const submitOpinion = async () => {
    if (!stance || !content.trim()) return
    if (!session) { /* show login modal */ return }

    const res = await fetch('/api/opinions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId, stance, content })
    })
    const newOpinion = await res.json()
    setOpinions(prev => [newOpinion, ...prev])
    setContent('')
    setStance('')
  }

  const submitReply = async (parentId: string) => {
    if (!replyContent.trim()) return
    if (!session) { /* show login modal */ return }

    const res = await fetch('/api/opinions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId, stance: 'NEUTRAL', content: replyContent, parentId })
    })
    const newReply = await res.json()
    setOpinions(prev => prev.map(op =>
      op.id === parentId
        ? { ...op, replies: [...(op.replies || []), newReply] }
        : op
    ))
    setReplyContent('')
    setReplyingTo(null)
  }

  const handleLike = async (opinionId: string) => {
    if (!session) return
    await fetch(`/api/opinions/${opinionId}/like`, { method: 'POST' })
    setOpinions(prev => prev.map(op =>
      op.id === opinionId
        ? { ...op, likeCount: op.likeCount + 1 }
        : op
    ))
  }

  return (
    <div>
      {/* Stance selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['FOR', 'NEUTRAL', 'AGAINST'].map(s => (
          <button
            key={s}
            onClick={() => setStance(s)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: `2px solid ${stance === s ? (s === 'FOR' ? '#10B981' : s === 'AGAINST' ? '#EF4444' : '#6B7280') : 'rgba(255,255,255,0.1)'}`,
              background: stance === s ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: stance === s ? 'white' : '#6B7280',
              cursor: 'pointer',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: 13,
              transition: 'all 150ms'
            }}
          >{s}</button>
        ))}
      </div>

      {/* Comment input */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={session ? "Share your opinion..." : "Login to share your opinion"}
        disabled={!session}
        style={{
          width: '100%',
          minHeight: 100,
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: 16,
          color: 'white',
          fontFamily: 'Inter',
          fontSize: 14,
          resize: 'vertical',
          outline: 'none'
        }}
      />

      <button
        onClick={submitOpinion}
        disabled={!stance || !content.trim() || !session}
        style={{
          marginTop: 8,
          padding: '10px 24px',
          background: (!stance || !content.trim() || !session) ? '#374151' : '#2563EB',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: (!stance || !content.trim() || !session) ? 'not-allowed' : 'pointer',
          fontFamily: 'Sora',
          fontWeight: 600,
          fontSize: 14,
          transition: 'background 150ms'
        }}
      >
        Post Opinion
      </button>

      {/* Opinions list */}
      <div style={{ marginTop: 32 }}>
        {opinions.map(opinion => (
          <div key={opinion.id} style={{
            background: '#111827',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderLeft: `3px solid ${opinion.stance === 'FOR' ? '#10B981' : opinion.stance === 'AGAINST' ? '#EF4444' : '#6B7280'}` 
          }}>
            {/* User row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <img src={opinion.user?.image} style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{opinion.user?.name}</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                background: opinion.stance === 'FOR' ? 'rgba(16,185,129,0.2)' : opinion.stance === 'AGAINST' ? 'rgba(239,68,68,0.2)' : 'rgba(107,114,128,0.2)',
                color: opinion.stance === 'FOR' ? '#10B981' : opinion.stance === 'AGAINST' ? '#EF4444' : '#9CA3AF'
              }}>{opinion.stance}</span>
              <span style={{ color: '#6B7280', fontSize: 12, marginLeft: 'auto' }}>
                {new Date(opinion.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>

            {/* Content */}
            <p style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 1.7, margin: '0 0 12px' }}>
              {opinion.content}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <button
                onClick={() => handleLike(opinion.id)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                👍 {opinion.likeCount || 0}
              </button>
              <button
                onClick={() => setReplyingTo(replyingTo === opinion.id ? null : opinion.id)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}
              >
                💬 Reply
              </button>
            </div>

            {/* Reply input */}
            {replyingTo === opinion.id && (
              <div style={{ marginTop: 12 }}>
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  style={{
                    width: '100%', minHeight: 70,
                    background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, padding: 12, color: 'white',
                    fontFamily: 'Inter', fontSize: 13, resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={() => submitReply(opinion.id)} style={{ padding: '6px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                    Reply
                  </button>
                  <button onClick={() => setReplyingTo(null)} style={{ padding: '6px 16px', background: 'transparent', color: '#6B7280', border: '1px solid #374151', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Replies */}
            {opinion.replies?.map((reply: any) => (
              <div key={reply.id} style={{
                marginTop: 10, marginLeft: 24,
                background: '#1F2937', borderRadius: 8, padding: 12,
                borderLeft: '2px solid #374151'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <img src={reply.user?.image} style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{reply.user?.name}</span>
                  <span style={{ color: '#6B7280', fontSize: 11, marginLeft: 'auto' }}>
                    {new Date(reply.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p style={{ color: '#D1D5DB', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        ))}

        {opinions.length === 0 && (
          <p style={{ color: '#6B7280', textAlign: 'center', padding: 32 }}>
            No opinions yet. Be the first to share your stance.
          </p>
        )}
      </div>
    </div>
  )
}

export default OpinionSection
