import type { User, Order, Review, Address, BlogPost } from "@/types"

export const mockUser: User = {
  id: "user-1",
  email: "customer@example.com",
  firstName: "Emma",
  lastName: "Wilson",
  avatar: "/placeholder.svg?height=100&width=100",
  createdAt: "2024-06-15T10:00:00Z",
  role: "customer",
}

export const mockAddresses: Address[] = [
  {
    id: "addr-1",
    userId: "user-1",
    firstName: "Emma",
    lastName: "Wilson",
    addressLine1: "123 Fashion Avenue",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    isDefault: true,
  },
  {
    id: "blog-7",
    title: "如何在家一个人做出美丽的美甲 | DIY Gel Manicure at Home",
    slug: "diy-gel-manicure-at-home",
    excerpt:
      "Follow this solo-friendly gel manicure routine to prep, apply, and care for eco-conscious press-on gel nails without leaving home.",
    content: `
      <h2>Why Choose Gel Press-On Nails at Home?</h2>
      <p>Gel press-on nails offer salon-level shine with zero UV lamps, no harsh fumes, and a commitment to reusable designs. Because our adhesive system relies on medical-grade gel tabs, the application is gentle on natural nails while keeping toxins to a minimum.</p>
      <ul>
        <li><strong>Quick transformation:</strong> Create a polished look in under 20 minutes.</li>
        <li><strong>Health-forward formulas:</strong> Odor-free gel tabs avoid the strong chemicals found in traditional acrylic systems.</li>
        <li><strong>Reusable styles:</strong> Remove, cleanse, and reapply your favorite set for multiple wears.</li>
        <li><strong>Travel ready:</strong> Lightweight kits slip into a carry-on so touch-ups are effortless anywhere.</li>
      </ul>

      <h2>What You Need Before You Start</h2>
      <p>Set up a clean, well-lit surface and gather these essentials. Every gelmanicure kit includes the reusable gel nails and adhesive gel tabs—just add a few home staples.</p>
      <ul>
        <li>Reusable gel press-on set in your preferred shape.</li>
        <li>Eco nail file or glass buffer for gentle surface prep.</li>
        <li>Cuticle pusher and lint-free wipes.</li>
        <li>Rubbing alcohol or gentle cleanser to remove natural oils.</li>
        <li>Optional: jojoba oil for hydrating cuticles post-application.</li>
      </ul>

      <h2>Step-by-Step: Solo Gel Manicure Routine</h2>
      <p>Follow the numbered routine below and reference the installation graphic for a quick visual refresher any time you reapply.</p>
      <figure>
        <img src="/blog-gel-manicure-steps.svg" alt="Six illustrated steps demonstrating how to prep, align, and apply gel press-on nails at home." />
        <figcaption>From prep to final press, the process stays clean, fast, and mess-free.</figcaption>
      </figure>
      <ol>
        <li><strong>Fit first:</strong> Lay out the gel tips from thumb to pinky and make sure each one hugs the side walls without touching skin.</li>
        <li><strong>Shape &amp; buff:</strong> Lightly buff the natural nail surface in a single direction to remove shine. Avoid over-filing to keep nails strong.</li>
        <li><strong>Cleanse:</strong> Swipe every nail with alcohol. A squeaky-clean surface ensures the gel tab bonds instantly.</li>
        <li><strong>Apply gel tab:</strong> Peel a gel tab, place it slightly away from the cuticle, and press toward the free edge to smooth out bubbles.</li>
        <li><strong>Press &amp; tilt:</strong> Angle the gel nail at roughly 45 degrees, align the cuticle edge first, then roll it down to seal the sides.</li>
        <li><strong>Lock the bond:</strong> Hold firm pressure for 30 seconds, focusing on the center and the sides to remove pockets of air.</li>
      </ol>

      <h2>Aftercare for Long-Lasting Shine</h2>
      <p>A few mindful habits help your gel manicure last up to two weeks:</p>
      <ul>
        <li>Keep nails dry for the first hour so the gel tab fully cures.</li>
        <li>Wear gloves when cleaning or gardening to avoid lifted edges.</li>
        <li>Apply cuticle oil nightly to keep the surrounding skin supple.</li>
        <li>Store removed sets in their tray and wipe with alcohol before the next wear.</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <p><strong>Can I remove the nails without damaging my natural nails?</strong><br />Yes. Soak fingertips in warm water with a drop of nourishing oil for 5–7 minutes, then gently slide off the tip—no harsh acetone required.</p>
      <p><strong>How often can I reuse one set?</strong><br />With proper cleansing, gelmanicure tips can be worn up to five times. Replace gel tabs with fresh ones whenever you reapply.</p>
      <p><strong>Do I need a UV lamp?</strong><br />No. Our eco gel tabs cure with light finger pressure, making them ideal for travel or quick changes.</p>

      <h2>Ready to Create Your Own Gel Manicure?</h2>
      <p>Explore our <a href="/products">curated gel press-on collections</a> and choose a finish that matches your next mood. With the right prep and a little solo time, you can master a studio-worthy manicure that is kind to your nails and the planet.</p>
    `,
    coverImage: "/blog-gel-manicure-steps.svg",
    author: {
      name: "Sophia Chen",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    category: "tutorial",
    tags: ["home-manicure", "gel", "sustainable", "how-to"],
    published: true,
    publishedAt: "2025-02-18T10:00:00Z",
    createdAt: "2025-02-16T08:00:00Z",
    updatedAt: "2025-02-18T10:00:00Z",
    readTime: 9,
  },
]

export const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "user-1",
    orderNumber: "ORD-2025-001234",
    items: [],
    subtotal: 79.97,
    tax: 7.2,
    shipping: 0,
    total: 87.17,
    status: "delivered",
    shippingAddress: mockAddresses[0],
    billingAddress: mockAddresses[0],
    paymentMethod: "Credit Card ending in 4242",
    trackingNumber: "1Z999AA10123456784",
    createdAt: "2025-01-10T14:30:00Z",
    updatedAt: "2025-01-15T09:20:00Z",
  },
]

export const mockReviews: Review[] = [
  {
    id: "review-1",
    productId: "1",
    userId: "user-2",
    userName: "Sarah M.",
    rating: 5,
    title: "Absolutely Perfect!",
    comment:
      "These nails are stunning! They lasted for 1 week without any issues. The quality is amazing and they look so natural.",
    images: ["/customer-review-french-tip-1.jpg", "/customer-review-french-tip-2.jpg"],
    verified: true,
    createdAt: "2025-01-12T16:45:00Z",
  },
  {
    id: "review-2",
    productId: "1",
    userId: "user-3",
    userName: "Jessica L.",
    rating: 4,
    title: "Great quality",
    comment:
      "Love the French tip design. Very elegant and easy to apply. Took off one star because I wish they came in more size options.",
    images: ["/customer-review-french-tip-3.jpg"],
    verified: true,
    createdAt: "2025-01-08T11:20:00Z",
  },
  {
    id: "review-3",
    productId: "2",
    userId: "user-4",
    userName: "Amanda K.",
    rating: 5,
    title: "Obsessed with the chrome finish!",
    comment: "The rose gold chrome is even more beautiful in person. Gets so many compliments!",
    images: ["/customer-review-chrome-1.jpg", "/customer-review-chrome-2.jpg"],
    verified: true,
    createdAt: "2025-01-14T09:15:00Z",
  },
  {
    id: "review-4",
    productId: "3",
    userId: "user-5",
    userName: "Emily R.",
    rating: 5,
    title: "Perfect for special occasions",
    comment: "Wore these to a wedding and they were perfect! So sparkly and glamorous. Highly recommend!",
    images: ["/customer-review-glitter-1.jpg"],
    verified: true,
    createdAt: "2025-01-10T14:30:00Z",
  },
  {
    id: "review-5",
    productId: "4",
    userId: "user-6",
    userName: "Olivia T.",
    rating: 5,
    title: "Beautiful ombre effect",
    comment: "The gradient is so smooth and beautiful. These are my new favorite nails!",
    images: ["/customer-review-ombre-1.jpg", "/customer-review-ombre-2.jpg"],
    verified: true,
    createdAt: "2025-01-05T10:00:00Z",
  },
  {
    id: "review-6",
    productId: "5",
    userId: "user-7",
    userName: "Sophia W.",
    rating: 4,
    title: "Love the matte finish",
    comment: "The matte black is so chic and modern. Very easy to apply and they stay on well.",
    images: ["/customer-review-chrome-3.jpg"],
    verified: true,
    createdAt: "2025-01-03T08:45:00Z",
  },
  {
    id: "review-7",
    productId: "2",
    userId: "user-8",
    userName: "Isabella H.",
    rating: 5,
    title: "Best press-on nails ever!",
    comment: "I've tried many brands but these are by far the best. The chrome finish is flawless!",
    images: ["/customer-review-chrome-3.jpg"],
    verified: true,
    createdAt: "2025-01-01T12:00:00Z",
  },
  {
    id: "review-8",
    productId: "1",
    userId: "user-9",
    userName: "Mia C.",
    rating: 5,
    title: "Classic and elegant",
    comment: "Perfect for everyday wear. The French tips look so natural and professional.",
    images: ["/customer-review-french-tip-4.jpg"],
    verified: true,
    createdAt: "2024-12-28T16:20:00Z",
  },
]

export const mockBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "The Ultimate Guide to Applying Press-On Nails",
    slug: "ultimate-guide-applying-press-on-nails",
    excerpt: "Learn the professional techniques for flawless press-on nail application that lasts for weeks.",
    content: `
      <h2>Getting Started</h2>
      <p>Press-on nails have revolutionized the nail industry, offering salon-quality results at home. In this comprehensive guide, we'll walk you through every step of the application process.</p>
      
      <h2>What You'll Need</h2>
      <ul>
        <li>Press-on nail set</li>
        <li>Nail file</li>
        <li>Cuticle pusher</li>
        <li>Alcohol wipes</li>
        <li>Medical-grade gel application system</li>
      </ul>
      
      <h2>Step-by-Step Application</h2>
      <p>Follow these professional tips for the best results...</p>
    `,
    coverImage: "/blog-application-guide.jpg",
    author: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    category: "tutorial",
    tags: ["application", "beginner", "how-to"],
    published: true,
    publishedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-14T08:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    readTime: 8,
  },
  {
    id: "blog-2",
    title: "Top 10 Nail Trends for 2025",
    slug: "top-10-nail-trends-2025",
    excerpt: "Discover the hottest nail trends that are taking over social media and runways this year.",
    content: `
      <h2>Introduction</h2>
      <p>2025 is bringing exciting new trends to the nail world. From minimalist designs to bold statements, here are the top trends you need to know.</p>
      
      <h2>1. Chrome Finishes</h2>
      <p>Metallic and chrome nails continue to dominate...</p>
    `,
    coverImage: "/blog-trends-2025.jpg",
    author: {
      name: "Sophia Chen",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    category: "trends",
    tags: ["trends", "2025", "inspiration"],
    published: true,
    publishedAt: "2025-01-12T14:00:00Z",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-12T14:00:00Z",
    readTime: 6,
  },
  {
    id: "blog-3",
    title: "How to Make Your Press-On Nails Last Longer",
    slug: "make-press-on-nails-last-longer",
    excerpt: "Expert tips and tricks to extend the life of your press-on nails up to 3 weeks.",
    content: `
      <h2>Preparation is Key</h2>
      <p>The secret to long-lasting press-on nails starts before application...</p>
    `,
    coverImage: "/blog-nail-care.jpg",
    author: {
      name: "Isabella Martinez",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    category: "care",
    tags: ["care", "tips", "longevity"],
    published: true,
    publishedAt: "2025-01-10T11:00:00Z",
    createdAt: "2025-01-08T10:00:00Z",
    updatedAt: "2025-01-10T11:00:00Z",
    readTime: 5,
  },
  {
    id: "blog-4",
    title: "French Manicure: Classic Elegance Reimagined",
    slug: "french-manicure-classic-elegance",
    excerpt: "Explore modern twists on the timeless French manicure that never goes out of style.",
    content: `
      <h2>The Timeless Classic</h2>
      <p>French manicures have been a staple for decades, and for good reason...</p>
    `,
    coverImage: "/blog-french-manicure.jpg",
    author: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    category: "inspiration",
    tags: ["french", "classic", "elegant"],
    published: true,
    publishedAt: "2025-01-08T09:00:00Z",
    createdAt: "2025-01-06T08:00:00Z",
    updatedAt: "2025-01-08T09:00:00Z",
    readTime: 7,
  },
  {
    id: "blog-5",
    title: "5 Quick Nail Art Ideas for Beginners",
    slug: "quick-nail-art-ideas-beginners",
    excerpt: "Simple yet stunning nail art designs you can create at home with minimal tools.",
    content: `
      <h2>Getting Creative</h2>
      <p>You don't need to be a professional to create beautiful nail art...</p>
    `,
    coverImage: "/blog-nail-art.jpg",
    author: {
      name: "Sophia Chen",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    category: "tutorial",
    tags: ["nail-art", "beginner", "diy"],
    published: true,
    publishedAt: "2025-01-05T13:00:00Z",
    createdAt: "2025-01-03T10:00:00Z",
    updatedAt: "2025-01-05T13:00:00Z",
    readTime: 6,
  },
  {
    id: "blog-6",
    title: "The Best Nail Shapes for Your Hand Type",
    slug: "best-nail-shapes-hand-type",
    excerpt: "Find out which nail shape flatters your hands and complements your personal style.",
    content: `
      <h2>Understanding Nail Shapes</h2>
      <p>Choosing the right nail shape can make a huge difference...</p>
    `,
    coverImage: "/blog-nail-shapes.jpg",
    author: {
      name: "Isabella Martinez",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    category: "tips",
    tags: ["shapes", "guide", "style"],
    published: true,
    publishedAt: "2025-01-03T10:00:00Z",
    createdAt: "2025-01-01T09:00:00Z",
    updatedAt: "2025-01-03T10:00:00Z",
    readTime: 5,
  },
]
