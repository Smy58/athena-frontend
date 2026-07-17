export function guildRankInfo(completed) {
  if (completed >= 7) return { n: 3, name: 'Мастер гильдии' }
  if (completed >= 3) return { n: 2, name: 'Доверенный агент' }
  return { n: 1, name: 'Новичок' }
}
