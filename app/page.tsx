import { Navigation } from "@/components/navigation"
import { ROICalculatorSection } from "@/components/roi-calculator-section"
import { AiPlatformComparison } from "@/components/ai-platform-comparison"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <ROICalculatorSection/>

      <Footer />
    </main>
  )
}
