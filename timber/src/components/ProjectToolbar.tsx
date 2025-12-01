import { FolderOpen, Save, Plus, Trash2, Download, Upload, Share2, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from "@/components/ui/separator"
import { SettingsDialog } from '@/components/SettingsDialog'
import { useRef, useState, useEffect } from 'react'

// Generic project type for the toolbar
export type BaseProject = {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

type Props<TProject extends BaseProject> = {
  // Project management
  projectName: string
  setProjectName: (name: string) => void
  projects: TProject[]
  showSaveDialog: boolean
  showLoadDialog: boolean
  setShowSaveDialog: (b: boolean) => void
  setShowLoadDialog: (b: boolean) => void
  handleSaveProject: () => void
  handleLoadProject: (p: TProject) => void
  handleDeleteProject: (id: string) => void
  handleNewProject: () => void
  
  // Settings
  kerf: number
  setKerf: (kerf: number) => void
  unit: 'mm' | 'in'
  setUnit: (unit: 'mm' | 'in') => void
  mode: 'cost' | 'waste'
  setMode: (mode: 'cost' | 'waste') => void
  
  // Optional grain settings (for sheet projects)
  grainEnabled?: boolean
  setGrainEnabled?: (enabled: boolean) => void
  showGrainOption?: boolean
  
  // Share URL generator
  createShareUrl: () => string
  
  // Export/Import
  exportData: () => object
  validateImport: (data: unknown) => TProject | null
  
  // Labels
  saveDescription?: string
}

export function ProjectToolbar<TProject extends BaseProject>(props: Props<TProject>) {
  const {
    projectName,
    setProjectName,
    projects,
    showSaveDialog,
    setShowSaveDialog,
    showLoadDialog,
    setShowLoadDialog,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleNewProject,
    kerf,
    setKerf,
    unit,
    setUnit,
    mode,
    setMode,
    grainEnabled,
    setGrainEnabled,
    showGrainOption = false,
    createShareUrl,
    exportData,
    validateImport,
    saveDescription = 'Save your configuration to local storage',
  } = props

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  // Keep share URL in sync with current state while dialog is open
  useEffect(() => {
    if (showShareDialog) {
      setShareUrl(createShareUrl())
    }
  }, [showShareDialog, createShareUrl])

  const handleShare = () => {
    setShareUrl(createShareUrl())
    setShowShareDialog(true)
    setCopied(false)
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExport = () => {
    const data = exportData()
    const name = (data as { name?: string }).name || 'project'
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        const project = validateImport(json)
        if (!project) {
          throw new Error('Invalid project file format')
        }
        handleLoadProject(project)
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (error) {
        alert('Failed to import project: ' + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="outline" size="sm" onClick={handleNewProject}>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Project</span>
      </Button>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Project</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>{saveDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <Button onClick={handleSaveProject} className="w-full">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Load Project</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
            <DialogDescription>Select a saved project to load</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No saved projects. Save your current configuration to get started.
              </p>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                >
                  <div className="flex-1">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(project.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleLoadProject(project)}>
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Separator orientation="vertical" />

      <SettingsDialog
        kerf={kerf}
        setKerf={setKerf}
        unit={unit}
        setUnit={setUnit}
        mode={mode}
        setMode={setMode}
        grainEnabled={grainEnabled}
        setGrainEnabled={setGrainEnabled}
        showGrainOption={showGrainOption}
      />

      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>

      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          className="hidden"
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </Button>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Project</DialogTitle>
            <DialogDescription>
              Copy this link to share your project with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button onClick={handleCopyUrl} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view and load your project configuration.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectToolbar
