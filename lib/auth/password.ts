export const validatePasswordStrength = (password: string) => {
  const issues: string[] = []

  if (password.length < 8) {
    issues.push("Password must be at least 8 characters long.")
  }
  if (!/[A-Z]/.test(password)) {
    issues.push("Password must include at least one uppercase letter.")
  }
  if (!/[a-z]/.test(password)) {
    issues.push("Password must include at least one lowercase letter.")
  }
  if (!/[0-9]/.test(password)) {
    issues.push("Password must include at least one number.")
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    issues.push("Password must include at least one symbol.")
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}
