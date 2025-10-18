import type { Metadata } from "next"
import { Mail, Clock } from "lucide-react"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact gelmanicure Support",
  description: "Get in touch with the gelmanicure support team for order questions, product advice, or partnerships.",
}

const contactChannels = [
  {
    icon: Mail,
    heading: "Email Us",
    detail: "support@gelmanicure.com",
    helper: "We respond within one business day.",
  },
  {
    icon: Clock,
    heading: "Returns & Shipping Help",
    detail: "Use our Returns page for prepaid requests and find shipping timelines in the Help Center.",
    helper: "We’ll follow up by email once your request lands in our queue.",
  },
]

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4">Contact</p>
        <h1 className="text-4xl font-bold mb-4">We Are Here To Help</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Whether you are checking on an order, need shade advice, or want to collaborate—our team would love to hear
          from you. Send a note below or connect using the channels that suit you best.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {contactChannels.map((channel) => (
          <div key={channel.heading} className="bg-card border border-border rounded-lg p-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <channel.icon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{channel.heading}</h2>
            <p className="text-sm font-medium">{channel.detail}</p>
            <p className="text-sm text-muted-foreground">{channel.helper}</p>
          </div>
        ))}
      </div>

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">Send Us a Message</h2>
        <ContactForm />
      </div>
    </div>
  )
}
