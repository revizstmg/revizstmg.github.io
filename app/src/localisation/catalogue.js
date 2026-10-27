import FR from '../i18n/fr.js'
const books = { fr: {} }
const loading = {}
const loaders = {
  de: () => Promise.all([import('./public.de.json'), import('../i18n/de.js')]),
  en: () => Promise.all([import('./public.en.json'), import('../i18n/en.js')]), es: () => Promise.all([import('./public.es.json'), import('../i18n/es.js')]),
  it: () => Promise.all([import('./public.it.json'), import('../i18n/it.js')]), ar: () => Promise.all([import('./public.ar.json'), import('../i18n/ar.js')]),
}
export const canonicalPublicText = text => String(text || '').replace(/Gestion (?:&|et) [Ff]inance/g, 'Gestion et finance')
export const publicKey = (text) => String(text || '').replace(/\s+/g, ' ').trim()
export function loadPublicLocale(lang) {
  if (books[lang]) return Promise.resolve(books[lang])
  if (!loaders[lang]) return Promise.resolve({})
  return loading[lang] ||= loaders[lang]().then(([extra, core]) => {
    const base = Object.fromEntries(Object.entries(FR).filter(([key]) => core.default[key]).map(([key, value]) => [publicKey(value), core.default[key]]))
    return books[lang] = Object.fromEntries(Object.entries({ ...base, ...extra.default }).map(([key, value]) => [publicKey(canonicalPublicText(key)), value]))
  }).catch((e) => { delete loading[lang]; throw e })
}
export function knownPublicText(text, lang) {
  if (lang === 'fr') return canonicalPublicText(text)
  const translated = books[lang]?.[publicKey(canonicalPublicText(text))] ?? books[lang]?.[publicKey(text)]
  if (translated === undefined) return undefined
  const s = String(text || '')
  return (s.match(/^\s+/)?.[0] || '') + translated + (s.match(/\s+$/)?.[0] || '')
}
export function formatPublicText(text, values = {}) {
  return String(text).replace(/\{([\w]+)\}/g, (all, key) => values[key] === undefined ? all : String(values[key]))
}
