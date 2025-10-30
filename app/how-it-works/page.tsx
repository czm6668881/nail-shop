import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Sparkles, Leaf, ShieldCheck, Clock, Sparkle, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig, toAbsoluteUrl } from "@/lib/config/site"

export const metadata: Metadata = {
  title: `How It Works | ${siteConfig.name}`,
  description:
    "Discover how gelmanicure press-on gel nails deliver salon results at home. Learn about prep, application, wear time, and eco-friendly care in three easy steps.",
  alternates: {
    canonical: toAbsoluteUrl("/how-it-works"),
  },
  openGraph: {
    title: `How It Works | ${siteConfig.name}`,
    description:
      "Step-by-step guide to applying reusable gel press-ons. Explore prep, application, and aftercare for long-wear manicures without the salon visit.",
    url: toAbsoluteUrl("/how-it-works"),
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `How It Works | ${siteConfig.name}`,
    description:
      "See how gelmanicure gel tips apply in three steps. Eco materials, damage-free removal, and wearable routines explained.",
  },
}

const STEPS = [
  {
    icon: Sparkle,
    title: "Pick your gel set",
    description:
      "Choose from breathable, salon-inspired designs sized for every nail bed. Every capsule ships with an inclusive size run so you can find your perfect fit.",
  },
  {
    icon: Leaf,
    title: "Prep in minutes",
    description:
      "Buff, cleanse, and align the gel tab. Our medical-grade adhesive is vegan, odorless, and kind to natural nails.",
  },
  {
    icon: ShieldCheck,
    title: "Wear, care, and reuse",
    description:
      "Seal each nail and your manicure is ready in about five minutes. Remove with warm water and reapply with fresh gel tabs whenever you like.",
  },
]

const KIT_CONTENTS = [
  "Reusable gel tips spanning XS–XL",
  "Medical-grade gel tabs and residue-free removal tool",
  "Cuticle pusher, prep file, and lint-free wipes",
  "Reusable magnetic storage tray with design protectors",
  "Eco packaging and printed prep card in English & 中文",
]

const CARE_TIPS = [
  "Avoid water for the first hour so the adhesive sets fully.",
  "Massage cuticle oil nightly to keep the surrounding skin supple.",
  "Store removed tips in their tray, then cleanse with alcohol before the next wear.",
  "Use a soft buffer to refresh shine and reshape edges between wears.",
]

const FAQS = [
  {
    question: "Do I need a UV lamp?",
    answer:
      "No. Our gel tabs cure with gentle finger pressure. If you prefer extra durability, a 30-second UV flash is optional but not required.",
  },
  {
    question: "How many times can I reuse a set?",
    answer:
      "With proper prep and cleaning, each set can be worn up to five times. Replace gel tabs whenever you reapply for the best bond.",
  },
  {
    question: "Will this damage my natural nails?",
    answer:
      "The breathable base and soak-off removal keep nails safe. Simply loosen with warm water and a drop of oil—no acetone or drilling needed.",
  },
  {
    question: "What if I’m between sizes?",
    answer:
      "Choose the smaller tip for a snug fit, or lightly file the sides. Our fit specialists can recommend sizing via live chat or email.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background to-muted/40">
        <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:py-24">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.35em] text-primary">How it works</p>
            <h1 className="text-3xl lg:text-5xl font-bold text-balance">
              Apply reusable gel nails at home—with studio gloss and zero guesswork
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our three-step ritual pairs breathable materials with pro tools so you can press, wear, and reuse your favourite designs whenever inspiration strikes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/products">Shop nail capsules</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/help">Download the prep checklist</Link>
              </Button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary/5 shadow-lg">
            <Image
              src="/luxury-press-on-nails-hero-image-elegant-hands.jpg"
              alt="Woman applying reusable gel press-on nails"
              width={720}
              height={540}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4">Three steps to a breathable gel manicure</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each capsule includes a reusable storage tray, prep tools, and our medical-grade gel tabs so you can press, refresh, and repeat.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-border bg-background">
        <div className="container mx-auto px-4 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <p className="text-sm uppercase tracking-[0.35em] text-primary">Step-by-step visuals</p>
            <h2 className="text-3xl lg:text-4xl font-semibold">See the full five-minute ritual</h2>
            <p className="text-muted-foreground text-lg">
              Follow the illustrated guides below to master both application and gentle removal. Save them to your phone for quick reference any time.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm space-y-4">
              <h3 className="text-xl font-semibold">Wear method</h3>
              <p className="text-sm text-muted-foreground">
                Prep, align, and smooth the gel tab for a breathable seal—your mani is ready in about five minutes.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/60 bg-background">
                <Image
                  src="/blog-gel-manicure-steps.svg"
                  alt="Six illustrated steps showing how to prep, align, and apply gel press-on nails."
                  width={960}
                  height={540}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
            <div className="rounded-3xl border border-border/70 bg-card/95 p-6 shadow-sm space-y-4">
              <h3 className="text-xl font-semibold">Removal method</h3>
              <p className="text-sm text-muted-foreground">
                Loosen with warm water, lift from the side, and store tips for the next wear—no acetone or drilling required.
              </p>
              <div className="rounded-2xl overflow-hidden border border-border/60 bg-background">
                <Image
                  src="/how-it-works-removal.svg"
                  alt="Three illustrated steps showing how to soak, lift, and reuse gel press-on nails."
                  width={960}
                  height={540}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-border bg-background">
        <div className="container mx-auto px-4 grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-primary">Inside the capsule</p>
            <h2 className="text-3xl lg:text-4xl font-semibold">Everything you need for salon-grade results</h2>
            <p className="text-muted-foreground text-lg">
              Every gelmanicure capsule arrives with reusable tools so you can protect, store, and refresh your favourite sets without a salon appointment.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {KIT_CONTENTS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help">Request a sizing consultation</Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-8 space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-primary" />
              Gentle removal tips
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ready for a change? Dip fingertips in warm water with a drop of nourishing oil. Gently lift from the side using the included removal wand—no acetone, drills, or dryness.
            </p>
            <div className="rounded-2xl border border-border/70 bg-background px-5 py-4">
              <h4 className="text-sm font-semibold mb-2">Eco commitment</h4>
              <p className="text-sm text-muted-foreground">
                Our gel tabs are vegan and odour-free, packaging is fully recyclable, and every order ships carbon-neutral.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/20 border-b border-border">
        <div className="container mx-auto px-4 grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-semibold">Aftercare &amp; longevity</h2>
            <p className="text-muted-foreground text-lg">
              Following these small habits keeps your press-ons luminous for longer wear and healthier natural nails.
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {CARE_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card/95 p-6 space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.question} className="space-y-2">
                <h3 className="text-base font-semibold">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-semibold">Ready for your first gelmanicure set?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore bestselling finishes, or chat with our stylists for a personalised recommendation. Your kit ships free, worldwide.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/products?filter=bestsellers">Shop best sellers</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Contact our stylists</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
