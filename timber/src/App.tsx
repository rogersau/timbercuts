import { Plus, Trash2, Calculator, Info, Settings, Save, FolderOpen, FileText } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mmToDisplayStr, mmToDisplayNumber, displayToMM } from '@/lib/units'
import { useTimberState } from '@/hooks/useTimberState'
import { createTimberHandlers } from '@/handlers/timberHandlers'
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
  } = createTimberHandlers(store)

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
                  Save your timber cuts configuration to local storage
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
                <DialogDescription>
                  Select a saved project to load
                </DialogDescription>
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
                        <Button
                          size="sm"
                          onClick={() => handleLoadProject(project)}
                        >
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
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Available Timber */}
          <Card>
            <CardHeader>
              <CardTitle>Available Stock</CardTitle>
              <CardDescription>Enter available lengths and prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {timbers.map((timber, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder={`Length (${unit})`}
                    value={timber.length ? mmToDisplayNumber(timber.length, unit) : ''}
                    onChange={(e) => updateTimber(index, 'length', displayToMM(Number(e.target.value), unit))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Price ($)"
                    value={timber.price || ''}
                    onChange={(e) => updateTimber(index, 'price', Number(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeTimber(index)}
                    disabled={timbers.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addTimber} variant="outline" className="w-full">
                <Plus className="h-4 w-4" />
                Add Timber
              </Button>
            </CardContent>
          </Card>
        {/* Timber On Hand */}
        <Card>
          <CardHeader>
            <CardTitle>On Hand</CardTitle>
            <CardDescription>Enter material you already own (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {ownedTimbers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No owned material. Click below to add.</p>
            ) : (
              ownedTimbers.map((owned, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder={`Length (${unit})`}
                    value={owned.length ? mmToDisplayNumber(owned.length, unit) : ''}
                    onChange={(e) => updateOwnedTimber(index, 'length', displayToMM(Number(e.target.value), unit))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={owned.quantity || ''}
                    onChange={(e) => updateOwnedTimber(index, 'quantity', Number(e.target.value))}
                    className="w-24"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeOwnedTimber(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
            <Button onClick={addOwnedTimber} variant="outline" className="w-full">
              <Plus className="h-4 w-4" />
              Add Owned Timber
            </Button>
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
              {cuts.map((cut, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder={`Length (${unit})`}
                    value={cut.length ? mmToDisplayNumber(cut.length, unit) : ''}
                    onChange={(e) => updateCut(index, 'length', displayToMM(Number(e.target.value), unit))}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={cut.quantity || ''}
                    onChange={(e) => updateCut(index, 'quantity', Number(e.target.value))}
                    className="w-24"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeCut(index)}
                    disabled={cuts.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={addCut} variant="outline" className="w-full">
                <Plus className="h-4 w-4" />
                Add Cut
              </Button>
            </CardContent>
          </Card>

        {/* Calculate Button with Settings */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={calculate} size="lg" className="flex-1 sm:flex-initial sm:min-w-48">
            <Calculator className="h-5 w-5" />
            <span className="hidden sm:inline">Calculate Optimal Solution</span>
            <span className="sm:hidden">Calculate</span>
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="flex-1 sm:flex-initial">
                <Settings className="h-5 w-5" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Optimization Settings</DialogTitle>
                <DialogDescription>
                  Configure kerf and optimization mode for your cutting plan
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Kerf ({unit})</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Kerf: the width of material removed by the saw blade during each cut. Every cut consumes this amount. Values are shown in the selected measurement unit.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={mmToDisplayNumber(kerf, unit)}
                    min={0}
                    step={unit === 'mm' ? 0.1 : 0.01}
                    onChange={(e) => setKerf(displayToMM(Number(e.target.value), unit))}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Measurement Unit</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the unit for measurements (mm or inches). Internally values are stored as mm.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'mm' | 'in')}
                  >
                    <option value="mm">Metric (mm)</option>
                    <option value="in">Imperial (in)</option>
                  </select>
                  <p className="text-sm text-muted-foreground">Current: <strong className="text-foreground">{unit === 'mm' ? 'mm' : 'inches'}</strong></p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Optimization Mode</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        "Lowest total cost" minimizes purchase cost; "Least wastage" minimizes leftover material.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'cost' | 'waste')}
                  >
                    <option value="cost">Lowest total cost</option>
                    <option value="waste">Least wastage</option>
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Current: <strong className="text-foreground">{mode === 'cost' ? 'Lowest total cost' : 'Least wastage'}</strong>
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Results */}
        {solution && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Optimal Solution</CardTitle>
              <CardDescription>Most cost-effective cutting plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">${solution.totalCost.toFixed(2)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Purchase Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{solution.ownedTimbersUsed}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Owned Used</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{solution.purchasedTimbersNeeded}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">To Purchase</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{mmToDisplayStr(solution.totalWaste, unit)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Waste</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{mmToDisplayStr(solution.totalKerf, unit)}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Kerf Used</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{solution.totalTimbers}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Timbers</div>
                </div>
              </div>

              {/* Cutting Plans */}
              <div className="space-y-3">
                <h4 className="font-semibold">Cutting Plans:</h4>
                {solution.plans.map((plan, index) => (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                      <span className="font-medium text-sm sm:text-base">
                        Timber #{index + 1} {plan.isOwned && <span className="text-xs text-primary">(Owned)</span>}
                      </span>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {mmToDisplayStr(plan.timberLength, unit)} {!plan.isOwned && `@ $${plan.timberPrice.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {plan.cuts.map((cut, cutIndex) => (
                        <span
                          key={cutIndex}
                          className={plan.isOwned ? "px-2 sm:px-3 py-1 bg-green-500 text-white rounded-full text-xs sm:text-sm" : "px-2 sm:px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs sm:text-sm"}
                        >
                          {mmToDisplayStr(cut, unit)}
                        </span>
                      ))}
                      {plan.kerfUsed > 0 && (
                          <span className="px-2 sm:px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs sm:text-sm">
                          kerf {mmToDisplayStr(plan.kerfUsed, unit)}
                        </span>
                      )}
                      {plan.waste > 0 && (
                          <span className="px-2 sm:px-3 py-1 bg-destructive/20 text-destructive rounded-full text-xs sm:text-sm">
                          {mmToDisplayStr(plan.waste, unit)} waste
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </TooltipProvider>
  )
}

export default App
