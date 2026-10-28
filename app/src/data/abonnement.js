// Abonnements Premium et Ultimate : appels à la fonction « revizstmg-paiement »
// (Stripe Checkout). Les prix viennent du même fichier que le serveur.
import { OFFRES, PERIODES, estActif } from '../../../supabase/functions/revizstmg-paiement/logique.js'
import { SUPA_URL, SUPA_ANON } from '../supabase.js'
import { getValidToken } from '../auth.js'

export { OFFRES, PERIODES, estActif }

async function appeler(corps) {
  const token = await getValidToken()
  if (!token) throw new Error('login_required')
  let r
  try {
    r = await fetch(`${SUPA_URL}/functions/v1/revizstmg-paiement`, {
      method: 'POST',
      headers: { apikey: SUPA_ANON, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(corps),
    })
  } catch { throw new Error('network') }
  const data = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(data.error || (r.status === 404 ? 'not_configured' : 'server_error'))
  return data
}

export const lireEtatPaiement = () => appeler({ action: 'etat' })
export const demarrerPaiement = (offre, periode, majeur) => appeler({ action: 'checkout', offre, periode, majeur })
export const ouvrirPortail = () => appeler({ action: 'portail' })

export const prixAffiche = (centimes, lang = 'fr') =>
  new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR' }).format(centimes / 100)
