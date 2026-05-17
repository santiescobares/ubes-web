import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { CompetitionDTO } from '@ubes/types'
import CompetitionService from '@/services/competitionService'
import CompetitionDetailEditor from '@/components/competitions/CompetitionDetailEditor'
import CompetitionDetailTabs from '@/components/competitions/CompetitionDetailTabs'
import { useBreadcrumb } from '@/context/BreadcrumbContext'

export default function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setEntries } = useBreadcrumb()

  const [competition, setCompetition] = useState<CompetitionDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    if (!id || isNaN(Number(id))) {
      setError(true)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(false)
      const data = await CompetitionService.get(id)
      setCompetition(data)
      setEntries([{ label: 'Competencias', to: '/competencias' }, { label: data.name }])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [id, setEntries])

  useEffect(() => { load() }, [load])

  useEffect(() => () => { setEntries([]) }, [setEntries])

  if (loading) {
    return (
      <div className="panel-content">
        <div className="detail-loading fade-up">
          Cargando competencia...
        </div>
      </div>
    )
  }

  if (error || !competition) {
    return (
      <div className="panel-content">
        <div className="fade-up" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <h1 className="page-heading">Competencia no encontrada</h1>
          <p className="page-sub">No se pudo cargar la información de esta competencia.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/competencias')}>
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detail-page fade-up">
      <div className="detail-left">
        <CompetitionDetailEditor key={competition.updatedAt} competition={competition} onReload={load} />
      </div>

      <div className="detail-right">
        <CompetitionDetailTabs competition={competition} onReload={load} />
      </div>
    </div>
  )
}
