import { listOrders, listProducts, listUsers } from "@/lib/db/queries"
import type { Order } from "@/types"

type TrendDirection = "up" | "down"

type MetricSummary = {
  total: number
  change: string
  trend: TrendDirection
}

export type DashboardOrderSummary = {
  id: string
  orderNumber: string
  customerName: string
  itemCount: number
  total: number
  createdAt: string
  status: Order["status"]
}

export type DashboardSnapshot = {
  stats: {
    revenue: MetricSummary
    orders: MetricSummary
    products: MetricSummary
    customers: MetricSummary
  }
  recentOrders: DashboardOrderSummary[]
}

const DAYS_PER_PERIOD = 30

const toTimestamp = (value: string | number | Date | undefined | null): number | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  const timestamp = date.getTime()
  return Number.isFinite(timestamp) ? timestamp : null
}

const isWithin = (timestamp: number | null, start: number, end: number): boolean => {
  if (timestamp === null) return false
  return timestamp >= start && timestamp < end
}

const sumOrderTotals = (orders: Order[]): number =>
  orders.reduce((sum, order) => sum + (typeof order.total === "number" ? order.total : 0), 0)

const formatChange = (current: number, previous: number): { change: string; trend: TrendDirection } => {
  if (previous === 0) {
    if (current === 0) {
      return { change: "0%", trend: "up" }
    }
    return { change: "NEW", trend: "up" }
  }

  const diffPercentage = ((current - previous) / Math.abs(previous)) * 100
  const trend: TrendDirection = diffPercentage >= 0 ? "up" : "down"
  const formatted = diffPercentage === 0 ? "0%" : `${diffPercentage >= 0 ? "+" : "-"}${Math.abs(diffPercentage).toFixed(1)}%`

  return { change: formatted, trend }
}

const normalizeQuantity = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [orders, products, users] = await Promise.all([listOrders(), listProducts(), listUsers()])

  const now = Date.now()
  const currentPeriodStart = new Date(now)
  currentPeriodStart.setDate(currentPeriodStart.getDate() - DAYS_PER_PERIOD)
  const previousPeriodStart = new Date(currentPeriodStart)
  previousPeriodStart.setDate(previousPeriodStart.getDate() - DAYS_PER_PERIOD)

  const currentStartTs = currentPeriodStart.getTime()
  const previousStartTs = previousPeriodStart.getTime()

  const ordersWithTimestamps = orders.map((order) => ({
    order,
    createdTs: toTimestamp(order.createdAt) ?? toTimestamp(order.updatedAt) ?? now,
  }))

  const productsWithTimestamps = products.map((product) => ({
    product,
    createdTs: toTimestamp(product.createdAt),
  }))

  const customers = users.filter((user) => user.role === "customer")
  const customersWithTimestamps = customers.map((customer) => ({
    customer,
    createdTs: toTimestamp(customer.createdAt),
  }))

  const ordersInCurrentPeriod = ordersWithTimestamps
    .filter(({ createdTs }) => isWithin(createdTs, currentStartTs, now))
    .map(({ order }) => order)
  const ordersInPreviousPeriod = ordersWithTimestamps
    .filter(({ createdTs }) => isWithin(createdTs, previousStartTs, currentStartTs))
    .map(({ order }) => order)

  const productsInCurrentPeriod = productsWithTimestamps
    .filter(({ createdTs }) => isWithin(createdTs, currentStartTs, now))
    .map(({ product }) => product)
  const productsInPreviousPeriod = productsWithTimestamps
    .filter(({ createdTs }) => isWithin(createdTs, previousStartTs, currentStartTs))
    .map(({ product }) => product)

  const customersInCurrentPeriod = customersWithTimestamps
    .filter(({ createdTs }) => isWithin(createdTs, currentStartTs, now))
    .map(({ customer }) => customer)
  const customersInPreviousPeriod = customersWithTimestamps
    .filter(({ createdTs }) => isWithin(createdTs, previousStartTs, currentStartTs))
    .map(({ customer }) => customer)

  const revenueSummary: MetricSummary = {
    total: sumOrderTotals(orders),
    ...formatChange(sumOrderTotals(ordersInCurrentPeriod), sumOrderTotals(ordersInPreviousPeriod)),
  }

  const ordersSummary: MetricSummary = {
    total: orders.length,
    ...formatChange(ordersInCurrentPeriod.length, ordersInPreviousPeriod.length),
  }

  const productsSummary: MetricSummary = {
    total: products.length,
    ...formatChange(productsInCurrentPeriod.length, productsInPreviousPeriod.length),
  }

  const customersSummary: MetricSummary = {
    total: customers.length,
    ...formatChange(customersInCurrentPeriod.length, customersInPreviousPeriod.length),
  }

  const recentOrders = ordersWithTimestamps
    .sort((a, b) => b.createdTs - a.createdTs)
    .slice(0, 5)
    .map(({ order }) => {
      const shippingName =
        order.shippingAddress && typeof order.shippingAddress === "object"
          ? `${order.shippingAddress.firstName ?? ""} ${order.shippingAddress.lastName ?? ""}`.trim()
          : ""

      const itemCount = Array.isArray(order.items)
        ? order.items.reduce((sum, item) => sum + normalizeQuantity((item as { quantity?: unknown }).quantity), 0)
        : 0

      const createdAt = order.createdAt ?? order.updatedAt ?? new Date().toISOString()

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: shippingName.length > 0 ? shippingName : "Guest",
        itemCount,
        total: typeof order.total === "number" ? order.total : 0,
        createdAt,
        status: order.status,
      }
    })

  return {
    stats: {
      revenue: revenueSummary,
      orders: ordersSummary,
      products: productsSummary,
      customers: customersSummary,
    },
    recentOrders,
  }
}
