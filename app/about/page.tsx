import type { Metadata } from "next"
import { Sparkles, Heart, Palette, Award, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "About gelmanicure",
  description:
    "Discover the story behind gelmanicure and our dedication to crafting salon-quality press-on nails you can apply at home.",
}

const values = [
  {
    icon: Sparkles,
    title: "Salon-Level Finish",
    description: "Each set is designed with premium gels and hand-painted detailing for a refined, long-lasting shine.",
  },
  {
    icon: Palette,
    title: "Design-Forward Aesthetic",
    description: "Our creative team blends runway trends with everyday wearability so you always have a set that fits the moment.",
  },
  {
    icon: Heart,
    title: "Kind to Your Nails",
    description:
      "Comfort-fit forms, breathable gels, and gentle removal guidance help you maintain healthy natural nails between looks.",
  },
  {
    icon: Users,
    title: "Community-Led Creation",
    description:
      "We prototype collections with a panel of beauty pros and nail enthusiasts to refine every curve, color, and finish.",
  },
  {
    icon: Award,
    title: "Trusted Craftsmanship",
    description:
      "From rigorous wear-testing to sustainable packaging, we sweat the details so your at-home manicure feels truly elevated.",
  },
]

const milestones = [
  {
    year: "2021",
    headline: "The Idea Takes Shape",
    detail:
      "Our founder sketched the first gelmanicure designs after searching for premium press-ons that matched salon standards.",
  },
  {
    year: "2022",
    headline: "Studio & Sourcing",
    detail:
      "We partnered with artisans using medical-grade gels, set up our first design studio, and released limited beta sets.",
  },
  {
    year: "2023",
    headline: "Collection Launch",
    detail:
      "The Classics and Night Out collections debuted, quickly earning praise for comfort fit and multi-week wearability.",
  },
  {
    year: "2024",
    headline: "Community Expansion",
    detail:
      "Our editorial-led blog, pro tutorials, and virtual fittings helped hundreds of thousands find their perfect match.",
  },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4">About gelmanicure</p>
        <h1 className="text-4xl font-bold mb-4">Elevated Press-On Nails, Crafted With Intention</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          gelmanicure was born from a simple idea: salon artistry should be accessible without sacrificing quality. We
          obsess over every pigment, curve, and finish so your manicure moment feels effortless yet extraordinary.
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
          We believe that beauty rituals should enrich, not exhaust. From inclusive sizing to mindful packaging, every
          decision at gelmanicure focuses on your confidence and comfort. Thank you for inviting us into your routine.
        </p>
      </div>
    </div>
  )
}
