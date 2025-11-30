import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ruler, Grid3X3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Cut Optimiser</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Minimise waste and cost for your cutting needs. Choose your cutting mode below.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-8">
          <Link to="/linear" className="block">
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Ruler className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Linear Cutting</CardTitle>
                <CardDescription>
                  Optimise cuts for timber lengths, pipes, rods, and other linear materials
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Define available stock lengths</li>
                  <li>• Specify required cut lengths</li>
                  <li>• Minimise waste and cost</li>
                </ul>
                <Button className="mt-6 w-full" size="lg">
                  Start Linear Cutting
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/sheet" className="block">
            <Card className="h-full hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Grid3X3 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Sheet Cutting</CardTitle>
                <CardDescription>
                  Optimise cuts for plywood, MDF, sheet metal, and other panel materials
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Define available sheet sizes</li>
                  <li>• Specify required panel dimensions</li>
                  <li>• Visual cutting layout</li>
                </ul>
                <Button className="mt-6 w-full" size="lg">
                  Start Sheet Cutting
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
