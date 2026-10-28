// Internationalisation de l'interface (FR, EN, ES, IT, AR) + traduction du contenu.
// - `useT()` renvoie une fonction t(clé) pour les libellés d'interface
//   (traduits à la main ci-dessous).
// - `useAutoTranslate(texte)` traduit un texte français à la volée via le
//   moteur du dictionnaire (glossaire + service en ligne), avec cache.
import { useEffect, useState } from 'react'
import { useStore } from './store.jsx'
import { translate } from './translate.js'
import FR from './i18n/fr.js'
import { loadPublicLocale, knownPublicText, formatPublicText, canonicalPublicText } from './localisation/catalogue.js'

// --- Libellés d'interface -------------------------------------------------
// Le français est inclus d'office. Les autres langues sont chargées à la demande
// (un fichier par langue) : l'app démarre plus vite pour tous ceux qui révisent
// en français. Le temps du chargement, les libellés s'affichent en français.
const DICT = { fr: FR }
const CHARGEURS = {
  de: () => import('./i18n/de.js'),
  en: () => import('./i18n/en.js'),
  es: () => import('./i18n/es.js'),
  it: () => import('./i18n/it.js'),
  ar: () => import('./i18n/ar.js'),
}
const enCours = {}
const abonnes = new Set()
function chargerLangue(lang) {
  if (DICT[lang] || !CHARGEURS[lang] || enCours[lang]) return
  enCours[lang] = CHARGEURS[lang]()
    .then((m) => { DICT[lang] = m.default; abonnes.forEach((maj) => maj()) })
    .catch(() => { delete enCours[lang]; window.dispatchEvent(new Event('stmg-translation-error')) })
}

export function useLang() {
  const { state } = useStore()
  return state.lang || 'fr'
}

export function useT() {
  const lang = useLang()
  const [, setVersion] = useState(0)
  useEffect(() => {
    if (DICT[lang]) return
    const maj = () => setVersion((v) => v + 1)
    abonnes.add(maj)
    chargerLangue(lang)
    const retry = () => chargerLangue(lang)
    window.addEventListener('stmg-translation-retry', retry)
    return () => { abonnes.delete(maj); window.removeEventListener('stmg-translation-retry', retry) }
  }, [lang])
  return (key) => (DICT[lang] && DICT[lang][key]) || FR[key] || key
}

// Libellé traduit d'un type de jeu (qcm, vraifaux, …).
export function useGameLabel() {
  const t = useT()
  return (type) => t('gl_' + type)
}

// Traduit un texte français vers la langue de l'interface (cache + service en
// ligne). Affiche le français tant que la traduction n'est pas arrivée.
export function usePublicText() {
  const lang = useLang()
  const [, update] = useState(0)
  useEffect(() => {
    if (lang === 'fr') return
    let alive = true
    const load = () => loadPublicLocale(lang).then(() => { if (alive) update((v) => v + 1) }).catch(() => {})
    load()
    window.addEventListener('stmg-translation-retry', load)
    return () => { alive = false; window.removeEventListener('stmg-translation-retry', load) }
  }, [lang])
  return (text, values) => formatPublicText(knownPublicText(text, lang) ?? text ?? '', values)
}

export function useAutoTranslate(text) {
  const lang = useLang()
  const source = canonicalPublicText(text)
  const [out, setOut] = useState(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (lang === 'fr') return
    const again = () => setRetry((v) => v + 1)
    window.addEventListener('stmg-translation-retry', again)
    return () => window.removeEventListener('stmg-translation-retry', again)
  }, [lang])
  useEffect(() => {
    if (lang === 'fr' || !/[\p{L}]/u.test(source)) return
    let alive = true
    translate(source, 'fr', lang).then((r) => {
      if (alive) setOut({ source, lang, text: r.text })
    }).catch(() => {
      if (alive) window.dispatchEvent(new Event('stmg-translation-error'))
    })
    return () => { alive = false }
  }, [source, lang, retry])
  if (lang === 'fr') return source
  const local = knownPublicText(source, lang)
  if (local !== undefined) return local
  if (out?.source === source && out.lang === lang) {
    return (source.match(/^\s+/)?.[0] || '') + out.text + (source.match(/\s+$/)?.[0] || '')
  }
  return source
}
