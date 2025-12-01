import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
} from '@/components/ui/input-group'
import { Button } from '@/components/ui/button'
import { Trash2, Plus } from 'lucide-react'
import { type RequiredPanel } from '@/lib/sheet-optimizer'
import { mmToDisplayNumber, displayToMM } from '@/lib/units'

type Props = {
  panels: RequiredPanel[]
  unit: 'mm' | 'in'
  addPanel: () => void
  removePanel: (idx: number) => void
  updatePanel: (idx: number, field: keyof RequiredPanel, value: number | string | boolean) => void
}

export function PanelList({ panels, unit, addPanel, removePanel, updatePanel }: Props) {
  return (
    <div className="space-y-2">
      {panels.map((panel, index) => (
        <div key={index} className="flex flex-wrap sm:flex-nowrap gap-2 items-center py-2 border-b border-border last:border-0 sm:py-0 sm:border-0">
          {/* Width */}
          <div className="flex-1 min-w-[calc(50%-1rem)] sm:min-w-0">
            <InputGroup>
              <InputGroupInput
                type="number"
                placeholder="Width"
                value={panel.width ? mmToDisplayNumber(panel.width, unit) : ''}
                onChange={(e) =>
                  updatePanel(index, 'width', displayToMM(Number(e.target.value), unit))
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
                placeholder="Height"
                value={panel.height ? mmToDisplayNumber(panel.height, unit) : ''}
                onChange={(e) =>
                  updatePanel(index, 'height', displayToMM(Number(e.target.value), unit))
                }
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>{unit}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </div>
          {/* Quantity */}
          <div className="flex-1 min-w-[calc(50%-1rem)] sm:min-w-0 sm:max-w-20">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>×</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                placeholder="1"
                value={panel.quantity || ''}
                onChange={(e) => updatePanel(index, 'quantity', Number(e.target.value))}
                type="number"
              />
            </InputGroup>
          </div>
          {/* Delete */}
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => removePanel(index)}
            disabled={panels.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="mt-2">
        <Button onClick={addPanel} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Panel</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  )
}

export default PanelList
