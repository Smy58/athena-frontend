export function gameSeats(game) {
  const free = game.totalSeats - game.bookedSeats
  if (free <= 0) return { label: 'Мест нет', color: '#f09595' }
  if (free === 1) return { label: 'Осталось 1 место', color: '#fac775' }
  return { label: `Свободно ${free} из ${game.totalSeats}`, color: '#5dcaa5' }
}

export function levelLabel(game) {
  if (game.levelMin == null) return 'Без уровня'
  if (game.levelMin === game.levelMax) return `${game.levelMin} уровень`
  return `${game.levelMin}–${game.levelMax} уровень`
}
