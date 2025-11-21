import type { ReactNode } from 'react'
import { FileText } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
  projectName?: string
  currentProjectId?: string | null
}

export default function Layout({ children, projectName, currentProjectId }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cut Optimiser</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Minimise waste and cost for your timber cutting needs
          </p>
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
