import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsDialog } from '@/components/SettingsDialog'

interface ControlPanelProps {
  isCalculating: boolean
  calculate: () => void
  kerf: number
  setKerf: (kerf: number) => void
  unit: 'mm' | 'in'
  setUnit: (unit: 'mm' | 'in') => void
  mode: 'cost' | 'waste'
  setMode: (mode: 'cost' | 'waste') => void
}

export default function ControlPanel({
  isCalculating,
  calculate,
  kerf,
  setKerf,
  unit,
  setUnit,
  mode,
  setMode
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button 
        className="w-full" 
        size="lg" 
        onClick={calculate}
        disabled={isCalculating}
      >
        {isCalculating ? (
          <>Calculating...</>
        ) : (
          <>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Optimal Cuts
          </>
        )}
      </Button>
      
      <SettingsDialog 
        kerf={kerf} 
        setKerf={setKerf} 
        unit={unit} 
        setUnit={setUnit} 
        mode={mode} 
        setMode={setMode} 
      />
    </div>
  )
}
