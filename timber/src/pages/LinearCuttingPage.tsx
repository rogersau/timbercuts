import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SolutionCard from '@/components/SolutionCard'
import { useTimberState } from '@/hooks/useTimberState'
import TimberStockList from '@/components/TimberStockList'
import OwnedTimberList from '@/components/OwnedTimberList'
import CutsList from '@/components/CutsList'
import { ProjectToolbar } from '@/components/ProjectToolbar'
import Layout from '@/components/Layout'
import ControlPanel from '@/components/ControlPanel'
import ErrorDialog from '@/components/ErrorDialog'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { createTimberShareUrl, createTimberExportData, validateTimberImport } from '@/lib/storage'
import { useCallback } from 'react'

export default function LinearCuttingPage() {
  const location = useLocation()
  const store = useTimberState(location.search)
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

  const createShareUrl = useCallback(() => 
    createTimberShareUrl(projectName, timbers, cuts, ownedTimbers, kerf, mode, unit),
    [projectName, timbers, cuts, ownedTimbers, kerf, mode, unit]
  )

  const exportData = useCallback(() => 
    createTimberExportData(projectName, timbers, cuts, ownedTimbers, kerf, mode, unit),
    [projectName, timbers, cuts, ownedTimbers, kerf, mode, unit]
  )

  return (
    <TooltipProvider>
      <Layout projectName={projectName} currentProjectId={currentProjectId} title="Linear Cut Optimiser">
        {/* Back button */}
        <div className="flex justify-start mb-2">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Project Management Buttons */}
        <ProjectToolbar
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
          createShareUrl={createShareUrl}
          exportData={exportData}
          validateImport={validateTimberImport}
          saveDescription="Save your timber cuts configuration to local storage"
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
