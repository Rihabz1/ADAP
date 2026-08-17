export const examplePhoneNumbers = [
  "+8801852381087",
  "+8801371764059",
  "+8801728917865",
] as const;

export function sanitizePhoneInput(value: string) {
  const international = value.trimStart().startsWith("+");
  const digits = value.replace(/\D/g, "").slice(0, international ? 13 : 11);
  return international ? `+${digits}` : digits;
}
