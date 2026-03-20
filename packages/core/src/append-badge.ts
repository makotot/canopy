export function appendBadge(
  meta: Record<string, unknown> | undefined,
  badge: string,
): { badge: string[] } {
  const existing = (meta?.badge as string[] | undefined) ?? [];
  return { badge: [...existing, badge] };
}
