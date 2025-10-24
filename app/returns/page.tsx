import type { Metadata } from "next"
import { RotateCcw, ShieldCheck, Clock, Package, MessageSquare } from "lucide-react"
import { ReturnRequestForm } from "./return-request-form"

export const metadata: Metadata = {
  title: "Returns & Exchanges - gelmanicure",
  description: "Start a return or exchange for your gelmanicure order and review our return policy.",
}

const highlights = [
  {
    icon: ShieldCheck,
    title: "30-Day Assurance",
    description: "Unworn, unopened press-on sets can be returned within 30 days of delivery for a refund or exchange.",
  },
  {
    icon: Package,
    title: "Easy Exchanges",
    description: "Swap for a different size or style at no additional cost. We will guide you through the process.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Once we receive your return, refunds post within 3-5 business days to the original payment method.",
  },
  {
    icon: MessageSquare,
    title: "Personal Support",
    description: "Our team is ready to answer questions about fit, color, or application before you send anything back.",
  },
]

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4">Returns & Exchanges</p>
        <h1 className="text-4xl font-bold mb-4">We Want You To Love Your Manicure</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          If something is not quite right, start a return below. Keep sets unopened and include all accessories so we
          can process your request quickly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {highlights.map((highlight) => (
          <div key={highlight.title} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <highlight.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{highlight.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 mb-16">
        <div className="flex items-center gap-3 mb-6">
          <RotateCcw className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Start a Return</h2>
        </div>
        <ReturnRequestForm />
      </div>

      <div className="max-w-3xl mx-auto space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          Need help choosing a better fit or finish? Email gelmanicure-nail@outlook.com with photos of your manicure goals
          and we will suggest the best sets for your next order.
        </p>
        <p>
          For hygiene reasons, we can only accept unopened products. If your set arrived damaged, please attach a photo
          so we can fast-track replacements.
        </p>
      </div>
    </div>
  )
}
