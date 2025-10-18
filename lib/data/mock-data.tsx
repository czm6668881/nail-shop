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
]

export const mockOrders: Order[] = [
  {
    id: "order-1",
    userId: "user-1",
    orderNumber: "ORD-2025-001234",
    items: [],
    subtotal: 79.97,
    tax: 7.2,
    shipping: 5.99,
    total: 93.16,
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
      "These nails are stunning! They lasted for 2 weeks without any issues. The quality is amazing and they look so natural.",
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
        <li>Nail glue or adhesive tabs</li>
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
