import "dotenv/config"

import { deleteAllOrders } from "@/lib/db/queries"

async function main() {
  try {
    await deleteAllOrders()
    console.log("All orders have been deleted.")
    process.exit(0)
  } catch (error) {
    console.error("Failed to delete orders:", error)
    process.exit(1)
  }
}

void main()
