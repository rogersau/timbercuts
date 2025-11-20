import { FolderOpen, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { type Project } from '@/lib/storage'

type Props = {
  projectName: string
  setProjectName: (name: string) => void
  projects: Project[]
  showSaveDialog: boolean
  showLoadDialog: boolean
  setShowSaveDialog: (b: boolean) => void
  setShowLoadDialog: (b: boolean) => void
  handleSaveProject: () => void
  handleLoadProject: (p: Project) => void
  handleDeleteProject: (id: string) => void
  handleNewProject: () => void
}

export function ProjectDialogs(props: Props) {
  const { projectName, setProjectName, projects, showSaveDialog, setShowSaveDialog, showLoadDialog, setShowLoadDialog, handleSaveProject, handleLoadProject, handleDeleteProject, handleNewProject } = props
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
            <DialogDescription>Save your timber cuts configuration to local storage</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Enter project name" />
            </div>
            <Button onClick={handleSaveProject} className="w-full">Save</Button>
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
              <p className="text-sm text-muted-foreground text-center py-8">No saved projects. Save your current configuration to get started.</p>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                  <div className="flex-1">
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(project.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleLoadProject(project)}>Load</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteProject(project.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectDialogs
