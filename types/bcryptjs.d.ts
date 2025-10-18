declare module "bcryptjs" {
  export function compareSync(data: string, encrypted: string): boolean
  export function hashSync(data: string, salt?: string | number): string
  export function genSaltSync(rounds?: number, seedLength?: number): string

  export function compare(data: string, encrypted: string): Promise<boolean>
  export function hash(data: string, salt: string | number): Promise<string>
  export function genSalt(rounds?: number, seedLength?: number): Promise<string>

  export interface BcryptModule {
    compareSync: typeof compareSync
    hashSync: typeof hashSync
    genSaltSync: typeof genSaltSync
    compare: typeof compare
    hash: typeof hash
    genSalt: typeof genSalt
  }

  const bcrypt: BcryptModule
  export default bcrypt
}
