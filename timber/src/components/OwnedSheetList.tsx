import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { type OwnedSheet } from '@/lib/sheet-optimizer'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

type Props = {
  ownedSheets: OwnedSheet[]
  unit: 'mm' | 'in'
  addOwnedSheet: () => void
  removeOwnedSheet: (idx: number) => void
  updateOwnedSheet: (idx: number, field: keyof OwnedSheet, value: number) => void
}

export function OwnedSheetList({
  ownedSheets,
  unit,
  addOwnedSheet,
  removeOwnedSheet,
  updateOwnedSheet,
}: Props) {
  return (
    <div>
      {ownedSheets.length === 0 && (
        <p className="text-sm text-muted-foreground mb-2">No sheets on hand yet.</p>
      )}
      {ownedSheets.map((sheet, index) => (
        <div key={index} className="flex gap-2 items-center py-1 flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-[80px]">
            <InputGroup>
              <InputGroupInput
                type="number"
                value={sheet.width ? mmToDisplayNumber(sheet.width, unit) : ''}
                placeholder="Width"
                onChange={(e) =>
                  updateOwnedSheet(index, 'width', displayToMM(Number(e.target.value), unit))
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <span className="text-muted-foreground">×</span>
          <div className="flex-1 min-w-[80px]">
            <InputGroup>
              <InputGroupInput
                type="number"
                value={sheet.height ? mmToDisplayNumber(sheet.height, unit) : ''}
                placeholder="Height"
                onChange={(e) =>
                  updateOwnedSheet(index, 'height', displayToMM(Number(e.target.value), unit))
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="w-20">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>×</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Qty"
                value={sheet.quantity || ''}
                onChange={(e) => updateOwnedSheet(index, 'quantity', Number(e.target.value))}
                type="number"
              />
            </InputGroup>
          </div>
          <Button variant="outline" size="icon" onClick={() => removeOwnedSheet(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="mt-2">
        <Button onClick={addOwnedSheet} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Owned Sheet</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  )
}

export default OwnedSheetList
