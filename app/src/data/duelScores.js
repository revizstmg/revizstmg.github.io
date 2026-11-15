// Les anciennes entrées globales ne portent aucune identité fiable : ne jamais
// les attribuer au compte courant. Elles restent intactes sur l'appareil.
const key = owner => `stmg_duel_scores_attente:${owner}`
const valid = score => score && Number.isFinite(score.points) && score.points >= 0 && Number.isInteger(score.correct) && score.correct >= 0
export function scoresEnAttente(owner) {
  if (!owner) return {}
  try {
    const data = JSON.parse(localStorage.getItem(key(owner)) || '{}')
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    return Object.fromEntries(Object.entries(data).filter(([,score]) => valid(score)))
  } catch { return {} }
}
export function garderScore(owner, id, score) {
  if (!owner || !id || (score && !valid(score))) return false
  const scores = scoresEnAttente(owner)
  if (score) scores[id] = score; else delete scores[id]
  try { localStorage.setItem(key(owner), JSON.stringify(scores)); return true } catch { return false }
}
