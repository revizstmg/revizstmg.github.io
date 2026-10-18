const books = { fr: {} }
const loading = {}
const loaders = {
  en: () => import('./public.en.json'), es: () => import('./public.es.json'),
  it: () => import('./public.it.json'), ar: () => import('./public.ar.json'),
}
export const publicKey = (text) => String(text || '').replace(/\s+/g, ' ').trim()
export function loadPublicLocale(lang) {
  if (books[lang]) return Promise.resolve(books[lang])
  if (!loaders[lang]) return Promise.resolve({})
  return loading[lang] ||= loaders[lang]().then((m) => (books[lang] = m.default)).catch((e) => { delete loading[lang]; throw e })
}
export function knownPublicText(text, lang) {
  if (lang === 'fr') return String(text || '')
  const translated = books[lang]?.[publicKey(text)]
  if (translated === undefined) return undefined
  const s = String(text || '')
  return (s.match(/^\s+/)?.[0] || '') + translated + (s.match(/\s+$/)?.[0] || '')
}
export function formatPublicText(text, values = {}) {
  return String(text).replace(/\{([\w]+)\}/g, (all, key) => values[key] === undefined ? all : String(values[key]))
}
