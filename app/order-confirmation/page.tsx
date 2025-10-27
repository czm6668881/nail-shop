import Link from "next/link"
import { CheckCircle, Package, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrderConfirmationPageProps {
  searchParams: Promise<{
    orderNumber?: string
  }>
}

export default async function OrderConfirmationPage({ searchParams }: OrderConfirmationPageProps) {
  const resolvedSearchParams = await searchParams
  const orderNumber = resolvedSearchParams.orderNumber ?? "Order pending"

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground">Thank you for your purchase</p>
        </div>

        {/* Order Number */}
        <div className="bg-muted/30 rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Order Number</p>
          <p className="text-2xl font-bold">{orderNumber}</p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Confirmation Email Sent</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a confirmation email with your order details and tracking information.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Package className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Estimated Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  Your order will be delivered within 5-7 business days. Track your package in your account.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/account/orders">View Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
