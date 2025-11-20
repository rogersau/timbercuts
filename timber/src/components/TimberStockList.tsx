// JSX runtime import not required
import InputGroup from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { type TimberStock } from '@/lib/timber-optimizer'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

type TimberStockListProps = {
  timbers: TimberStock[]
  unit: 'mm' | 'in'
  addTimber: () => void
  removeTimber: (idx: number) => void
  updateTimber: (idx: number, field: keyof TimberStock, value: number) => void
}

export function TimberStockList({ timbers, unit, addTimber, removeTimber, updateTimber }: TimberStockListProps) {
  return (
    <div>
      {timbers.map((timber, index) => (
        <div key={index} className="flex gap-2 items-center">
          <div className="flex-1">
            <InputGroup
              placeholder={`Length (${unit})`}
              value={timber.length ? mmToDisplayNumber(timber.length, unit) : ''}
              onChange={(e) => updateTimber(index, 'length', displayToMM(Number(e.target.value), unit))}
              suffix={unit}
              type="number"
            />
          </div>
          <div className="w-36">
            <InputGroup
              prefix="$"
              placeholder="Price"
              value={typeof timber.price === 'number' ? timber.price.toFixed(2) : ''}
              onChange={(e) => updateTimber(index, 'price', Number(e.target.value))}
              type="number"
              step={0.01}
            />
          </div>
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
      <div className="mt-2">
        <Button onClick={addTimber} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Timber</span>
        </Button>
      </div>
    </div>
  )
}

export default TimberStockList
