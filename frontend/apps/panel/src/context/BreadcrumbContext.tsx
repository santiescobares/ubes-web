import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface BreadcrumbEntry {
  label: string
  to?: string
}

interface BreadcrumbContextValue {
  entries: BreadcrumbEntry[]
  setEntries: (entries: BreadcrumbEntry[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [entries, setEntriesState] = useState<BreadcrumbEntry[]>([])
  const setEntries = useCallback((next: BreadcrumbEntry[]) => setEntriesState(next), [])
  return (
    <BreadcrumbContext.Provider value={{ entries, setEntries }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumb() {
  const ctx = useContext(BreadcrumbContext)
  if (!ctx) throw new Error('useBreadcrumb must be used inside BreadcrumbProvider')
  return ctx
}
