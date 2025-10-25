import type { Metadata } from "next"
import { Sparkles, Heart, Palette, Award, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "About gelmanicure",
  description:
    "Meet the small team building gelmanicure and our mission to craft salon-quality press-on nails for modern routines.",
}

const values = [
  {
    icon: Sparkles,
    title: "Small-Batch Quality",
    description: "We produce each run in limited batches so we can monitor finish, fit, and wear before scaling.",
  },
  {
    icon: Palette,
    title: "Iterative Design",
    description: "Every shade and silhouette is refined through rapid prototyping and feedback from our earliest supporters.",
  },
  {
    icon: Heart,
    title: "Care-First Experience",
    description:
      "Comfort-fit forms, breathable gels, and gentle removal guidance keep your natural nails healthy between sets.",
  },
  {
    icon: Users,
    title: "Built With Community",
    description:
      "We co-create with a tight group of pros and nail enthusiasts, inviting feedback on every curve, color, and finish.",
  },
  {
    icon: Award,
    title: "Transparent Craft",
    description:
      "We share sourcing stories, test results, and packaging decisions openly so you know exactly what arrives at your door.",
  },
]

const milestones = [
  {
    year: "2024",
    headline: "Idea & First Sketches",
    detail: "We mapped out gelmanicure after struggling to find press-ons that felt salon-level without salon pricing.",
  },
  {
    year: "2024",
    headline: "Prototype Sessions",
    detail: "Small tester groups helped us tune the fit, adhesives, and wear tests before placing any production orders.",
  },
  {
    year: "2025",
    headline: "Soft Launch",
    detail: "We introduced our first capsule sets online, prioritizing responsive support and real-time product tweaks.",
  },
  {
    year: "2025",
    headline: "Growing With You",
    detail: "Today we are a lean team shipping in small waves while expanding shades, lengths, and tutorials with our community.",
  },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4">About gelmanicure</p>
        <h1 className="text-4xl font-bold mb-4">Elevated Press-On Nails, Crafted With Intention</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          gelmanicure is an emerging studio built by founders who believe salon artistry should be accessible without
          sacrificing quality. We obsess over every pigment, curve, and finish so your manicure moment feels effortless
          yet extraordinary—even while we are still learning and growing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {values.map((value) => (
          <div key={value.title} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <value.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{value.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {milestones.map((milestone) => (
            <div key={milestone.year} className="text-center md:text-left">
              <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">{milestone.year}</div>
              <h3 className="font-medium mb-2">{milestone.headline}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{milestone.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-semibold">Our Promise</h2>
        <p className="text-muted-foreground leading-relaxed">
          We believe beauty rituals should enrich, not exhaust. From inclusive sizing to mindful packaging, every early
          decision at gelmanicure centers on your confidence and comfort. Thank you for growing with us.
        </p>
      </div>
    </div>
  )
}
