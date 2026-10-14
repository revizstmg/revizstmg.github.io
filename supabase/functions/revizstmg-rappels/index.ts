// RévizSTMG : rappels de révision par notification « push » (Web Push, VAPID).
//
// GET  ?cle=1  → la clé publique VAPID (créée au premier appel, gardée en base).
//                Le site s'en sert pour abonner le navigateur.
// POST         → envoie les rappels dus. Réservé à pg_cron : en-tête
//                x-revizstmg-secret, comparé au secret gardé en base.
//
// Le rappel ne transporte aucune donnée (pas de chiffrement de contenu) : le
// service worker du site affiche un texte fixe. Les clés VAPID sont créées ici
// et ne quittent jamais la base (schéma revizstmg_prive, lu par la clé de
// service via des fonctions réservées). Voir supabase/README.md.

const URL_BASE = Deno.env.get('SUPABASE_URL')!
const CLE_SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CONTACT = 'mailto:revizstmg@gmail.com'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-revizstmg-secret',
}

async function rpc(nom: string, args: Record<string, unknown> = {}) {
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${nom}`, {
    method: 'POST',
    headers: { apikey: CLE_SERVICE, Authorization: `Bearer ${CLE_SERVICE}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error(`${nom} : ${r.status} ${await r.text()}`)
  const t = await r.text()
  return t ? JSON.parse(t) : null
}

const b64url = (octets: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(octets))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

type Cles = { publique: string; privee: string }

// Paire de clés VAPID (ECDSA P-256) : lue en base, créée au premier besoin.
async function cles(): Promise<Cles> {
  const lire = async () => ((await rpc('revizstmg_push_cles')) || [])[0] as Cles | undefined
  let k = await lire()
  if (!k?.publique || !k?.privee) {
    const paire = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify'])
    const publique = b64url(await crypto.subtle.exportKey('raw', paire.publicKey))
    const privee = JSON.stringify(await crypto.subtle.exportKey('jwk', paire.privateKey))
    await rpc('revizstmg_push_enregistrer_cles', { p_publique: publique, p_privee: privee })
    k = await lire() // si deux appels se croisent, la première paire enregistrée gagne
  }
  return k!
}

// Jeton VAPID (JWT ES256) pour le service de notification de l'abonné.
async function jetonVapid(audience: string, privee: string) {
  const jwk = JSON.parse(privee)
  const cle = await crypto.subtle.importKey('jwk', { ...jwk, key_ops: ['sign'] }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const enc = (o: unknown) => b64url(new TextEncoder().encode(JSON.stringify(o)))
  const donnees = `${enc({ typ: 'JWT', alg: 'ES256' })}.${enc({ aud: audience, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: CONTACT })}`
  const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, cle, new TextEncoder().encode(donnees))
  return `${donnees}.${b64url(signature)}`
}

// Envoie un rappel sans contenu. Renvoie le statut HTTP du service de notification.
async function envoyer(endpoint: string, k: Cles) {
  const jeton = await jetonVapid(new URL(endpoint).origin, k.privee)
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { TTL: '14400', Urgency: 'normal', Authorization: `vapid t=${jeton}, k=${k.publique}`, 'Content-Length': '0' },
    })
    await r.body?.cancel()
    return r.status
  } catch {
    return 0
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })
  try {
    if (req.method === 'GET') {
      const k = await cles()
      return Response.json({ publique: k.publique }, { headers: CORS })
    }
    if (req.method === 'POST') {
      const secret = req.headers.get('x-revizstmg-secret') || ''
      if (!secret || !(await rpc('revizstmg_push_secret_ok', { p_secret: secret }))) {
        return new Response('Accès refusé', { status: 403, headers: CORS })
      }
      const k = await cles()
      const dus: { endpoint: string }[] = (await rpc('revizstmg_push_a_envoyer')) || []
      let ok = 0
      for (const a of dus) {
        const statut = await envoyer(a.endpoint, k)
        if (statut >= 200 && statut < 300) ok++
        await rpc('revizstmg_push_resultat', { p_endpoint: a.endpoint, p_statut: statut })
      }
      return Response.json({ dus: dus.length, envoyes: ok }, { headers: CORS })
    }
    return new Response('Méthode non prise en charge', { status: 405, headers: CORS })
  } catch (e) {
    console.error(e)
    return new Response('Erreur', { status: 500, headers: CORS })
  }
})
