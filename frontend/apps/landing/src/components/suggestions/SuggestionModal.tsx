import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Clock, ThumbsUp, ThumbsDown, EyeOff, Eye } from 'lucide-react'
import { toast } from 'sonner'
import type { SuggestionDTO } from '@ubes/types'
import SuggestionAvatar from './SuggestionAvatar'
import VoteConfirmModal from './VoteConfirmModal'
import useAuthStore from '@/store/authStore'
import useAuthModalStore from '@/store/authModalStore'
import { voteSuggestion, hideSuggestion, unhideSuggestion } from '@/services/suggestionService'
import { formatPostTime } from '@/lib/dateUtils'

interface SuggestionModalProps {
  suggestion: SuggestionDTO
  isAuthority: boolean
  currentUserId: string | null
  onClose: () => void
  onVoted: (id: number, inFavor: boolean) => void
  onHideToggled: (id: number, nowHidden: boolean) => void
}

export default function SuggestionModal({
  suggestion: initial,
  isAuthority,
  currentUserId,
  onClose,
  onVoted,
  onHideToggled,
}: SuggestionModalProps) {
  const [s, setS] = useState<SuggestionDTO>(initial)
  const [pendingVote, setPendingVote] = useState<boolean | null>(null)
  const [voteLoading, setVoteLoading] = useState(false)
  const [hideLoading, setHideLoading] = useState(false)

  const isOwnSuggestion = !!(currentUserId && s.createdBy?.id === currentUserId)

  const { isAuthenticated } = useAuthStore()
  const { openLogin } = useAuthModalStore()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const authorName = s.createdBy
    ? `${s.createdBy.firstName} ${s.createdBy.lastName}`
    : 'Usuario Anónimo'

  const dislikes = s.totalVotes - s.votesInFavor

  function handleVoteClick(inFavor: boolean) {
    if (!isAuthenticated) { openLogin(); return }
    setPendingVote(inFavor)
  }

  async function confirmVote() {
    if (pendingVote === null) return
    setVoteLoading(true)
    try {
      await voteSuggestion(s.id, pendingVote)
      const updated: SuggestionDTO = {
        ...s,
        userVote: pendingVote,
        totalVotes: s.totalVotes + 1,
        votesInFavor: pendingVote ? s.votesInFavor + 1 : s.votesInFavor,
      }
      setS(updated)
      onVoted(s.id, pendingVote)
      toast.success(pendingVote ? 'Votaste a favor' : 'Votaste en contra')
    } catch {
      toast.error('No se pudo registrar el voto')
    } finally {
      setVoteLoading(false)
      setPendingVote(null)
    }
  }

  async function confirmHideToggle() {
    if (hideLoading) return
    setHideLoading(true)
    try {
      if (s.hidden) {
        await unhideSuggestion(s.id)
        setS(prev => ({ ...prev, hidden: false }))
        onHideToggled(s.id, false)
        toast.success('Sugerencia restaurada')
      } else {
        await hideSuggestion(s.id)
        setS(prev => ({ ...prev, hidden: true }))
        onHideToggled(s.id, true)
        toast.success('Sugerencia ocultada')
      }
    } catch {
      toast.error('No se pudo completar la acción')
    } finally {
      setHideLoading(false)
    }
  }

  return createPortal(
    <>
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
          onClick={e => e.stopPropagation()}
          style={{
            position: 'relative',
            width: 'min(580px, 92vw)',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '2px solid var(--ink)',
            borderLeft: '6px solid var(--yellow)',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isAuthority && (
            <button
              onClick={confirmHideToggle}
              disabled={hideLoading}
              style={{
                position: 'absolute', top: '12px', right: '52px', zIndex: 10,
                width: '32px', height: '32px',
                background: s.hidden ? 'var(--ink)' : 'white',
                color: s.hidden ? 'white' : 'var(--ink)',
                border: '2px solid var(--ink)', cursor: hideLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: hideLoading ? 0.6 : 1,
              }}
              aria-label={s.hidden ? 'Restaurar' : 'Ocultar'}
            >
              {s.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}

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

          <div style={{ padding: '28px 28px 0' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingRight: '40px' }}>
              <SuggestionAvatar user={s.createdBy} size={32} />
              <p style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '14px', margin: 0 }}>
                Sugerencia de {authorName}
              </p>
            </div>

            {/* Body */}
            <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#333', marginBottom: '24px' }}>
              {s.content}
            </p>
          </div>

          {/* Footer */}
          <div className="suggestion-modal-footer" style={{ padding: '0 28px 24px', marginTop: 'auto' }}>
            <div className="suggestion-modal-footer-left">
              <Clock size={13} />
              <span>{formatPostTime(s.createdAt)}</span>
            </div>

            {!isOwnSuggestion && !s.hidden && (
              <div className="suggestion-modal-footer-right">
                {s.userVote === null ? (
                  <>
                    <button
                      className="suggestion-vote-btn suggestion-vote-btn-dislike"
                      onClick={() => handleVoteClick(false)}
                    >
                      <ThumbsDown size={15} />
                      {dislikes}
                    </button>
                    <button
                      className="suggestion-vote-btn suggestion-vote-btn-like"
                      onClick={() => handleVoteClick(true)}
                    >
                      <ThumbsUp size={15} />
                      {s.votesInFavor}
                    </button>
                  </>
                ) : (
                  <span className={`suggestion-voted-badge ${s.userVote ? 'suggestion-voted-badge--like' : 'suggestion-voted-badge--dislike'}`}>
                    {s.userVote ? <ThumbsUp size={13} /> : <ThumbsDown size={13} />}
                    {s.userVote ? 'Votaste a favor' : 'Votaste en contra'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {pendingVote !== null && (
        <VoteConfirmModal
          inFavor={pendingVote}
          loading={voteLoading}
          onConfirm={confirmVote}
          onClose={() => setPendingVote(null)}
        />
      )}
    </>,
    document.body
  )
}
