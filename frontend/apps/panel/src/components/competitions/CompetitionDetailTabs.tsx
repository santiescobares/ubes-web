import { useState } from 'react'
import { Users, Trophy } from 'lucide-react'
import type { CompetitionDTO } from '@ubes/types'
import ParticipantsTab from './participants/ParticipantsTab'
import ResultsTab from './results/ResultsTab'

type TabId = 'participants' | 'results'

interface Props {
  competition: CompetitionDTO
  onReload: () => void
}

export default function CompetitionDetailTabs({ competition, onReload: _onReload }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('participants')

  return (
    <>
      <div className="detail-tabs">
        <button
          className={`detail-tab-btn${activeTab === 'participants' ? ' active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <Users size={14} />
          Participantes
        </button>
        <button
          className={`detail-tab-btn${activeTab === 'results' ? ' active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <Trophy size={14} />
          Resultados
        </button>
      </div>

      <div className="detail-tab-content">
        {activeTab === 'participants' ? (
          <ParticipantsTab competition={competition} />
        ) : (
          <ResultsTab competition={competition} isFinished={competition.status === 'FINISHED'} />
        )}
      </div>
    </>
  )
}
