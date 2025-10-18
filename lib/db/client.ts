import path from "path"
import fs from "fs"
import Database from "better-sqlite3"

const dbDirectory = path.join(process.cwd(), "lib", "db")
const dbPath = path.join(dbDirectory, "nailshop.db")

if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true })
}

export const db = new Database(dbPath)

db.pragma("journal_mode = WAL")
