import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PostDTO } from '@ubes/types'
import AuthorAvatar from '@/components/common/AuthorAvatar'
import { formatPostDateTime } from '@/lib/dateUtils'

interface PostModalProps {
  post: PostDTO
  onClose: () => void
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const { createdBy } = post

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(640px, 92vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '2px solid var(--ink)',
          boxShadow: 'var(--shadow-lg)',
          background: 'var(--bg)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '12px', right: '12px', zIndex: 10,
            width: '32px', height: '32px',
            background: 'var(--ink)', color: 'white',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        {post.bannerURL && (
          <img
            src={post.bannerURL}
            alt=""
            style={{
              width: '100%',
              aspectRatio: '16/7',
              objectFit: 'cover',
              borderBottom: '2px solid var(--ink)',
              display: 'block',
            }}
          />
        )}

        <div style={{ padding: '28px 32px' }}>
          <h2
            id="post-modal-title"
            style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '28px', marginBottom: '10px', paddingRight: '40px' }}
          >
            {post.title}
          </h2>

          <div className="novedades-modal-meta">
            <span className="novedades-modal-meta-author">
              <AuthorAvatar user={createdBy} size={32} />
              <span>Por {createdBy.firstName} {createdBy.lastName}</span>
            </span>
            <span className="novedades-modal-meta-sep">•</span>
            <span className="novedades-modal-meta-date">
              <Clock size={20} />
              <span>{formatPostDateTime(post.createdAt)}</span>
            </span>
          </div>

          <div className="novedades-modal-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
