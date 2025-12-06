import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { type RectangularArea } from '@/lib/paver-calculator'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

type Props = {
  areas: RectangularArea[]
  unit: 'mm' | 'in'
  addArea: () => void
  removeArea: (idx: number) => void
  updateArea: (idx: number, field: keyof RectangularArea, value: number | string) => void
}

export function AreaList({ areas, unit, addArea, removeArea, updateArea }: Props) {
  return (
    <div>
      {areas.map((area, index) => (
        <div key={index} className="flex flex-col gap-2 py-2 border-b last:border-b-0">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Label (optional)"
              value={area.label || ''}
              onChange={(e) => updateArea(index, 'label', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => removeArea(index)}
              disabled={areas.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <InputGroup>
              <InputGroupInput
                type="number"
                placeholder={`Length (${unit})`}
                value={area.length ? mmToDisplayNumber(area.length, unit) : ''}
                onChange={(e) =>
                  updateArea(index, 'length', displayToMM(Number(e.target.value), unit))
                }
                className="flex-1"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <span className="text-muted-foreground">×</span>
            <InputGroup>
              <InputGroupInput
                type="number"
                placeholder={`Width (${unit})`}
                value={area.width ? mmToDisplayNumber(area.width, unit) : ''}
                onChange={(e) =>
                  updateArea(index, 'width', displayToMM(Number(e.target.value), unit))
                }
                className="flex-1"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <Button onClick={addArea} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Area</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  )
}

export default AreaList
