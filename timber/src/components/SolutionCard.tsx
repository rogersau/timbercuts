import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { mmToDisplayStr } from '@/lib/units'
import type { Solution } from '@/lib/timber-optimizer'

type Props = {
  solution: Solution
  unit: 'mm' | 'in'
}

export function SolutionCard({ solution, unit }: Props) {
  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle>Optimal Solution</CardTitle>
        <CardDescription>Most cost-effective cutting plan</CardDescription>
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

        <div className="space-y-3">
          <h4 className="font-semibold">Cutting Plans:</h4>
          {solution.plans.map((plan, index) => (
            <div key={index} className="p-3 sm:p-4 border rounded-lg space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="font-medium text-sm sm:text-base">
                  Timber #{index + 1}{' '}
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
