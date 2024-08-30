import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-5xl font-bold mb-4">TaskTitude</h1>
      <p className="text-xl mb-8">Elevate your productivity with smart scheduling</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Intelligent Scheduling</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white/80">
              Our AI optimizes your day for maximum efficiency
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Time Estimation</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white/80">
              Accurately predict task duration to plan better
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card className="bg-white/10 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Flexible Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-white/80">
              Easily add, edit, and prioritize your to-dos
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <Link href="/scheduler">
        <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-100">
          Get Started
        </Button>
      </Link>
    </div>
  )
}