// Les anciennes sauvegardes peuvent contenir des nombres sous forme de texte.
// Aucun temps ne peut dépasser toute la durée d’existence du site.
// Premier commit public : cb91b38, 6 juillet 2026 à 00:16:26 UTC.
export const STUDY_STARTED_AT = Date.UTC(2026, 6, 6, 0, 16, 26)
export function studySeconds(value, now = Date.now()) {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 && seconds <= Math.max(0, (now - STUDY_STARTED_AT) / 1000) ? seconds : 0
}

// Une longue suspension du navigateur ne doit pas devenir du temps de travail.
export function activeSeconds(previous, now, visible) {
  return visible ? Math.max(0, Math.min(10, (now - previous) / 1000)) : 0
}

// Garde la valeur d’origine à part : sa durée réelle est irrécupérable.
// Réappliqué à chaque fusion pour empêcher une ancienne copie de la réintroduire.
export function repairStudyTime(state) {
  if (!state?.themeTime || typeof state.themeTime !== 'object') return state
  const times = { ...state.themeTime }
  const archived = { ...state.themeTimeInvalid }
  let changed = false
  for (const [id, raw] of Object.entries(times)) {
    const valid = studySeconds(raw)
    if (valid !== raw) {
      changed = true
      times[id] = valid
      if (!valid && raw !== 0 && raw !== '0' && raw != null && !(id in archived)) {
        archived[id] = typeof raw === 'number' && !Number.isFinite(raw) ? String(raw) : raw
      }
    }
  }
  return changed ? { ...state, themeTime: times, themeTimeInvalid: archived } : state
}
