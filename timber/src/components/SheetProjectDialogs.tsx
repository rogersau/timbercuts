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
import { type SheetProject, createSheetShareUrl } from '@/lib/storage'
import { type SheetStock, type RequiredPanel, type OwnedSheet } from '@/lib/sheet-optimizer'
import { SettingsDialog } from '@/components/SettingsDialog'
import { useRef, useState, useEffect } from 'react'

type Props = {
  projectName: string
  setProjectName: (name: string) => void
  projects: SheetProject[]
  showSaveDialog: boolean
  showLoadDialog: boolean
  setShowSaveDialog: (b: boolean) => void
  setShowLoadDialog: (b: boolean) => void
  handleSaveProject: () => void
  handleLoadProject: (p: SheetProject) => void
  handleDeleteProject: (id: string) => void
  handleNewProject: () => void
  kerf: number
  setKerf: (kerf: number) => void
  unit: 'mm' | 'in'
  setUnit: (unit: 'mm' | 'in') => void
  mode: 'cost' | 'waste'
  setMode: (mode: 'cost' | 'waste') => void
  grainEnabled: boolean
  setGrainEnabled: (enabled: boolean) => void
  sheets: SheetStock[]
  panels: RequiredPanel[]
  ownedSheets: OwnedSheet[]
}

export function SheetProjectDialogs(props: Props) {
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
    sheets,
    panels,
    ownedSheets,
  } = props

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  // Keep share URL in sync with current state while dialog is open
  useEffect(() => {
    if (showShareDialog) {
      const url = createSheetShareUrl(
        projectName,
        sheets,
        panels,
        ownedSheets,
        kerf,
        mode,
        unit,
        grainEnabled
      )
      setShareUrl(url)
    }
  }, [showShareDialog, projectName, sheets, panels, ownedSheets, kerf, mode, unit, grainEnabled])

  const handleShare = () => {
    const url = createSheetShareUrl(
      projectName,
      sheets,
      panels,
      ownedSheets,
      kerf,
      mode,
      unit,
      grainEnabled
    )
    setShareUrl(url)
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
    const data = {
      name: projectName || 'Untitled Sheet Project',
      sheets,
      panels,
      ownedSheets,
      kerf,
      mode,
      unit,
      grainEnabled,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${data.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
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
        if (!Array.isArray(json.sheets) || !Array.isArray(json.panels)) {
          throw new Error('Invalid sheet project file format')
        }
        
        const project: SheetProject = {
          id: 'imported-' + Date.now(),
          name: json.name || 'Imported Sheet Project',
          sheets: json.sheets,
          panels: json.panels,
          ownedSheets: json.ownedSheets || [],
          kerf: json.kerf || 3,
          mode: json.mode || 'cost',
          unit: json.unit || 'mm',
          createdAt: json.createdAt || Date.now(),
          updatedAt: json.updatedAt || Date.now(),
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
            <DialogDescription>
              Save your sheet cutting configuration to local storage
            </DialogDescription>
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
        showGrainOption={true}
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

export default SheetProjectDialogs
