// Progression de l'élève : ce qui part sur son compte, et la fusion entre la
// copie de l'appareil et celle du compte quand il révise sur plusieurs appareils.
//
// Chaque copie porte des métadonnées `_sync` :
// - compteurs (XP, pièces, gels, réponses) : ce que chaque appareil a ajouté et
//   retiré depuis une base commune. La fusion garde l'apport de chaque appareil :
//   une dépense faite sur le téléphone n'est pas remboursée par l'ordinateur, et
//   deux gains faits en même temps sur deux appareils comptent tous les deux ;
// - dates de modification des éléments (favoris, paquets, fiches, carnet
//   d'erreurs, notes) et de quelques réglages : la modification la plus récente
//   l'emporte, suppression comprise, au lieu de faire réapparaître l'élément ;
// - version de la copie (`rev`) : la copie du compte n'est remplacée que si elle
//   n'a pas changé depuis la dernière lecture, sinon on fusionne d'abord.
// Une copie sans `_sync` (ancienne version de l'application) se fusionne avec
// les règles d'avant : le plus grand, le plus récent ou l'union.

// Champs de progression synchronisés sur le compte (multi-appareil).
export const PROGRESS_KEYS = ['xp', 'streak', 'badges', 'chapters', 'favorites', 'lastChapter', 'totalAnswers', 'correctAnswers', 'weekly', 'srs', 'bacDate', 'coins', 'owned', 'freezes', 'history', 'themeTime', 'savedDecks', 'dailyChallenge', 'notes', 'fiches', 'grandOral', 'erreurs', 'etudeGestion', 'shopRewards', 'shopWalletUpdatedAt']
// Carnet d'erreurs : au plus tant de questions ratées, les plus récentes d'abord.
export const CARNET_MAX = 150

const COMPTEURS = ['xp', 'coins', 'freezes', 'totalAnswers', 'correctAnswers']
// Collections datées élément par élément, et règle d'avant (copies sans dates).
const COLLECTIONS = {
  favorites: { cle: (x) => x, ancienne: (x) => x },
  savedDecks: { cle: (d) => d?.id, ancienne: (x, y) => ((y.savedAt || 0) > (x.savedAt || 0) ? y : x) },
  fiches: { cle: (f) => f?.id, ancienne: (x, y) => ((y.createdAt || 0) > (x.createdAt || 0) ? y : x) },
  erreurs: { cle: (e) => e?.id, ancienne: (x, y) => ((y.le || '') > (x.le || '') ? y : x) },
  notes: { carte: true, ancienne: (x, y) => (String(y).length > String(x).length ? y : x) },
}
const CHAMPS = ['lastChapter', 'bacDate']
// La trace d'un élément supprimé est oubliée au bout de 120 jours.
const OUBLI = 120 * 86400000

// Étude de gestion (Première STMG) : le projet, les sources et les arguments A-E-I.
// `maj` date la dernière modification, pour garder la version la plus récente
// quand l'appareil et le compte diffèrent.
export function etudeGestionVide() {
  return { theme: '', organisation: '', problematique: '', coches: {}, sources: [], analyse: {}, arguments: [], maj: 0 }
}

// Grand Oral (Terminale) : les deux questions et le plan, puis, comme pour
// l'étude de gestion, l'organisation qui les illustre, les sources, l'analyse
// et les arguments A-E-I (chacun rattaché à la question 1 ou 2).
export function grandOralVide() {
  return { spec: '', q1: '', q2: '', notes: '', organisation: '', sources: [], analyse: {}, arguments: [], maj: 0 }
}

