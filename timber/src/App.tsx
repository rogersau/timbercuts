import { useState } from 'react'
import { Plus, Trash2, Calculator } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { optimizeTimberCutting, type TimberStock, type RequiredCut, type Solution } from '@/lib/timber-optimizer'
import './App.css'

function App() {
  const [timbers, setTimbers] = useState<TimberStock[]>([
    { length: 2400, price: 10 },
    { length: 3600, price: 14 },
  ])
  const [cuts, setCuts] = useState<RequiredCut[]>([
    { length: 600, quantity: 4 },
  ])
  const [solution, setSolution] = useState<Solution | null>(null)
  const [kerf, setKerf] = useState<number>(3)
  const [mode, setMode] = useState<'cost' | 'waste'>('cost')

  const addTimber = () => {
    setTimbers([...timbers, { length: 0, price: 0 }])
  }

  const removeTimber = (index: number) => {
    setTimbers(timbers.filter((_, i) => i !== index))
  }

  const updateTimber = (index: number, field: keyof TimberStock, value: number) => {
    const updated = [...timbers]
    updated[index][field] = value
    setTimbers(updated)
  }

  const addCut = () => {
    setCuts([...cuts, { length: 0, quantity: 1 }])
  }

  const removeCut = (index: number) => {
    setCuts(cuts.filter((_, i) => i !== index))
  }

  const updateCut = (index: number, field: keyof RequiredCut, value: number) => {
    const updated = [...cuts]
    updated[index][field] = value
    setCuts(updated)
  }

  const calculate = () => {
    try {
      const result = optimizeTimberCutting(timbers, cuts, kerf, mode)
      setSolution(result)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error calculating solution')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Timber Cut Optimizer</h1>
          <p className="text-muted-foreground">Minimize waste and cost for your timber cutting needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Available Timber */}
          <Card>
            <CardHeader>
              <CardTitle>Available Timber Stock</CardTitle>
              <CardDescription>Enter available timber lengths and prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {timbers.map((timber, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Length (mm)"
                    value={timber.length || ''}
                    onChange={(e) => updateTimber(index, 'length', Number(e.target.value))}
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
                    placeholder="Length (mm)"
                    value={cut.length || ''}
                    onChange={(e) => updateCut(index, 'length', Number(e.target.value))}
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
        </div>

        {/* Kerf input and Calculate Button */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm">Kerf (mm)</label>
            <Input
              type="number"
              value={kerf}
              min={0}
              step={0.1}
              onChange={(e) => setKerf(Number(e.target.value))}
              className="w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Mode</label>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'cost' | 'waste')}
            >
              <option value="cost">Lowest total cost</option>
              <option value="waste">Least wastage</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">Select objective: <strong className="text-foreground">{mode === 'cost' ? 'Lowest total cost' : 'Least wastage'}</strong></div>
        </div>
        <div className="flex justify-center">
          <Button onClick={calculate} size="lg" className="min-w-48">
            <Calculator className="h-5 w-5" />
            Calculate Optimal Solution
          </Button>
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
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">${solution.totalCost.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{solution.totalTimbers}</div>
                  <div className="text-sm text-muted-foreground">Timbers Needed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{solution.totalWaste}mm</div>
                  <div className="text-sm text-muted-foreground">Total Waste</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{solution.totalKerf}mm</div>
                  <div className="text-sm text-muted-foreground">Kerf Used</div>
                </div>
              </div>

              {/* Cutting Plans */}
              <div className="space-y-3">
                <h4 className="font-semibold">Cutting Plans:</h4>
                {solution.plans.map((plan, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Timber #{index + 1}</span>
                      <span className="text-sm text-muted-foreground">
                        {plan.timberLength}mm @ ${plan.timberPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {plan.cuts.map((cut, cutIndex) => (
                        <span
                          key={cutIndex}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                        >
                          {cut}mm
                        </span>
                      ))}
                      {plan.kerfUsed > 0 && (
                        <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                          kerf {plan.kerfUsed}mm
                        </span>
                      )}
                      {plan.waste > 0 && (
                        <span className="px-3 py-1 bg-destructive/20 text-destructive rounded-full text-sm">
                          {plan.waste}mm waste
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
  )
}

export default App
