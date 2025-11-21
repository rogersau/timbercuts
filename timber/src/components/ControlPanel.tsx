import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ControlPanelProps {
  isCalculating: boolean
  calculate: () => void
}

export default function ControlPanel({
  isCalculating,
  calculate
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
    </div>
  )
}
