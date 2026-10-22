// Les anciennes sauvegardes peuvent contenir des nombres sous forme de texte.
export function studySeconds(value) {
  const seconds = Number(value)
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0
}

// Une longue suspension du navigateur ne doit pas devenir du temps de travail.
export function activeSeconds(previous, now, visible) {
  return visible ? Math.max(0, Math.min(10, (now - previous) / 1000)) : 0
}
