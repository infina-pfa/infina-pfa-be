export function extractNameFromEmail(email: string): string {
  return email.split('@')[0];
}
