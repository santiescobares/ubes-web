import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { BreadcrumbProvider } from '@/context/BreadcrumbContext'

function PanelLayoutInner() {
  return (
    <div className="panel-shell">
      <div className="grid-bg" />
      <Sidebar />
      <div className="panel-main">
        <Topbar />
        <Outlet />
      </div>
    </div>
  )
}

export default function PanelLayout() {
  return (
    <BreadcrumbProvider>
      <PanelLayoutInner />
    </BreadcrumbProvider>
  )
}
