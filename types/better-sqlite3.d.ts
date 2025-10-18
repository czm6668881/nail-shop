declare module "better-sqlite3" {
  interface DatabaseOptions {
    verbose?: (...params: unknown[]) => void
  }

  interface Statement<T = unknown> {
    run(...params: unknown[]): Database
    get(...params: unknown[]): T
    all(...params: unknown[]): T[]
  }

  class Database {
    constructor(filename: string, options?: DatabaseOptions)
    prepare<T = unknown>(sql: string): Statement<T>
    pragma(source: string, options?: { simple?: boolean }): unknown
    transaction<T extends (...params: unknown[]) => unknown>(fn: T): T
    close(): void
  }

  export default Database
}
