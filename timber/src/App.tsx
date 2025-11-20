import { Calculator, FileText } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// mmToDisplayNumber moved to subcomponents
import SettingsDialog from '@/components/SettingsDialog'
import SolutionCard from '@/components/SolutionCard'
import { useTimberState } from '@/hooks/useTimberState'
import TimberStockList from '@/components/TimberStockList'
import OwnedTimberList from '@/components/OwnedTimberList'
import CutsList from '@/components/CutsList'
import ProjectDialogs from '@/components/ProjectDialogs'
import './App.css'

function App() {
  const store = useTimberState()
  const {
    timbers,
    cuts,
    ownedTimbers,
    solution,
    kerf,
    mode,
    unit,
    currentProjectId,
    projectName,
    projects,
    showSaveDialog,
    showLoadDialog,
    setProjectName,
    setShowSaveDialog,
    setShowLoadDialog,
    setUnit,
    setKerf,
    setMode,
  } = store

  const {
    addTimber,
    removeTimber,
    updateTimber,
    addCut,
    removeCut,
    updateCut,
    addOwnedTimber,
    removeOwnedTimber,
    updateOwnedTimber,
    calculate,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleNewProject,
  } = store

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cut Optimiser</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Minimise waste and cost for your timber cutting needs</p>
          {currentProjectId && projectName && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <FileText className="h-4 w-4" />
              <span>Project: {projectName}</span>
            </div>
          )}
        </div>

        {/* Project Management Buttons */}
        <ProjectDialogs
          projectName={projectName}
          setProjectName={setProjectName}
          projects={projects}
          showSaveDialog={showSaveDialog}
          showLoadDialog={showLoadDialog}
          setShowSaveDialog={setShowSaveDialog}
          setShowLoadDialog={setShowLoadDialog}
          handleSaveProject={handleSaveProject}
          handleLoadProject={handleLoadProject}
          handleDeleteProject={handleDeleteProject}
          handleNewProject={handleNewProject}
        />

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Available Timber */}
          <Card>
            <CardHeader>
              <CardTitle>Available Stock</CardTitle>
              <CardDescription>Enter available lengths and prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <TimberStockList
                timbers={timbers}
                unit={unit}
                addTimber={addTimber}
                removeTimber={removeTimber}
                updateTimber={updateTimber}
              />

            </CardContent>
          </Card>
        {/* Timber On Hand */}
        <Card>
          <CardHeader>
            <CardTitle>On Hand</CardTitle>
            <CardDescription>Enter material you already own (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <OwnedTimberList
              ownedTimbers={ownedTimbers}
              unit={unit}
              addOwnedTimber={addOwnedTimber}
              removeOwnedTimber={removeOwnedTimber}
              updateOwnedTimber={updateOwnedTimber}
            />
          </CardContent>
        </Card>

        </div>


                  {/* Required Cuts */}
          <Card>
            <CardHeader>
              <CardTitle>Required Cuts</CardTitle>
              <CardDescription>Enter lengths you need and quantities</CardDescription>
            </CardHeader>
              <CardContent className="space-y-3">
                <CutsList
                  cuts={cuts}
                  unit={unit}
                  addCut={addCut}
                  removeCut={removeCut}
                  updateCut={updateCut}
                />
              </CardContent>
          </Card>

        {/* Calculate Button with Settings */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={calculate} size="lg" className="flex-1 sm:flex-initial sm:min-w-48">
            <Calculator className="h-5 w-5" />
            <span className="hidden sm:inline">Calculate Optimal Solution</span>
            <span className="sm:hidden">Calculate</span>
          </Button>
          
          <SettingsDialog kerf={kerf} setKerf={setKerf} unit={unit} setUnit={setUnit} mode={mode} setMode={setMode} />
        </div>

        {/* Results */}
        {solution && (
          <SolutionCard solution={solution} unit={unit} />
        )}
      </div>
      </div>
    </TooltipProvider>
  )
}

export default App
