export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  try {
    // Normalize microseconds (6+ digits) down to milliseconds (3 digits)
    const normalizedIso = iso.replace(/\.(\d{3})\d+/, '.$1')
    const d = new Date(normalizedIso)
    if (Number.isNaN(d.getTime())) return iso
    // Use the user's locale and show date + time in a compact readable format
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch (e) {
    return iso
  }
}

export default formatDate
