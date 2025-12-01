import { Info, Settings } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

type Props = {
  kerf: number
  setKerf: (kerf: number) => void
  unit: 'mm' | 'in'
  setUnit: (unit: 'mm' | 'in') => void
  mode: 'cost' | 'waste'
  setMode: (mode: 'cost' | 'waste') => void
  grainEnabled?: boolean
  setGrainEnabled?: (enabled: boolean) => void
  showGrainOption?: boolean
}

export function SettingsDialog({ kerf, setKerf, unit, setUnit, mode, setMode, grainEnabled, setGrainEnabled, showGrainOption }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
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
                  Kerf: the width of material removed by the saw blade during each cut. Every cut
                  consumes this amount. Values are shown in the selected measurement unit.
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
                  Select the unit for measurements (mm or inches). Internally values are stored as
                  mm.
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
            <p className="text-sm text-muted-foreground">
              Current:{' '}
              <strong className="text-foreground">{unit === 'mm' ? 'mm' : 'inches'}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Optimization Mode</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  "Lowest total cost" minimizes purchase cost; "Least wastage" minimizes leftover
                  material.
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
              Current:{' '}
              <strong className="text-foreground">
                {mode === 'cost' ? 'Lowest total cost' : 'Least wastage'}
              </strong>
            </p>
          </div>

          {showGrainOption && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Grain Direction</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Enable to specify grain direction for sheets and panels. Panels won't be rotated
                    if it would cause grain misalignment.
                  </TooltipContent>
                </Tooltip>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={grainEnabled ?? false}
                  onChange={(e) => setGrainEnabled?.(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Enable grain direction matching</span>
              </label>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
