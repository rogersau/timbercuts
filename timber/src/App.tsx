import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SolutionCard from '@/components/SolutionCard'
import { useTimberState } from '@/hooks/useTimberState'
import TimberStockList from '@/components/TimberStockList'
import OwnedTimberList from '@/components/OwnedTimberList'
import CutsList from '@/components/CutsList'
import ProjectDialogs from '@/components/ProjectDialogs'
import Layout from '@/components/Layout'
import ControlPanel from '@/components/ControlPanel'
import ErrorDialog from '@/components/ErrorDialog'

function App() {
  const store = useTimberState()
  const {
    timbers,
    cuts,
    ownedTimbers,
    solution,
    isCalculating,
    kerf,
    mode,
    unit,
    currentProjectId,
    projectName,
    projects,
    showSaveDialog,
    showLoadDialog,
    showErrorDialog,
    errorMessage,
    setProjectName,
    setShowSaveDialog,
    setShowLoadDialog,
    setUnit,
    setKerf,
    setMode,
    setShowErrorDialog,
    setErrorMessage,
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
      <Layout projectName={projectName} currentProjectId={currentProjectId}>
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
          kerf={kerf}
          setKerf={setKerf}
          unit={unit}
          setUnit={setUnit}
          mode={mode}
          setMode={setMode}
          timbers={timbers}
          cuts={cuts}
          ownedTimbers={ownedTimbers}
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

        {/* Control Panel */}
        <ControlPanel isCalculating={isCalculating} calculate={calculate} />

        {/* Results */}
        {solution && <SolutionCard solution={solution} unit={unit} />}
      </Layout>
      {/* Error dialog shown when worker returns an ERROR */}
      <ErrorDialog
        open={showErrorDialog}
        setOpen={(open) => {
          setShowErrorDialog(open)
          if (!open) setErrorMessage(null)
        }}
        message={errorMessage}
      />
    </TooltipProvider>
  )
}

export default App
