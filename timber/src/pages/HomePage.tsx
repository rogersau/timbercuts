import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Ruler, Grid3X3 } from 'lucide-react'
import Layout from '@/components/Layout'

export default function HomePage() {
  return (
    <Layout title="Cut Optimiser" description="Minimise waste and cost for your cutting needs. Choose your cutting mode below.">

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
                  <li>• Optionally follow grain direction</li>
                </ul>
                <Button className="mt-6 w-full" size="lg">
                  Start Sheet Cutting
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
</Layout>
  )
}
