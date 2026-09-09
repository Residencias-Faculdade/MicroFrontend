export function cn(...inputs: Array<string | boolean | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}
