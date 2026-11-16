// Ne pas masquer un contrôle en échec derrière une réussite plus ancienne.
export function choisirEtatPublication(api, controle) {
  if (!api?.etat || api.etat === 'unknown') return controle || api
  if (!controle?.etat || controle.etat === 'unknown') return api
  const a = Date.parse(api.date), b = Date.parse(controle.date)
  if (Number.isFinite(a) && Number.isFinite(b) && a !== b) return a > b ? api : controle
  const failure = x => ['failure', 'error', 'timed_out', 'action_required'].includes(x?.etat)
  if (failure(controle)) return controle
  if (failure(api)) return api
  return api
}
