import { useRef, useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PostDTO } from '@ubes/types'
import AuthorAvatar from '@/components/common/AuthorAvatar'
import { formatTimeAgo } from '@/lib/dateUtils'

interface AnuncioCardProps {
  post: PostDTO
  onOpen: () => void
}

export default function AnuncioCard({ post, onOpen }: AnuncioCardProps) {
  const { createdBy } = post
  const bodyRef = useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = bodyRef.current
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [post.body])

  const processedBody = post.body.replace(/\n(?!\n)/g, '  \n')

  return (
    <div
      className="anuncio"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
    >
      <div className="anuncio-author">
        <AuthorAvatar user={createdBy} size={24} />
        <span>Por {createdBy.firstName} {createdBy.lastName}</span>
      </div>

      <div className="anuncio-title">{post.title}</div>

      <div ref={bodyRef} className={`anuncio-body anuncio-md${overflows ? ' overflows' : ''}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{processedBody}</ReactMarkdown>
      </div>

      <div className="anuncio-footer">
        <Clock size={12} />
        <span>Hace {formatTimeAgo(post.createdAt)}</span>
      </div>
    </div>
  )
}
