/** Helpers for generating unique, valid-looking test data. */

function stamp(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
}

export function uniqueEmail(prefix = 'qa.auto'): string {
  return `${prefix}.${stamp()}@example.com`;
}

export function uniqueEmployeeId(prefix = 'EMP'): string {
  return `${prefix}-${stamp().toUpperCase()}`;
}

export function uniqueName(prefix = 'QA Auto'): string {
  return `${prefix} ${stamp().toUpperCase()}`;
}

export function uniqueRoleName(prefix = 'QA Auto Role'): string {
  return `${prefix} ${stamp().toUpperCase()}`;
}

/** Common invalid inputs used by negative validation tests. */
export const INVALID_EMAILS = ['plainaddress', 'missing-at.com', 'bad@', '@no-local.com', 'spa ce@x.com'];

/** A representative XSS / injection payload for input-sanitisation checks. */
export const XSS_PAYLOAD = '<script>alert(1)</script>';
export const SQLI_PAYLOAD = "' OR '1'='1";
