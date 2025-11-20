import InputGroup from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { type RequiredCut } from '@/lib/timber-optimizer'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

type Props = {
  cuts: RequiredCut[]
  unit: 'mm'|'in'
  addCut: () => void
  removeCut: (idx: number) => void
  updateCut: (idx: number, field: keyof RequiredCut, value: number) => void
}

export function CutsList({ cuts, unit, addCut, removeCut, updateCut }: Props) {
  return (
    <div>
      {cuts.map((cut, index) => (
        <div key={index} className="flex gap-2 items-center">
          <InputGroup
            type="number"
            placeholder={`Length (${unit})`}
            value={cut.length ? mmToDisplayNumber(cut.length, unit) : ''}
            onChange={(e) => updateCut(index, 'length', displayToMM(Number(e.target.value), unit))}
            className="flex-1"
            suffix={unit}
          />
          <div className="w-24">
            <InputGroup
              placeholder="Qty"
              value={cut.quantity || ''}
              onChange={(e) => updateCut(index, 'quantity', Number(e.target.value))}
              type="number"
            />
          </div>
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
      <div className="mt-2">
        <Button onClick={addCut} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Cut</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  )
}

export default CutsList
