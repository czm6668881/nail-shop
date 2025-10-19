import fs from "fs"
import os from "os"
import path from "path"
import Database from "better-sqlite3"

const projectRoot = process.cwd()
const defaultDbDirectory = path.join(projectRoot, "lib", "db")
const defaultDbPath = path.join(defaultDbDirectory, "nailshop.db")

const ensureDirectory = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true })
  }
}

const canWrite = (filePath: string) => {
  try {
    fs.accessSync(filePath, fs.constants.W_OK)
    return true
  } catch {
    return false
  }
}

const copyDatabaseToWritableLocation = (sourcePath: string) => {
  const tempDir = path.join(os.tmpdir(), "nail-shop")
  ensureDirectory(tempDir)

  const tempDbPath = path.join(tempDir, "nailshop.db")
  if (!fs.existsSync(tempDbPath)) {
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, tempDbPath)
    } else {
      fs.writeFileSync(tempDbPath, "")
    }
  }

  return tempDbPath
}

ensureDirectory(defaultDbDirectory)

const databasePath = (() => {
  const fileExists = fs.existsSync(defaultDbPath)

  if (fileExists && canWrite(defaultDbPath)) {
    return defaultDbPath
  }

  if (!fileExists) {
    try {
      fs.writeFileSync(defaultDbPath, "")
      return defaultDbPath
    } catch {
      // Fall through to the writable temp location if the default path is read-only.
    }
  }

  return copyDatabaseToWritableLocation(defaultDbPath)
})()

export const db = new Database(databasePath)

db.pragma("journal_mode = WAL")
