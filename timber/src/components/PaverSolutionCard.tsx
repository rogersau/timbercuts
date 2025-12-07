import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, FileSpreadsheet } from 'lucide-react'
import type { PaverCalculatorResult } from '@/lib/paver-calculator'

type Props = {
  result: PaverCalculatorResult
  unit: 'mm' | 'in'
  paverName?: string
  patternName?: string
}

export function PaverSolutionCard({ result, unit, paverName, patternName }: Props) {
  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    let csv = 'Metric,Value\n'
    csv += `Total Area,${result.totalAreaM2.toFixed(2)} m²\n`
    csv += `Paver Coverage,${result.coveragePerM2.toFixed(1)} per m²\n`
    csv += `Pavers Needed (exact),${result.paversNeeded}\n`
    csv += `Waste Allowance,${(result.wastePercentage * 100).toFixed(0)}%\n`
    csv += `Pavers with Waste,${result.paversWithWaste}\n`
    if (paverName) csv += `Paver Type,${paverName}\n`
    if (patternName) csv += `Laying Pattern,${patternName}\n`

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `paver-calculation-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatArea = (mm2: number): string => {
    if (unit === 'in') {
      // Convert mm² to square feet
      const sqFt = mm2 / (304.8 * 304.8)
      return `${sqFt.toFixed(2)} ft²`
    }
    return `${result.totalAreaM2.toFixed(2)} m²`
  }

  return (
    <Card className="border-2 border-primary print:border-0 print:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Paver Calculation Results</CardTitle>
          <CardDescription>Estimated pavers needed for your project</CardDescription>
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
            <div className="text-xl sm:text-2xl font-bold">{formatArea(result.totalAreaMm2)}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Area</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{result.paversNeeded}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Pavers Needed</div>
          </div>
          <div className="text-center col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-primary">{result.paversWithWaste}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Recommended (with waste)</div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950 border-2 border-amber-400 dark:border-amber-600 rounded-lg">
          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
            🛒 Order Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-amber-900 dark:text-amber-100">
              <span>Minimum needed:</span>
              <span className="font-medium">{result.paversNeeded} pavers</span>
            </div>
            <div className="flex justify-between text-amber-900 dark:text-amber-100">
              <span>Waste allowance ({(result.wastePercentage * 100).toFixed(0)}%):</span>
              <span className="font-medium">+{result.paversWithWaste - result.paversNeeded} pavers</span>
            </div>
            <div className="pt-2 border-t border-amber-300 dark:border-amber-700 flex justify-between font-bold text-amber-900 dark:text-amber-100">
              <span>Recommended order:</span>
              <span>{result.paversWithWaste} pavers</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 border rounded-lg">
            <div className="text-sm text-muted-foreground">Coverage Rate</div>
            <div className="text-lg font-semibold">{result.coveragePerM2.toFixed(1)} per m²</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="text-sm text-muted-foreground">Paver Area</div>
            <div className="text-lg font-semibold">
              {(result.paverAreaMm2 / 1000000).toFixed(4)} m²
            </div>
          </div>
          {paverName && (
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Paver Type</div>
              <div className="text-lg font-semibold">{paverName}</div>
            </div>
          )}
          {patternName && (
            <div className="p-3 border rounded-lg">
              <div className="text-sm text-muted-foreground">Laying Pattern</div>
              <div className="text-lg font-semibold">{patternName}</div>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">💡 Tip:</p>
          <p>
            The recommended order includes a {(result.wastePercentage * 100).toFixed(0)}% waste allowance
            for cuts, breakage, and future repairs. Consider ordering extra if your area has many curves or angles.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PaverSolutionCard
