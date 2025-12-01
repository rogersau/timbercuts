import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SheetSolutionCard from '@/components/SheetSolutionCard'
import { useSheetState } from '@/hooks/useSheetState'
import SheetStockList from '@/components/SheetStockList'
import OwnedSheetList from '@/components/OwnedSheetList'
import PanelList from '@/components/PanelList'
import { ProjectToolbar } from '@/components/ProjectToolbar'
import ControlPanel from '@/components/ControlPanel'
import ErrorDialog from '@/components/ErrorDialog'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Layout from '@/components/Layout'
import { createSheetShareUrl, createSheetExportData, validateSheetImport } from '@/lib/storage'
import { useCallback } from 'react'

export default function SheetCuttingPage() {
  const location = useLocation()
  const store = useSheetState(location.search)
  const {
    sheets,
    panels,
    ownedSheets,
    solution,
    isCalculating,
    kerf,
    mode,
    unit,
    grainEnabled,
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
    setGrainEnabled,
    setShowErrorDialog,
    setErrorMessage,
  } = store

  const {
    addSheet,
    removeSheet,
    updateSheet,
    addPanel,
    removePanel,
    updatePanel,
    addOwnedSheet,
    removeOwnedSheet,
    updateOwnedSheet,
    calculate,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleNewProject,
  } = store

  const createShareUrl = useCallback(() => 
    createSheetShareUrl(projectName, sheets, panels, ownedSheets, kerf, mode, unit, grainEnabled),
    [projectName, sheets, panels, ownedSheets, kerf, mode, unit, grainEnabled]
  )

  const exportData = useCallback(() => 
    createSheetExportData(projectName, sheets, panels, ownedSheets, kerf, mode, unit, grainEnabled),
    [projectName, sheets, panels, ownedSheets, kerf, mode, unit, grainEnabled]
  )

  return (
    <TooltipProvider>
    
      <Layout projectName={projectName} currentProjectId={currentProjectId} title="Sheet Cut Optimiser">
      
          {/* Back button */}
          <div className="flex justify-start">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Project Management */}
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
            grainEnabled={grainEnabled}
            setGrainEnabled={setGrainEnabled}
            showGrainOption={true}
            createShareUrl={createShareUrl}
            exportData={exportData}
            validateImport={validateSheetImport}
            saveDescription="Save your sheet cutting configuration to local storage"
          />

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Available Sheets */}
            <Card>
              <CardHeader>
                <CardTitle>Available Sheets</CardTitle>
                <CardDescription>Enter available sheet sizes and prices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <SheetStockList
                  sheets={sheets}
                  unit={unit}
                  grainEnabled={grainEnabled}
                  addSheet={addSheet}
                  removeSheet={removeSheet}
                  updateSheet={updateSheet}
                />
              </CardContent>
            </Card>

            {/* Sheets On Hand */}
            <Card>
              <CardHeader>
                <CardTitle>On Hand</CardTitle>
                <CardDescription>Enter sheets you already own (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <OwnedSheetList
                  ownedSheets={ownedSheets}
                  unit={unit}
                  grainEnabled={grainEnabled}
                  addOwnedSheet={addOwnedSheet}
                  removeOwnedSheet={removeOwnedSheet}
                  updateOwnedSheet={updateOwnedSheet}
                />
              </CardContent>
            </Card>
          </div>

          {/* Required Panels */}
          <Card>
            <CardHeader>
              <CardTitle>Required Panels</CardTitle>
              <CardDescription>Enter panel dimensions you need (width × height) and quantities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <PanelList
                panels={panels}
                unit={unit}
                grainEnabled={grainEnabled}
                addPanel={addPanel}
                removePanel={removePanel}
                updatePanel={updatePanel}
              />
            </CardContent>
          </Card>

          {/* Control Panel */}
          <ControlPanel isCalculating={isCalculating} calculate={calculate} />

          {/* Results */}
          {solution && <SheetSolutionCard solution={solution} unit={unit} />}
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
