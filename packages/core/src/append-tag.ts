export function appendTag(
  meta: Record<string, unknown> | undefined,
  tag: string,
): { tags: string[] } {
  const existing = (meta?.tags as string[] | undefined) ?? [];
  return { tags: [...existing, tag] };
}
