import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, FileSpreadsheet } from 'lucide-react'
import { mmToDisplayStr } from '@/lib/units'
import type { Solution } from '@/lib/timber-optimizer'

type Props = {
  solution: Solution
  unit: 'mm' | 'in'
}

export function SolutionCard({ solution, unit }: Props) {
  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    // Header
    let csv = 'Timber ID,Type,Length,Cost,Cuts,Waste,Kerf\n'
    
    solution.plans.forEach((plan, index) => {
      const type = plan.isOwned ? 'Owned' : 'Purchased'
      const cutsStr = plan.cuts.map(c => mmToDisplayStr(c, unit)).join('; ')
      const wasteStr = mmToDisplayStr(plan.waste, unit)
      const kerfStr = mmToDisplayStr(plan.kerfUsed, unit)
      const lengthStr = mmToDisplayStr(plan.timberLength, unit)
      
      csv += `${index + 1},${type},${lengthStr},${plan.timberPrice.toFixed(2)},"${cutsStr}",${wasteStr},${kerfStr}\n`
    })
    
    // Summary
    csv += `\nSummary\n`
    csv += `Total Cost,${solution.totalCost.toFixed(2)}\n`
    csv += `Total Waste,${mmToDisplayStr(solution.totalWaste, unit)}\n`
    csv += `Total Kerf,${mmToDisplayStr(solution.totalKerf, unit)}\n`
    csv += `Timbers Used,${solution.totalTimbers}\n`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cutting-plan-${Date.now()}.csv`
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
          <CardDescription>Most cost-effective cutting plan</CardDescription>
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
            <div className="text-xl sm:text-2xl font-bold">
              {mmToDisplayStr(solution.totalWaste, unit)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Waste</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">
              {mmToDisplayStr(solution.totalKerf, unit)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Kerf Used</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{solution.totalTimbers}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Timbers</div>
          </div>
        </div>

        {solution.purchasedTimbersNeeded > 0 && (
          <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-400 dark:border-amber-600 rounded-lg">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
              🛒 Shopping List
            </h4>
            <ul className="space-y-1">
              {Object.entries(
                solution.plans
                  .filter(p => !p.isOwned)
                  .reduce((acc, plan) => {
                    const key = `${mmToDisplayStr(plan.timberLength, unit)} @ $${plan.timberPrice.toFixed(2)}`
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

        <div className="space-y-3">
          <h4 className="font-semibold">Cutting Plans:</h4>
          {solution.plans.map((plan, index) => (
            <div key={index} className="p-3 sm:p-4 border rounded-lg space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-sm sm:text-base">
                  Piece #{index + 1}{' '}
                  {plan.isOwned && <span className="text-xs text-primary">(Owned)</span>}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {mmToDisplayStr(plan.timberLength, unit)}{' '}
                  {!plan.isOwned && `@ $${plan.timberPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {plan.cuts.map((cut, cutIndex) => (
                  <span
                    key={cutIndex}
                    className={
                      plan.isOwned
                        ? 'px-2 sm:px-3 py-1 bg-green-500 text-white rounded-full text-xs sm:text-sm'
                        : 'px-2 sm:px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs sm:text-sm'
                    }
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
  )
}

export default SolutionCard
