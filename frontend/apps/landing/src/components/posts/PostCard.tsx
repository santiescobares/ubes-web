import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PostDTO } from '@ubes/types'
import AuthorAvatar from '@/components/common/AuthorAvatar'
import { formatPostTime } from '@/lib/dateUtils'

interface PostCardProps {
  post: PostDTO
  onOpen: () => void
}

export default function PostCard({ post, onOpen }: PostCardProps) {
  const { createdBy } = post
  const bodyRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = bodyRef.current
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [post.body])

  return (
    <div
      className="novedades-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
    >
      <button className="novedades-card-leer-mas" onClick={e => { e.stopPropagation(); onOpen() }} tabIndex={-1}>
        LEER MÁS →
      </button>
      <p className="novedades-card-title">{post.title}</p>
      <div ref={bodyRef} className={`novedades-card-body novedades-card-md${overflows ? ' overflows' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>
      <div className="novedades-card-footer">
        <AuthorAvatar user={createdBy} size={28} />
        <span>Por {createdBy.firstName} {createdBy.lastName} • {formatPostTime(post.createdAt)}</span>
      </div>
    </div>
  )
}
