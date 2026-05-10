import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function PanelLayout() {
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
