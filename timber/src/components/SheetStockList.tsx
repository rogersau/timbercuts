import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { type SheetStock, type GrainDirection } from '@/lib/sheet-optimizer'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

type Props = {
  sheets: SheetStock[]
  unit: 'mm' | 'in'
  grainEnabled?: boolean
  addSheet: () => void
  removeSheet: (idx: number) => void
  updateSheet: (idx: number, field: keyof SheetStock, value: number | GrainDirection) => void
}

export function SheetStockList({ sheets, unit, grainEnabled, addSheet, removeSheet, updateSheet }: Props) {
  return (
    <div className="space-y-2">
      {sheets.map((sheet, index) => (
        <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-center py-2 border-b border-border last:border-0 sm:py-0 sm:border-0">
          {/* Width */}
          <div className="flex-1 min-w-[calc(50%-1rem)] sm:min-w-0">
            <InputGroup>
              <InputGroupInput
                type="number"
                value={sheet.width ? mmToDisplayNumber(sheet.width, unit) : ''}
                placeholder="Width"
                onChange={(e) =>
                  updateSheet(index, 'width', displayToMM(Number(e.target.value), unit))
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <span className="text-muted-foreground text-sm hidden sm:inline">×</span>
          {/* Height */}
          <div className="flex-1 min-w-[calc(50%-1rem)] sm:min-w-0">
            <InputGroup>
              <InputGroupInput
                type="number"
                value={sheet.height ? mmToDisplayNumber(sheet.height, unit) : ''}
                placeholder="Height"
                onChange={(e) =>
                  updateSheet(index, 'height', displayToMM(Number(e.target.value), unit))
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
          {/* Price */}
          <div className={`flex-1 sm:min-w-0 sm:max-w-28 ${grainEnabled ? 'min-w-[calc(33%-1rem)]' : 'min-w-[calc(50%-1rem)]'}`}>
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                value={typeof sheet.price === 'number' ? sheet.price.toFixed(2) : ''}
                placeholder="Price"
                onChange={(e) => updateSheet(index, 'price', Number(e.target.value))}
                type="number"
                step={0.01}
              />
            </InputGroup>
          </div>
          {/* Grain Direction */}
          {grainEnabled && (
            <div className="flex-1 min-w-[calc(33%-1rem)] sm:min-w-0 sm:max-w-28">
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={sheet.grain ?? 'none'}
                onChange={(e) => updateSheet(index, 'grain', e.target.value as GrainDirection)}
              >
                <option value="none">No Grain</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
          )}
          {/* Delete */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => removeSheet(index)}
            disabled={sheets.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="mt-2">
        <Button onClick={addSheet} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Sheet Size</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  )
}

export default SheetStockList
