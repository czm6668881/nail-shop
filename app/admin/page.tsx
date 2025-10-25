import Link from "next/link"
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown, Star, FileText, Tags } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSessionUser } from "@/lib/auth/session"
import { getDashboardSnapshot } from "@/lib/api/admin/dashboard"

export default async function AdminDashboard() {
  const user = await getSessionUser()
  const snapshot = await getDashboardSnapshot()
  const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
  const numberFormatter = new Intl.NumberFormat("en-US")

  const stats = [
    {
      title: "Total Revenue",
      value: currencyFormatter.format(snapshot.stats.revenue.total),
      change: snapshot.stats.revenue.change,
      trend: snapshot.stats.revenue.trend,
      icon: DollarSign,
    },
    {
      title: "Total Orders",
      value: numberFormatter.format(snapshot.stats.orders.total),
      change: snapshot.stats.orders.change,
      trend: snapshot.stats.orders.trend,
      icon: ShoppingCart,
    },
    {
      title: "Total Products",
      value: numberFormatter.format(snapshot.stats.products.total),
      change: snapshot.stats.products.change,
      trend: snapshot.stats.products.trend,
      icon: Package,
    },
    {
      title: "Total Customers",
      value: numberFormatter.format(snapshot.stats.customers.total),
      change: snapshot.stats.customers.change,
      trend: snapshot.stats.customers.trend,
      icon: Users,
    },
  ]

  const quickLinks = [
    { title: "Products", description: "Manage your product catalog", href: "/admin/products", icon: Package },
    { title: "Orders", description: "View and manage orders", href: "/admin/orders", icon: ShoppingCart },
    { title: "Customers", description: "Manage customer accounts", href: "/admin/customers", icon: Users },
    { title: "Reviews", description: "Manage customer reviews", href: "/admin/reviews", icon: Star },
    { title: "Blog", description: "Manage blog posts and content", href: "/admin/blog", icon: FileText },
    { title: "Categories", description: "Organize product categories", href: "/admin/categories", icon: Tags },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back{user ? `, ${user.firstName}` : ""}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="flex items-center text-sm">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={stat.trend === "up" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <link.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {snapshot.recentOrders.length > 0 ? (
                snapshot.recentOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order #{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • {order.itemCount} {order.itemCount === 1 ? "item" : "items"} • {order.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{currencyFormatter.format(order.total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm text-muted-foreground text-center">No orders recorded yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
