import type { Metadata } from "next"
import { Leaf, Recycle, Droplets, PackageCheck, Globe2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Sustainability at gelmanicure",
  description:
    "Learn how gelmanicure reduces waste, sources responsible materials, and supports a cleaner beauty routine.",
}

const initiatives = [
  {
    icon: Leaf,
    title: "Low-Waste Production",
    description:
      "We craft each press-on set in small batches, minimizing excess gels and keeping quality control high.",
  },
  {
    icon: PackageCheck,
    title: "Thoughtful Packaging",
    description:
      "Our boxes ship flat for efficiency, use recycled paper, and feature trays designed for multiple reuses.",
  },
  {
    icon: Recycle,
    title: "Recyclable Components",
    description: "From alcohol wipes to instruction cards, every accessory includes clear recycling or reuse guidance.",
  },
  {
    icon: Droplets,
    title: "Gentle Formulas",
    description:
      "Our medical-grade gels are free from harsh solvents and produced in facilities that recycle water resources.",
  },
  {
    icon: Globe2,
    title: "Carbon-Conscious Shipping",
    description:
      "We consolidate fulfillment and partner with carriers investing in carbon-neutral initiatives for last-mile delivery.",
  },
]

const commitments = [
  "Source 80% of packaging from FSC-certified partners by the end of the year.",
  "Expand our refill system so you can refresh designs without replacing the full kit.",
  "Publish quarterly impact reports detailing material sourcing and waste reduction.",
  "Support community clean-up programs that empower creatives in the regions we operate.",
]

export default function SustainabilityPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4">Sustainability</p>
        <h1 className="text-4xl font-bold mb-4">Beauty With A Lighter Footprint</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Sustainability guides every decision we make—from the pigments inside each capsule to the partners who ship
          your sets. gelmanicure is committed to luxurious experiences that respect both people and planet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {initiatives.map((initiative) => (
          <div key={initiative.title} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <initiative.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{initiative.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{initiative.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">Our Near-Term Commitments</h2>
        <ul className="space-y-4">
          {commitments.map((commitment) => (
            <li key={commitment} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <span>{commitment}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl font-semibold">Join Our Progress</h2>
        <p className="text-muted-foreground leading-relaxed">
          We are continually improving our environmental practices and welcome collaborations with suppliers, artists,
          and customers. Share your ideas with gelmanicure-nail@outlook.com—we would love to hear from you.
        </p>
      </div>
    </div>
  )
}
