import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { formatDashboardDayHeader, formatYear } from '@/lib/dateUtils'
import AnalyticsService from '@/services/analyticsService'
import StatCard from '@/components/dashboard/StatCard'
import UpcomingEventCard from '@/components/dashboard/UpcomingEventCard'
import SuggestionsGrid from '@/components/dashboard/SuggestionsGrid'
import PostCard from '@/components/posts/PostCard'
import type { DashboardDataDTO } from '@ubes/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const firstName = useAuthStore(s => s.user?.firstName)
  const [data, setData] = useState<DashboardDataDTO | null>(null)
  const today = useMemo(() => new Date(), [])

  useEffect(() => {
    AnalyticsService.getDashboard().then(setData).catch(() => {})
  }, [])

  return (
    <div className="panel-content">
      <div className="dashboard">

        <div className="dashboard-header fade-up">
          <div className="dashboard-greeting">
            <h1 className="page-heading">¡Hola, {firstName ?? ''}!</h1>
            <p className="page-sub">Echá un vistazo a lo último en UBES</p>
          </div>
          <div className="dashboard-date">
            <div>{formatDashboardDayHeader(today)}</div>
            <div className="dashboard-date-year">{formatYear(today)}</div>
          </div>
        </div>

        <div className="dashboard-main fade-up d1">
          <div className="dashboard-main-left">

            <section>
              <h2 className="dashboard-section-title">Conteos</h2>
              {data ? (
                <>
                <div className="dashboard-counts-grid">
                  <StatCard
                    label="Usuarios"
                    value={data.counts.users.current}
                    delta={data.counts.users.delta}
                  />
                  <StatCard
                    label="Sanciones Activas"
                    value={data.counts.activePunishments.current}
                    delta={data.counts.activePunishments.delta}
                  />
                  <StatCard
                    label="Sugerencias"
                    value={data.counts.suggestions.current}
                    delta={data.counts.suggestions.delta}
                  />
                </div>
                <p className="dashboard-counts-caption">* Comparaciones respecto a la última semana</p>
                </>
              ) : (
                <div className="dashboard-counts-grid">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="stat-card dashboard-skeleton" />
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-last-post-section">
              <h2 className="dashboard-section-title">Último Anuncio</h2>
              {data ? (
                data.lastPost
                  ? <PostCard post={data.lastPost} onClick={() => navigate('/anuncios')} />
                  : <div className="last-post-placeholder">Sin anuncios publicados todavía.</div>
              ) : (
                <div className="last-post-placeholder dashboard-skeleton" style={{ minHeight: 110 }} />
              )}
            </section>

          </div>

          <div className="dashboard-main-right">
            <h2 className="dashboard-section-title">Próximos Eventos</h2>
            {data ? (
              data.upcomingItems.length > 0 ? (
                <div className="upcoming-events-list">
                  {data.upcomingItems.map(item => (
                    <UpcomingEventCard key={`${item.kind}-${item.id}`} item={item} />
                  ))}
                </div>
              ) : (
                <div className="last-post-placeholder">Sin eventos próximos.</div>
              )
            ) : (
              <div className="upcoming-events-list">
                {[0, 1, 2].map(i => (
                  <div key={i} className="upcoming-event-card dashboard-skeleton" style={{ minHeight: 78 }} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-bottom fade-up d2">
          <h2 className="dashboard-section-title">Últimas Sugerencias</h2>
          {data ? (
            <SuggestionsGrid suggestions={data.latestSuggestions} />
          ) : (
            <div className="suggestions-grid">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="suggestion-card dashboard-skeleton" />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
