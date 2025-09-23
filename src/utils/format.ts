export function formatAuthor(user: { id?: string; name?: string } | undefined) {
  if (!user) {
    return "unknown";
  }

  const displayName = user.name?.trim();
  const id = user.id?.trim();

  if (displayName && id) {
    if (displayName === id) {
      return displayName;
    }
    return `${displayName} (@${id})`;
  }

  if (displayName) {
    return displayName;
  }

  if (id) {
    return `@${id}`;
  }

  return "unknown";
}
