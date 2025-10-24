import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - gelmanicure",
  description: "Review the terms and conditions for using the gelmanicure website and purchasing our products.",
}

const sections = [
  {
    heading: "Acceptance of Terms",
    content:
      "By accessing gelmanicure.com or purchasing our products, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please discontinue use of the site.",
  },
  {
    heading: "Product Availability & Pricing",
    content:
      "We make every effort to display accurate product information and pricing. Availability, descriptions, and pricing are subject to change without prior notice. We reserve the right to limit quantities or refuse orders at our discretion.",
  },
  {
    heading: "Orders & Payment",
    content:
      "Orders are confirmed once payment is authorized. We use secure third-party processors and do not store full payment card numbers. If an order cannot be fulfilled, we will cancel it and issue a refund to your original payment method.",
  },
  {
    heading: "Shipping & Returns",
    content:
      "Shipping timelines start once the order is processed. Returns are accepted within 30 days of delivery for unopened merchandise, according to our Returns Policy. Original shipping fees are non-refundable unless the product was defective or incorrect.",
  },
  {
    heading: "Account Responsibilities",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials and restricting access to your devices. Notify us immediately if you suspect unauthorized access.",
  },
  {
    heading: "Intellectual Property",
    content:
      "All content on this site—including images, text, graphics, and logos—is owned by gelmanicure or our content creators. You may not copy, distribute, or use materials without written permission.",
  },
  {
    heading: "Limitation of Liability",
    content:
      "To the fullest extent permitted by law, gelmanicure is not liable for indirect, incidental, or consequential damages arising from the use of our products or services.",
  },
  {
    heading: "Governing Law",
    content:
      "These terms are governed by the laws of the State of California, without regard to conflict of law principles. Any disputes will be handled in the state or federal courts located in Los Angeles County, California.",
  },
  {
    heading: "Contact",
    content:
      "Questions about these terms? Email gelmanicure-nail@outlook.com or mail us at 2104 Sunset Blvd, Suite 120, Los Angeles, CA 90026.",
  },
]

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4">Terms of Service</p>
        <h1 className="text-4xl font-bold mb-4">Guidelines For Shopping With gelmanicure</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These terms ensure a reliable, transparent experience every time you shop with us. Please review them before
          placing an order or using our site.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {sections.map((section) => (
          <section key={section.heading} className="bg-card border border-border rounded-lg p-8 space-y-3">
            <h2 className="text-2xl font-semibold">{section.heading}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
          </section>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center mt-16 space-y-4">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
    </div>
  )
}