// Empreinte courte d'un texte (cyrb53) : identifiants d'éléments et détection
// d'une progression déjà envoyée.
function cyrb53(texte, graine = 0) {
  let h1 = 0xdeadbeef ^ graine, h2 = 0x41c6ce57 ^ graine
  for (let i = 0; i < texte.length; i++) {
    const c = texte.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 2654435761)
    h2 = Math.imul(h2 ^ c, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}
const cleCourte = (id) => cyrb53(String(id))

// Identifiant de cet appareil (navigateur), pour ses compteurs.
let appareilSansStockage = null
const nouvelId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
export function appareil() {
  try {
    let id = localStorage.getItem('stmg_appareil')
    if (!id) { id = nouvelId(); localStorage.setItem('stmg_appareil', id) }
    return id
  } catch {
    return (appareilSansStockage ||= nouvelId())
  }
}

const nombre = (v) => Number(v) || 0
const somme = (par) => Object.values(par || {}).reduce((t, e) => t + nombre(e?.[0]) - nombre(e?.[1]), 0)
const metaDe = (s) => (s?._sync && s._sync.v === 1 ? s._sync : null)
const memeValeur = (x, y) => x === y || JSON.stringify(x ?? null) === JSON.stringify(y ?? null)

// Métadonnées d'une copie, créées si elle n'en a pas (la valeur actuelle devient
// la base des compteurs, avec la version du portefeuille à ce moment-là) et
// recalées si un compteur ne correspond plus.
function avecMeta(s) {
  const m = metaDe(s)
  const base = { ...(m?.base || {}) }
  const compteurs = m?.compteurs || {}
  for (const f of COMPTEURS) {
    if (!m || nombre(base[f]) + somme(compteurs[f]) !== nombre(s?.[f])) base[f] = nombre(s?.[f]) - somme(compteurs[f])
  }
  const versionBase = m ? nombre(m.versionBase) : nombre(s?.shopWalletUpdatedAt)
  return { v: 1, rev: m?.rev || 0, vuServeur: m?.vuServeur ?? null, empreinte: m?.empreinte || '', base, versionBase, compteurs, items: m?.items || {}, champs: m?.champs || {} }
}

function elements(valeur, def) {
  const out = new Map()
  if (def.carte) {
    for (const [id, x] of Object.entries(valeur && typeof valeur === 'object' ? valeur : {})) if (x != null && x !== '') out.set(id, x)
  } else {
    for (const x of Array.isArray(valeur) ? valeur : []) {
      const id = def.cle(x)
      if (id != null && id !== '') out.set(String(id), x)
    }
  }
  return out
}

// Après une modification de l'élève sur cet appareil : note ce qui a changé
// (apports aux compteurs, dates des éléments et des réglages).
export function noter(avant, apres, { appareil: ici = appareil(), maintenant = Date.now() } = {}) {
  if (!apres || apres === avant) return apres
  const m = avecMeta(avant)
  let change = !metaDe(avant)
  for (const f of COMPTEURS) {
    const d = nombre(apres[f]) - nombre(avant?.[f])
    if (!d) continue
    const par = { ...(m.compteurs[f] || {}) }
    const [plus, moins] = par[ici] || [0, 0]
    par[ici] = d > 0 ? [nombre(plus) + d, nombre(moins)] : [nombre(plus), nombre(moins) - d]
    m.compteurs = { ...m.compteurs, [f]: par }
    change = true
  }
  for (const [k, def] of Object.entries(COLLECTIONS)) {
    if (apres[k] === avant?.[k]) continue
    const a = elements(avant?.[k], def), b = elements(apres[k], def)
    let dates = null
    for (const id of new Set([...a.keys(), ...b.keys()])) {
      if (memeValeur(a.get(id), b.get(id))) continue
      dates ||= { ...(m.items[k] || {}) }
      dates[cleCourte(id)] = maintenant
    }
    if (dates) { m.items = { ...m.items, [k]: dates }; change = true }
  }
  for (const k of CHAMPS) {
    if (memeValeur(avant?.[k], apres[k])) continue
    m.champs = { ...m.champs, [k]: maintenant }
    change = true
  }
  return change ? { ...apres, _sync: m } : apres
}

// Ancienne règle d'un compteur, pour une copie sans métadonnées : un solde
// dépensable vient de la copie la plus récente (`shopWalletUpdatedAt`), le
// maximum ne sert qu'aux anciennes sauvegardes sans version.
function ancienneRegle(f, a, b) {
  if (f === 'coins' || f === 'freezes') {
    const va = nombre(a.shopWalletUpdatedAt), vb = nombre(b.shopWalletUpdatedAt)
    if (va || vb) return nombre((va >= vb ? a : b)[f])
  }
  return Math.max(nombre(a[f]), nombre(b[f]))
}

function fusionCompteurs(x = {}, y = {}) {
  const out = {}
  for (const id of new Set([...Object.keys(x), ...Object.keys(y)])) {
    const [p1, m1] = x[id] || [0, 0], [p2, m2] = y[id] || [0, 0]
    out[id] = [Math.max(nombre(p1), nombre(p2)), Math.max(nombre(m1), nombre(m2))]
  }
  return out
}

// Fusion locale ↔ compte (même utilisateur) : `a` est la copie de l'appareil,
// `b` celle du compte. Les champs hors progression viennent de `a`.
export function mergeProgress(a, b, maintenant = Date.now()) {
  if (!b || typeof b !== 'object' || !Object.keys(b).length) return a
  const ma = metaDe(a), mb = metaDe(b)
  const ea = avecMeta(a), eb = avecMeta(b)
  const out = { ...a }
  out.shopWalletUpdatedAt = Math.max(nombre(a.shopWalletUpdatedAt), nombre(b.shopWalletUpdatedAt))
  // Deux bases différentes : deux appareils sont passés à ce format chacun de
  // leur côté. Le solde dépensable part du portefeuille le plus récent (sinon un
  // achat fait avant serait remboursé) ; XP et réponses, du plus grand.
  const baseRecente = ea.versionBase >= eb.versionBase ? ea : eb
  const meta = { v: 1, rev: ea.rev, vuServeur: ea.vuServeur, empreinte: ea.empreinte, base: {}, versionBase: ma && mb ? baseRecente.versionBase : out.shopWalletUpdatedAt, compteurs: {}, items: {}, champs: {} }

  // Compteurs : apports de chaque appareil (copies récentes) ou ancienne règle.
  for (const f of COMPTEURS) {
    let par, base
    if (ma && mb) {
      par = fusionCompteurs(ea.compteurs[f], eb.compteurs[f])
      base = f === 'coins' || f === 'freezes' ? nombre(baseRecente.base[f]) : Math.max(nombre(ea.base[f]), nombre(eb.base[f]))
    } else if (ma || mb) { par = (ma ? ea : eb).compteurs[f] || {}; base = ancienneRegle(f, a, b) - somme(par) }
    else { par = {}; base = ancienneRegle(f, a, b) }
    meta.base[f] = base
    if (Object.keys(par).length) meta.compteurs[f] = par
    out[f] = base + somme(par)
  }

  // Éléments datés : le plus récemment modifié l'emporte, suppression comprise.
  for (const [k, def] of Object.entries(COLLECTIONS)) {
    const ia = elements(a[k], def), ib = elements(b[k], def)
    const da = ea.items[k] || {}, db = eb.items[k] || {}
    const garde = new Map()
    for (const id of new Set([...ia.keys(), ...ib.keys()])) {
      const h = cleCourte(id), sa = da[h], sb = db[h]
      const x = ia.get(id), y = ib.get(id)
      let choix
      if (sa == null && sb == null) choix = x === undefined ? y : y === undefined ? x : def.ancienne(x, y)
      else choix = (sa ?? -1) >= (sb ?? -1) ? x : y
      if (choix !== undefined) garde.set(id, choix)
    }
    const presents = new Set([...garde.keys()].map(cleCourte))
    const dates = {}
    for (const h of new Set([...Object.keys(da), ...Object.keys(db)])) {
      const le = Math.max(nombre(da[h]), nombre(db[h]))
      if (presents.has(h) || maintenant - le < OUBLI) dates[h] = le
    }
    if (Object.keys(dates).length) meta.items[k] = dates
    out[k] = def.carte ? Object.fromEntries(garde) : [...garde.values()]
  }
  out.erreurs = out.erreurs.sort((x, y) => (y.le || '').localeCompare(x.le || '')).slice(0, CARNET_MAX)

  // Réglages datés (dernier point de reprise, date du bac).
  for (const k of CHAMPS) {
    const sa = ea.champs[k], sb = eb.champs[k]
    if (sa == null && sb == null) out[k] = a[k] || b[k] || null
    else out[k] = (sa ?? -1) >= (sb ?? -1) ? (a[k] ?? null) : (b[k] ?? null)
    const le = Math.max(nombre(sa), nombre(sb))
    if (le) meta.champs[k] = le
  }

  // Le reste ne fait que progresser : on garde le meilleur des deux.
  out.badges = Array.from(new Set([...(a.badges || []), ...(b.badges || [])]))
  const chapters = { ...(a.chapters || {}) }
  for (const [cid, rec] of Object.entries(b.chapters || {})) {
    const cur = chapters[cid] || { games: {}, quiz: 0 }
    const games = { ...(cur.games || {}) }
    for (const [gid, pct] of Object.entries(rec.games || {})) games[gid] = Math.max(games[gid] || 0, pct || 0)
    chapters[cid] = { games, quiz: Math.max(cur.quiz || 0, rec.quiz || 0), worked: !!(cur.worked || rec.worked) }
  }
  out.chapters = chapters
  const as = a.streak || { count: 0, last: null }, bs = b.streak || { count: 0, last: null }
  out.streak = (bs.last || '') > (as.last || '') || ((bs.last || '') === (as.last || '') && (bs.count || 0) > (as.count || 0)) ? bs : as
  // Objectif de la semaine : chapitres des deux copies, récompense réclamée une seule fois.
  const aw = a.weekly || { week: null, done: [] }, bw = b.weekly || { week: null, done: [] }
  if (aw.week && aw.week === bw.week) {
    out.weekly = { week: aw.week, done: Array.from(new Set([...(aw.done || []), ...(bw.done || [])])) }
    if (aw.rewarded || bw.rewarded) out.weekly.rewarded = aw.rewarded || bw.rewarded
  } else out.weekly = (bw.week || '') > (aw.week || '') ? bw : aw
  // Répétition espacée : on garde, par thème, la fiche la plus récente.
  const srs = { ...(a.srs || {}) }
  for (const [tid, rec] of Object.entries(b.srs || {})) {
    const cur = srs[tid]
    if (!cur || (rec.last || '') > (cur.last || '')) srs[tid] = rec
  }
  out.srs = srs
  // Les paliers sont uniques, y compris après synchronisation sur un autre appareil.
  out.shopRewards = { ...(a.shopRewards || {}), ...(b.shopRewards || {}) }
  out.owned = Array.from(new Set([...(a.owned || []), ...(b.owned || [])]))
  // Courbe de progression : par jour, on garde le plus grand XP cumulé.
  const hist = { ...(a.history || {}) }
  for (const [d, xp] of Object.entries(b.history || {})) hist[d] = Math.max(hist[d] || 0, xp || 0)
  out.history = hist
  // Temps de révision : par thème, on garde le plus grand. Les additionner
  // comptait deux fois le même temps, puisque le compte et l'appareil en
  // gardent chacun une copie : le temps doublait à chaque ouverture de l'app.
  const tt = { ...(a.themeTime || {}) }
  for (const [tid, s] of Object.entries(b.themeTime || {})) tt[tid] = Math.max(tt[tid] || 0, s || 0)
  out.themeTime = tt
  // Défi du jour : on garde la date la plus récente et la meilleure série.
  const ad = a.dailyChallenge || {}, bd = b.dailyChallenge || {}
  const recent = (bd.last || '') > (ad.last || '') ? bd : ad
  out.dailyChallenge = { last: recent.last || null, streak: recent.streak || 0, best: Math.max(ad.best || 0, bd.best || 0), lastBonus: recent.lastBonus || 0 }
  // Préparation du Grand Oral : depuis qu'elle contient sources, analyse et
  // arguments, la version modifiée en dernier l'emporte (`maj`). Une ancienne
  // préparation sans date se fusionne champ par champ (le texte le plus complet).
  const ga = a.grandOral || {}, gb = b.grandOral || {}
  if (ga.maj || gb.maj) out.grandOral = { ...grandOralVide(), ...((gb.maj || 0) > (ga.maj || 0) ? gb : ga) }
  else {
    const grandOral = {}
    for (const k of new Set([...Object.keys(ga), ...Object.keys(gb)])) grandOral[k] = String(gb[k] || '').length > String(ga[k] || '').length ? gb[k] : ga[k]
    out.grandOral = grandOral
  }
  // Étude de gestion : un seul dossier, on garde la version modifiée en dernier.
  const ega = a.etudeGestion, egb = b.etudeGestion
  out.etudeGestion = (egb?.maj || 0) > (ega?.maj || 0) ? egb : (ega || egb || etudeGestionVide())

  out._sync = meta
  return out
}

// Version de la copie du compte (null : jamais écrite par cette version de l'app).
export const versionDe = (progress) => metaDe(progress)?.rev ?? null

// Copie fusionnée avec celle du compte : on retient la version de cette dernière.
export function avecVersionServeur(s, rev) {
  return { ...s, _sync: { ...avecMeta(s), vuServeur: rev ?? null } }
}

// Après un envoi réussi de la version `rev` (empreinte `emp`) : c'est désormais
// la copie du compte.
export function apresEnvoi(s, rev, emp) {
  return { ...s, _sync: { ...avecMeta(s), rev, vuServeur: rev, empreinte: emp } }
}

// Ce qui part sur le compte : les champs de progression et les métadonnées.
export function chargeUtile(s, rev = metaDe(s)?.rev || 0) {
  const out = {}
  for (const k of PROGRESS_KEYS) out[k] = s?.[k]
  const m = avecMeta(s)
  out._sync = { v: 1, rev, appareil: appareil(), base: m.base, versionBase: m.versionBase, compteurs: m.compteurs, items: m.items, champs: m.champs }
  return out
}

// Empreinte d'une progression à envoyer, sans sa version ni l'appareil : deux
// copies identiques ont la même empreinte (rien de nouveau à sauvegarder).
export function empreinte(charge) {
  const { _sync: m, ...reste } = charge || {}
  const texte = JSON.stringify([reste, m?.base, m?.versionBase, m?.compteurs, m?.items, m?.champs])
  return `${cyrb53(texte)}.${texte.length.toString(36)}`
}

// La progression de cet appareil a-t-elle changé depuis le dernier envoi réussi ?
export const aSauvegarder = (s) => empreinte(chargeUtile(s)) !== (metaDe(s)?.empreinte || '')
