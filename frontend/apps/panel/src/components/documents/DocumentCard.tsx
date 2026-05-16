import type { DocumentDTO } from '@ubes/types'
import { DOCUMENT_TYPE_META } from '@/lib/documentTypeMeta'
import { formatFileSize, fileTypeLabel } from '@/lib/documentUtils'
import { formatDocumentDateTime } from '@/lib/dateUtils'

interface Props {
  document: DocumentDTO
  onClick: () => void
}

export default function DocumentCard({ document: d, onClick }: Props) {
  const meta = DOCUMENT_TYPE_META[d.type]

  return (
    <div
      className="document-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={ev => ev.key === 'Enter' && onClick()}
    >
      <aside className="document-card-stripe" style={{ background: meta.fallbackBg }} />
      <div className="document-card-body">
        <div className="document-card-title-row">
          <span className="document-card-name">{d.name}</span>
          <span className={`document-card-badge ${meta.badgeClass}`}>{meta.label}</span>
        </div>
        <div className="document-card-meta">
          {formatFileSize(d.size)} · {fileTypeLabel(d.fileType)}
        </div>
        <div className="document-card-spacer" />
        <div className="document-card-footer">
          Última modificación: {formatDocumentDateTime(d.updatedAt)}
        </div>
      </div>
    </div>
  )
}
