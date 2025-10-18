import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, LifeBuoy, Package, Receipt, RefreshCcw } from "lucide-react"

export const metadata: Metadata = {
  title: "Help Center - gelmanicure",
  description: "Find answers to common questions about orders, shipping, returns, and product care.",
}

const helpSections = [
  {
    title: "Ordering & Account",
    icon: Receipt,
    items: [
      {
        question: "How do I track my order?",
        answer:
          "Head to the Order History page in your account to view the latest tracking updates. We also send shipping confirmations via email.",
      },
      {
        question: "Can I modify or cancel an order?",
        answer:
          "Orders are processed quickly. Contact us within 12 hours of placing your order and we will do our best to accommodate changes.",
      },
      {
        question: "Do I need an account to checkout?",
        answer:
          "You can checkout as a guest, but creating an account helps you track orders, manage addresses, and save your favorite styles.",
      },
    ],
  },
  {
    title: "Shipping",
    icon: Package,
    items: [
      {
        question: "What shipping options are available?",
        answer:
          "We ship every order with insured standard delivery and complimentary worldwide postage—no minimum spend required.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes. Complimentary international shipping is available on every order, with delivery typically completing in 15-20 business days.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    icon: RefreshCcw,
    items: [
      {
        question: "What is your return policy?",
        answer:
          "Unopened press-on nail sets can be returned within 30 days of delivery. Please review our Returns page for detailed instructions.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Reach out to our customer experience team with your order number and reason for return. Submit the request on our Returns page and ship the items back using your preferred carrier—return postage is customer-paid.",
      },
    ],
  },
  {
    title: "Product Care",
    icon: LifeBuoy,
    items: [
      {
        question: "How long do the nails last?",
        answer:
          "With proper prep, our press-on nails can stay flawless for around seven days. Follow the included instructions for best wear and gentle removal.",
      },
      {
        question: "Can I reuse the nails?",
        answer:
          "Yes. Carefully remove the nails, clean off any adhesive residue, and store them in the original tray to reuse for future occasions.",
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-muted-foreground">
          We are here to make your gelmanicure experience effortless. Browse frequently asked questions or reach out to
          our support team for personalized assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {helpSections.map((section) => (
          <div key={section.title} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <section.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <div className="space-y-4">
              {section.items.map((item) => (
                <div key={item.question}>
                  <h3 className="font-medium mb-1">{item.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 max-w-2xl mx-auto rounded-2xl border border-dashed border-border p-8 text-center">
        <h2 className="text-2xl font-semibold mb-3">Need extra support?</h2>
        <p className="text-muted-foreground mb-6">
          Our customer experience specialists respond within one business day. Share your order number so we can assist
          you faster.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-md border border-primary bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Contact Support
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
