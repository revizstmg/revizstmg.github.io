// Répétition espacée (SM-2 simplifié) + utilitaires de dates.
// Aucune dépendance : importable partout sans risque d'import circulaire.
// Les dates sont des dates civiles « AAAA-MM-JJ » : le jour du calendrier de
// l'appareil (heure de Paris pour la plupart des élèves), et non le jour UTC,
// qui changeait à 1 h ou 2 h du matin. Les calculs portent sur la date seule :
// ni le fuseau ni le passage à l'heure d'été ou d'hiver ne décalent un jour.
const deux = (n) => String(n).padStart(2, '0')
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`
export const todayKey = () => dayKey()
const jourUTC = (key) => { const [a, m, j] = String(key).split('-').map(Number); return Date.UTC(a, m - 1, j) }
export const addDays = (key, n) => new Date(jourUTC(key) + n * 86400000).toISOString().slice(0, 10)
// Nombre de jours de `from` à `to` (négatif si `to` est passé).
export const daysBetween = (from, to) => Math.round((jourUTC(to) - jourUTC(from)) / 86400000)

export function daysUntil(dateStr, today = todayKey()) {
  if (!dateStr) return null
  return daysBetween(today, dateStr)
}

// Prochaine échéance d'un thème selon le score obtenu (0-100).
export function srsUpdate(prev, pct, today = todayKey()) {
  const p = prev || { interval: 0, ease: 2.3, reps: 0 }
  let ease = p.ease || 2.3
  let reps
  if (pct >= 85) { ease = Math.min(2.9, ease + 0.1); reps = (p.reps || 0) + 1 }
  else if (pct >= 60) { reps = (p.reps || 0) + 1 }
  else { ease = Math.max(1.3, ease - 0.2); reps = 0 } // échec : on réapprend

  let interval
  if (reps === 0) interval = 1
  else if (reps === 1) interval = 2
  else if (reps === 2) interval = 4
  else interval = Math.min(60, Math.round((p.interval || 4) * ease))

  return { interval, ease: Math.round(ease * 100) / 100, reps, last: today, due: addDays(today, interval), score: Math.round(pct) }
}

export function defaultBacDate(today = new Date()) {
  const y = today.getMonth() >= 6 ? today.getFullYear() + 1 : today.getFullYear()
  return `${y}-06-16` // épreuves écrites de spécialité, mi-juin (indicatif)
}
