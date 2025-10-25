import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - gelmanicure",
  description: "Understand how gelmanicure collects, uses, and protects your information.",
}

const sections = [
  {
    heading: "Information We Collect",
    body: [
      "Account details such as name, email, and password (stored as a secure hash).",
      "Order information including shipping addresses, payment method tokens, and purchase history.",
      "Site interactions like pages visited, items browsed, and cart activity to personalize your experience.",
      "Support conversations submitted through contact forms or email.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "Fulfill orders, provide customer support, and deliver account updates.",
      "Improve product recommendations, merchandising, and on-site experience.",
      "Send marketing communications when you opt in—with easy unsubscribe controls.",
      "Detect fraud, maintain site security, and comply with legal obligations.",
    ],
  },
  {
    heading: "Sharing & Storage",
    body: [
      "We do not sell your personal data. Limited details are shared with payment processors, shipping carriers, and email providers to complete transactions.",
      "All vendors adhere to strict data protection agreements and only process information necessary for their services.",
      "Data is stored on encrypted infrastructure with access restricted to trained team members.",
    ],
  },
  {
    heading: "Your Choices",
    body: [
      "Update profile details anytime within your account dashboard.",
      "Opt out of marketing emails directly from the email footer.",
      "Request data exports or deletion by reaching out to gelmanicure-nail@outlook.com. We respond within 30 days.",
      "Disable cookies in your browser to limit analytics tracking. Essential cookies remain to support basic site functions.",
    ],
  },
  {
    heading: "Contact Us",
    body: [
      "Questions about this policy? Email gelmanicure-nail@outlook.com.",
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4">Privacy Policy</p>
        <h1 className="text-4xl font-bold mb-4">Your Data. Your Confidence.</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We believe beauty experiences should be effortless—and so should understanding how your information is used.
          This policy outlines the practices that keep your data safe and your preferences respected.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {sections.map((section) => (
          <section key={section.heading} className="bg-card border border-border rounded-lg p-8 space-y-4">
            <h2 className="text-2xl font-semibold">{section.heading}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              {section.body.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
