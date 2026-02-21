export function removeSlotFromArray(
  slotArray: string[],
  slotId: string
): string[] {
  return slotArray.filter((slot) => slot !== slotId);
}
