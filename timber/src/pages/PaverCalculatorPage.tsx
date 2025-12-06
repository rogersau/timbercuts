import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from '@/components/ui/input-group'
import PaverSolutionCard from '@/components/PaverSolutionCard'
import { usePaverState } from '@/hooks/usePaverState'
import AreaList from '@/components/AreaList'
import { PaverToolbar } from '@/components/PaverToolbar'
import Layout from '@/components/Layout'
import ControlPanel from '@/components/ControlPanel'
import ErrorDialog from '@/components/ErrorDialog'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  createPaverShareUrl,
  createPaverExportData,
  validatePaverImport,
} from '@/lib/storage'
import {
  COMMON_PAVER_TYPES,
  LAYING_PATTERNS,
  getPatternDisplayName,
  getPatternWastePercentage,
} from '@/lib/paver-calculator'
import { useCallback } from 'react'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

export default function PaverCalculatorPage() {
  const location = useLocation()
  const store = usePaverState(location.search)
  const {
    areas,
    paver,
    pattern,
    gap,
    customWastePercentage,
    result,
    isCalculating,
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
    setGap,
    setPattern,
    setCustomWastePercentage,
    setShowErrorDialog,
    setErrorMessage,
  } = store

  const {
    addArea,
    removeArea,
    updateArea,
    setPaver,
    updatePaver,
    calculate,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleNewProject,
  } = store

  const createShareUrl = useCallback(
    () =>
      createPaverShareUrl(
        projectName,
        areas,
        paver,
        pattern,
        gap,
        customWastePercentage,
        unit
      ),
    [projectName, areas, paver, pattern, gap, customWastePercentage, unit]
  )

  const exportData = useCallback(
    () =>
      createPaverExportData(
        projectName,
        areas,
        paver,
        pattern,
        gap,
        customWastePercentage,
        unit
      ),
    [projectName, areas, paver, pattern, gap, customWastePercentage, unit]
  )

  const handlePaverPresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = COMMON_PAVER_TYPES.find((p) => p.name === e.target.value)
    if (preset) {
      setPaver(preset)
    }
  }

  return (
    <TooltipProvider>
      <Layout
        projectName={projectName}
        currentProjectId={currentProjectId}
        title="Paver Calculator"
      >
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
        <PaverToolbar
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
          gap={gap}
          setGap={setGap}
          unit={unit}
          setUnit={setUnit}
          customWastePercentage={customWastePercentage}
          setCustomWastePercentage={setCustomWastePercentage}
          createShareUrl={createShareUrl}
          exportData={exportData}
          validateImport={validatePaverImport}
        />

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Areas to Cover */}
          <Card>
            <CardHeader>
              <CardTitle>Areas to Cover</CardTitle>
              <CardDescription>
                Enter the rectangular areas you want to pave
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <AreaList
                areas={areas}
                unit={unit}
                addArea={addArea}
                removeArea={removeArea}
                updateArea={updateArea}
              />
            </CardContent>
          </Card>

          {/* Paver Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Paver Type</CardTitle>
              <CardDescription>Select or define your paver dimensions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preset</label>
                <select
                  value={paver.name}
                  onChange={handlePaverPresetChange}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  {COMMON_PAVER_TYPES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                      {p.length > 0 ? ` (${p.length}×${p.width}mm)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Length</label>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      value={paver.length ? mmToDisplayNumber(paver.length, unit) : ''}
                      onChange={(e) =>
                        updatePaver('length', displayToMM(Number(e.target.value), unit))
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{unit}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width</label>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      value={paver.width ? mmToDisplayNumber(paver.width, unit) : ''}
                      onChange={(e) =>
                        updatePaver('width', displayToMM(Number(e.target.value), unit))
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>{unit}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Laying Pattern & Gap */}
        <Card>
          <CardHeader>
            <CardTitle>Laying Configuration</CardTitle>
            <CardDescription>
              Select the laying pattern and gap between pavers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Laying Pattern</label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value as typeof pattern)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  {LAYING_PATTERNS.map((p) => (
                    <option key={p} value={p}>
                      {getPatternDisplayName(p)} ({(getPatternWastePercentage(p) * 100).toFixed(0)}%
                      waste)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Different patterns require different amounts of cuts and waste
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gap Between Pavers</label>
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    min="0"
                    step="0.5"
                    value={gap ? mmToDisplayNumber(gap, unit) : ''}
                    onChange={(e) => setGap(displayToMM(Number(e.target.value), unit))}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>{unit}</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <p className="text-xs text-muted-foreground">
                  Typical gap is 2-5mm for sand-filled joints
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Panel */}
        <ControlPanel isCalculating={isCalculating} calculate={calculate} />

        {/* Results */}
        {result && (
          <PaverSolutionCard
            result={result}
            unit={unit}
            paverName={paver.name}
            patternName={getPatternDisplayName(pattern)}
          />
        )}
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
