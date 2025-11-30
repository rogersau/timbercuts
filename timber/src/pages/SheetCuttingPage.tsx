import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SheetSolutionCard from '@/components/SheetSolutionCard'
import { useSheetState } from '@/hooks/useSheetState'
import SheetStockList from '@/components/SheetStockList'
import OwnedSheetList from '@/components/OwnedSheetList'
import PanelList from '@/components/PanelList'
import SheetProjectDialogs from '@/components/SheetProjectDialogs'
import ControlPanel from '@/components/ControlPanel'
import ErrorDialog from '@/components/ErrorDialog'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText } from 'lucide-react'

export default function SheetCuttingPage() {
  const store = useSheetState()
  const {
    sheets,
    panels,
    ownedSheets,
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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Sheet Cut Optimiser</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Minimise waste and cost for your sheet cutting needs
            </p>
            {currentProjectId && projectName && (
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <FileText className="h-4 w-4" />
                <span>Project: {projectName}</span>
              </div>
            )}
          </div>

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
          <SheetProjectDialogs
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
            sheets={sheets}
            panels={panels}
            ownedSheets={ownedSheets}
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
        </div>
      </div>
      
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
