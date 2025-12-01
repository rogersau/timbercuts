import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, FileSpreadsheet } from 'lucide-react'
import { mmToDisplayStr, mmToDisplayNumber } from '@/lib/units'
import type { SheetSolution } from '@/lib/sheet-optimizer'

type Props = {
  solution: SheetSolution
  unit: 'mm' | 'in'
}

// Generate distinct colors for panels
const panelColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-red-400',
  'bg-indigo-500',
  'bg-cyan-500',
]

export function SheetSolutionCard({ solution, unit }: Props) {
  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    let csv = 'Sheet ID,Type,Width,Height,Cost,Panels,Used Area,Waste Area\n'
    
    solution.plans.forEach((plan, index) => {
      const type = plan.isOwned ? 'Owned' : 'Purchased'
      const panelsStr = plan.placements.map(p => 
        `${mmToDisplayNumber(p.width, unit)}x${mmToDisplayNumber(p.height, unit)}${p.rotated ? '(R)' : ''}`
      ).join('; ')
      
      csv += `${index + 1},${type},${mmToDisplayNumber(plan.sheetWidth, unit)},${mmToDisplayNumber(plan.sheetHeight, unit)},${plan.sheetPrice.toFixed(2)},"${panelsStr}",${mmToDisplayNumber(plan.usedArea, unit === 'mm' ? 'mm' : 'in')},${mmToDisplayNumber(plan.wasteArea, unit === 'mm' ? 'mm' : 'in')}\n`
    })
    
    csv += `\nSummary\n`
    csv += `Total Cost,$${solution.totalCost.toFixed(2)}\n`
    csv += `Total Sheets,${solution.totalSheets}\n`
    csv += `Efficiency,${solution.efficiency.toFixed(1)}%\n`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sheet-cutting-plan-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-2 border-primary print:border-0 print:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Optimal Solution</CardTitle>
          <CardDescription>Most efficient sheet cutting plan</CardDescription>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">${solution.totalCost.toFixed(2)}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Purchase Cost</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{solution.totalSheets}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Sheets</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{solution.ownedSheetsUsed}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Owned Used</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{solution.efficiency.toFixed(1)}%</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Efficiency</div>
          </div>
        </div>

        {solution.purchasedSheetsNeeded > 0 && (
          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-400 dark:border-amber-600 rounded-lg">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              🛒 Shopping List
            </h4>
            <ul className="space-y-1">
              {Object.entries(
                solution.plans
                  .filter(p => !p.isOwned)
                  .reduce((acc, plan) => {
                    const key = `${mmToDisplayStr(plan.sheetWidth, unit)} × ${mmToDisplayStr(plan.sheetHeight, unit)} @ $${plan.sheetPrice.toFixed(2)}`
                    acc[key] = (acc[key] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
              ).map(([desc, count]) => (
                <li key={desc} className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  {count}× {desc}
                </li>
              ))}
            </ul>
            <div className="mt-2 pt-2 border-t border-amber-300 dark:border-amber-700 text-sm font-bold text-amber-900 dark:text-amber-100">
              Total: ${solution.totalCost.toFixed(2)}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="font-semibold">Cutting Plans:</h4>
          {solution.plans.map((plan, index) => {
            const scale = Math.min(300 / plan.sheetWidth, 200 / plan.sheetHeight)
            const displayWidth = plan.sheetWidth * scale
            const displayHeight = plan.sheetHeight * scale

            return (
              <div key={index} className="p-3 sm:p-4 border rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                  <span className="font-medium text-sm sm:text-base">
                    Sheet #{index + 1}{' '}
                    {plan.isOwned && <span className="text-xs text-primary">(Owned)</span>}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {mmToDisplayStr(plan.sheetWidth, unit)} × {mmToDisplayStr(plan.sheetHeight, unit)}
                    {!plan.isOwned && ` @ $${plan.sheetPrice.toFixed(2)}`}
                  </span>
                </div>
                
                {/* Visual representation */}
                <div 
                  className="relative border-2 border-gray-400 bg-gray-100 mx-auto"
                  style={{ 
                    width: displayWidth, 
                    height: displayHeight,
                  }}
                >
                  {plan.placements.map((placement, pIdx) => (
                    <div
                      key={pIdx}
                      className={`absolute ${panelColors[placement.panelIndex % panelColors.length]} text-white text-xs flex items-center justify-center border border-white/50`}
                      style={{
                        left: placement.x * scale,
                        top: placement.y * scale,
                        width: placement.width * scale - 1,
                        height: placement.height * scale - 1,
                      }}
                      title={`${mmToDisplayNumber(placement.width, unit)} × ${mmToDisplayNumber(placement.height, unit)}${placement.rotated ? ' (rotated)' : ''}`}
                    >
                      {placement.width * scale > 40 && placement.height * scale > 20 && (
                        <span className="truncate px-1">
                          {mmToDisplayNumber(placement.width, unit)}×{mmToDisplayNumber(placement.height, unit)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Panel list */}
                <div className="flex gap-2 flex-wrap">
                  {plan.placements.map((placement, pIdx) => (
                    <span
                      key={pIdx}
                      className={`px-2 py-1 ${panelColors[placement.panelIndex % panelColors.length]} text-white rounded text-xs`}
                    >
                      {mmToDisplayStr(placement.width, unit)} × {mmToDisplayStr(placement.height, unit)}
                      {placement.rotated && ' ↻'}
                    </span>
                  ))}
                  {plan.wasteArea > 0 && (
                    <span className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs">
                      {((plan.wasteArea / (plan.sheetWidth * plan.sheetHeight)) * 100).toFixed(1)}% waste
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default SheetSolutionCard
