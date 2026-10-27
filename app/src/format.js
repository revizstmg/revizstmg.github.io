// Nombres affichés selon la langue de l'interface (« 12 345 » en français), sur tous les écrans.
export const nombre = (n, lang = 'fr') => {
  try { return new Intl.NumberFormat(lang, { numberingSystem: 'latn' }).format(Number(n) || 0) } catch { return String(n) }
}
