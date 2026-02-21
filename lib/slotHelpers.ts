export function calculateRequiredContacts(
  duration: number,
  interval: number
): number {
  if (interval <= 0) return 0;
  return Math.floor(duration / interval);
}

export function appendSlot(
  existingSlots: string[],
  slotId: string
): string[] {
  if (!existingSlots) return [slotId];
  if (existingSlots.includes(slotId)) return existingSlots;
  return [...existingSlots, slotId];
}

export function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}
