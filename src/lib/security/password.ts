const COMMON_PASSWORDS = new Set([
  '123456','123456789','12345678','password','qwerty','1234567','123123','111111','abc123','1234567890','000000','iloveyou'
])

export function isStrongPassword(pwd: string): boolean {
  // 至少10位，包含大小写/数字/特殊字符，并拒绝常见弱口令
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/
  return re.test(pwd) && !COMMON_PASSWORDS.has(pwd)
}

export function passwordIssue(pwd: string): string | null {
  if (COMMON_PASSWORDS.has(pwd)) return '密码过于常见'
  if (pwd.length < 10) return '密码至少需要10个字符'
  if (!/[a-z]/.test(pwd)) return '需包含小写字母'
  if (!/[A-Z]/.test(pwd)) return '需包含大写字母'
  if (!/\d/.test(pwd)) return '需包含数字'
  if (!/[^A-Za-z0-9]/.test(pwd)) return '需包含特殊字符'
  return null
}

