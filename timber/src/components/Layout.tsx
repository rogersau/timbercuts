import type { ReactNode } from 'react'
import { FileText } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  projectName?: string
  currentProjectId?: string | null
  title: string
}

export default function Layout({ children, projectName, currentProjectId, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {currentProjectId && projectName && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <FileText className="h-4 w-4" />
              <span>Project: {projectName}</span>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
