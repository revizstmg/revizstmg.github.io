// Abonnements Premium et Ultimate : appels à la fonction « revizstmg-paiement »
// (Stripe Checkout). Les prix viennent du même fichier que le serveur.
import { OFFRES, PERIODES, estActif } from '../../../supabase/functions/revizstmg-paiement/logique.js'
import { SUPA_URL, SUPA_ANON } from '../supabase.js'
import { withNetworkTimeout } from '../networkTimeout.js'
import { getSession, getValidToken } from '../auth.js'

export { OFFRES, PERIODES, estActif }

async function appeler(corps) {
  const owner = getSession()?.user?.id
  const token = await getValidToken()
  const current = () => owner && getSession()?.user?.id === owner
  if (!token || !current()) throw new Error('login_required')
  try {
    return await withNetworkTimeout(async signal => {
      const r = await fetch(`${SUPA_URL}/functions/v1/revizstmg-paiement`, {
        signal, method: 'POST',
        headers: { apikey: SUPA_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(corps),
      })
      const data = await r.json().catch(() => ({}))
      if (!current()) throw new Error('login_required')
      if (!r.ok) throw new Error(data.error || (r.status === 404 ? 'not_configured' : 'server_error'))
      return data
    })
  } catch (error) {
    if (!current()) throw new Error('login_required')
    if (['login_required','not_configured','server_error','majeur_requis','deja_abonne'].includes(error.message)) throw error
    throw new Error('network')
  }
}

export const lireEtatPaiement = () => appeler({ action: 'etat' })
export const demarrerPaiement = (offre, periode, majeur) => appeler({ action: 'checkout', offre, periode, majeur })
export const ouvrirPortail = () => appeler({ action: 'portail' })

export const prixAffiche = (centimes, lang = 'fr') =>
  new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(centimes / 100)
