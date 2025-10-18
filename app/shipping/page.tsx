import type { Metadata } from "next"
import { Truck, Globe2, Clock, PackageCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Shipping Information - gelmanicure",
  description: "Learn about processing times, shipping rates, and delivery estimates for gelmanicure orders.",
}

const shippingHighlights = [
  {
    icon: PackageCheck,
    title: "Order Processing",
    description: "Every order is quality checked and queued for dispatch within 48 hours. We email tracking details the moment it leaves our studio.",
  },
  {
    icon: Truck,
    title: "Complimentary Shipping",
    description: "Enjoy free insured shipping on every order—domestic or international—with tracking from door to door.",
  },
  {
    icon: Clock,
    title: "Delivery Estimates",
    description: "Most destinations receive their parcel within 15-20 business days after dispatch, depending on local customs.",
  },
  {
    icon: Globe2,
    title: "International Orders",
    description: "Global shipping is included at no extra cost. Our logistics partners handle customs hand-offs so your set arrives smoothly.",
  },
]

const timeline = [
  {
    label: "Order Placed",
    detail: "You receive an instant confirmation with your order number.",
  },
  {
    label: "Processing",
    detail: "Our team quality checks your selected sets and prepares the shipment within 48 hours.",
  },
  {
    label: "Shipped",
    detail: "A shipping confirmation email includes tracking details for real-time updates.",
  },
  {
    label: "Delivered",
    detail: "Track progress to your doorstep. Delivery typically completes within 15-20 business days worldwide.",
  },
]

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
        <p className="text-lg text-muted-foreground">
          We carefully package every gelmanicure order to ensure your press-on nails arrive pristine and ready to wear.
          Review the details below to understand timelines and available services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {shippingHighlights.map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">Typical Delivery Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {timeline.map((step) => (
            <div key={step.label} className="text-center md:text-left">
              <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">{step.label}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
