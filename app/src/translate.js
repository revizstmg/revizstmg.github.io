// Moteur de traduction du site (dictionnaire + bascule de langue).
// Stratégie hybride :
//  1) glossaire hors-ligne (mots/expressions courants FR/EN/ES) → instantané ;
//  2) sinon, service en ligne gratuit MyMemory → traduit aussi les phrases.
// Les résultats en ligne sont mis en cache (localStorage) pour l'hors-ligne
// ultérieur et pour ménager les quotas.
import { loadPublicLocale, knownPublicText } from './localisation/catalogue.js'
import { GLOSSARY } from './data/glossary.js'

export const LANGS = { fr: 'Français', de: 'Deutsch', en: 'English', es: 'Español', it: 'Italiano', ar: 'العربية' }

// Index du glossaire : pour chaque langue, map mot(minuscule) → entrée.
const index = { fr: new Map(), en: new Map(), es: new Map() }
for (const entry of GLOSSARY) {
  for (const l of ['fr', 'en', 'es']) {
    const v = entry[l]
    if (v) index[l].set(v.toLowerCase().trim(), entry)
  }
}

function glossaryLookup(text, source, target) {
  const key = text.toLowerCase().trim()
  const entry = index[source]?.get(key)
  if (entry && entry[target]) return entry[target]
  return null
}

const cacheKey = (t, s, tg) => `mt:${s}:${tg}:${t}`
// Traductions en ligne mémorisées sur l'appareil : au plus 400. Au-delà (ou si
// le stockage est plein), on les oublie toutes : elles se retrouvent en ligne,
// alors que la progression de l'élève, elle, ne se retrouve pas.
const MEMOIRE_MAX = 400
export function oublierTraductions() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && k.startsWith('mt:')) localStorage.removeItem(k)
    }
  } catch { /* stockage indisponible */ }
}
function memoriser(key, texte) {
  try {
    let n = 0
    for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i)?.startsWith('mt:')) n++
    if (n >= MEMOIRE_MAX) oublierTraductions()
    localStorage.setItem(key, texte)
  } catch { oublierTraductions() }
}

const inflight = new Map()
let running = 0
const queue = []
function schedule(task) {
  return new Promise((resolve, reject) => { queue.push({ task, resolve, reject }); drain() })
}
function drain() {
  while (running < 2 && queue.length) {
    const job = queue.shift()
    running++
    Promise.resolve().then(job.task).then(job.resolve, job.reject).finally(() => { running--; drain() })
  }
}
// MyMemory limite une requête à 500 octets, y compris pour l'arabe/les accents.
export function translationChunks(text, maxBytes = 450) {
  const chunks = []
  let rest = text
  const bytes = new TextEncoder()
  while (bytes.encode(rest).length > maxBytes) {
    let end = 0, lastSpace = 0, size = 0
    for (const char of rest) {
      const n = bytes.encode(char).length
      if (size + n > maxBytes) break
      size += n; end += char.length
      if (/\s/.test(char)) lastSpace = end
    }
    const cut = lastSpace || end
    chunks.push(rest.slice(0, cut).trim())
    rest = rest.slice(cut).trimStart()
  }
  if (rest) chunks.push(rest)
  return chunks
}
async function online(text, source, target) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${target}`
  const res = await schedule(() => fetch(url))
  if (!res.ok) throw new Error('Service de traduction indisponible (' + res.status + ')')
  const data = await res.json()
  const out = data?.responseData?.translatedText
  if ((data.responseStatus && Number(data.responseStatus) !== 200) || !out || /MYMEMORY WARNING|QUERY LENGTH LIMIT|DAILY FREE TRANSLATIONS|QUOTA EXCEEDED|TOO MANY REQUESTS/i.test(out)) throw new Error('Traduction temporairement indisponible.')
  return out.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}
// Les modèles publics sont traduits ; les données personnelles interpolées ne
// sont jamais passées à cette fonction par les composants d'interface.
export async function translate(text, source, target) {
  const clean = String(text || '').trim()
  if (!clean) return { text: '', via: null }
  if (!LANGS[source] || !LANGS[target]) throw new Error('Langue non prise en charge.')
  if (source === target || !/[\p{L}]/u.test(clean)) return { text: clean, via: 'même langue' }
  if (source === 'fr') {
    await loadPublicLocale(target)
    const local = knownPublicText(clean, target)
    if (local !== undefined) return { text: local, via: 'interface' }
  }
  const g = glossaryLookup(clean, source, target)
  if (g) return { text: g, via: 'glossaire' }
  const key = cacheKey(clean, source, target)
  try { const c = localStorage.getItem(key); if (c) return { text: c, via: 'en ligne (mémorisé)' } } catch { /* stockage indisponible */ }
  if (inflight.has(key)) return inflight.get(key)
  const request = (async () => {
    const translated = []
    for (const part of translationChunks(clean)) translated.push(await online(part, source, target))
    const out = translated.join(' ')
    const variables = clean.match(/\{v\d+\}/g) || []
    if (variables.some((v) => !out.includes(v))) throw new Error('La traduction a modifié les variables du texte.')
    memoriser(key, out)
    return { text: out, via: 'en ligne' }
  })()
  inflight.set(key, request)
  try { return await request } finally { inflight.delete(key) }
}
