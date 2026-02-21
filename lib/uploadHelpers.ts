export function validateWhatsApp(number: string): boolean {
  const cleaned = number.trim();
  return /^[0-9]{10}$/.test(cleaned);
}

export function validateEmail(email: string): boolean {
  const cleaned = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
}
