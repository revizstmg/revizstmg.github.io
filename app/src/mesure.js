// Mesure d'audience sans cookie : chaque écran affiché ajoute 1 à un compteur du
// jour (« accueil », « chapitre »…), dans Supabase (UE). Rien d'autre ne part :
// ni identifiant, ni adresse, ni appareil, ni contenu. Seul repère gardé : un
// drapeau de session (sessionStorage) pour compter une visite une seule fois.
// Ce type de mesure, anonyme et limitée aux statistiques du site, n'a pas besoin
// de consentement (CNIL). Elle est sautée si le navigateur demande « ne pas me
// suivre » (Do Not Track, Global Privacy Control).
//
// La table et la fonction côté base sont dans supabase/a-valider/ : tant
// qu'elles ne sont pas installées, MESURE_ACTIVE reste à false et rien ne part.
import { SUPA_URL, SUPA_ANON } from './supabase.js'

export const MESURE_ACTIVE = false

// Noms d'écran comptés. La fonction SQL n'accepte que ceux-là
// (vérifié par tests/liens.test.js).
export const ECRANS = [
  'entree', 'accueil', 'matiere', 'theme', 'chapitre', 'favoris', 'badges', 'classe', 'moi', 'coach',
  'revision', 'paquet', 'parent', 'bac-blanc', 'programme', 'grand-oral', 'coach-ia', 'fiches-photo',
  'defi', 'express', 'formules', 'methodo', 'boutique', 'confidentialite', 'cgu', 'faq', 'guide',
  'classement', 'amis', 'introuvable',
]

// Adresse de l'app → nom d'écran (sans les identifiants de matière, thème, paquet).
export function nomEcran(chemin) {
  const p = (chemin || '/').split('/').filter(Boolean)
  if (!p.length || p[0] === 'changer') return 'entree'
  if (p[0] === 'subject') {
    if (p.length === 2) return 'matiere'
    if (p[2] === 'theme' && p.length === 4) return 'theme'
    if (p[2] === 'theme' && p[4] === 'chapter' && p.length === 6) return 'chapitre'
    return p[2] === 'chapter' && p.length === 4 ? null : 'introuvable' // ancienne adresse redirigée
  }
  if (p[0] === 'revision' && p[1] === 'deck' && p.length === 3) return 'paquet'
  return p.length === 1 && ECRANS.includes(p[0]) ? p[0] : 'introuvable'
}

const neRienSuivre = () => {
  try { return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1' } catch { return false }
}

export function compterEcran(chemin) {
  if (!MESURE_ACTIVE || import.meta.env.DEV || neRienSuivre()) return
  const page = nomEcran(chemin)
  if (!page) return
  let visite = false
  try {
    visite = !sessionStorage.getItem('stmg_visite')
    sessionStorage.setItem('stmg_visite', '1')
  } catch { /* stockage indisponible : la vue compte quand même */ }
  fetch(`${SUPA_URL}/rest/v1/rpc/revizstmg_compter_vue`, {
    method: 'POST',
    keepalive: true,
    headers: { apikey: SUPA_ANON, Authorization: `Bearer ${SUPA_ANON}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_page: page, p_visite: visite }),
  }).catch(() => { /* hors ligne : tant pis pour cette vue */ })
}
