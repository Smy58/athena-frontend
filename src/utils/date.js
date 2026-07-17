const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]
const WEEKDAYS = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ']

// Dates come back from the API as UTC-midnight ISO strings (Prisma @db.Date).
// Extracting via the UTC getters (not getDate/getMonth/getDay) keeps the
// calendar date stable regardless of the viewer's local timezone.

export function toDateInputValue(iso) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export function formatDate(iso, { withYear = false } = {}) {
  if (!iso) return ''
  const d = new Date(iso)
  const day = d.getUTCDate()
  const month = MONTHS_GENITIVE[d.getUTCMonth()]
  return withYear ? `${day} ${month} ${d.getUTCFullYear()}` : `${day} ${month}`
}

export function formatWeekday(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return WEEKDAYS[d.getUTCDay()]
}
