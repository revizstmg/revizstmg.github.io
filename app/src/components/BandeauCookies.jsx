import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n.js'

// Bandeau d'information sur les cookies, montré une seule fois. RévizSTMG ne
// dépose aucun cookie publicitaire ni de mesure d'audience : seul le stockage
// nécessaire au fonctionnement est utilisé, ce qui ne demande pas de
// consentement (article 82 de la loi Informatique et Libertés). Le bandeau
// informe donc, sans faux choix « Accepter / Refuser ».
const CLE = 'stmg_cookies_info'
const dejaLu = () => {
  try { return localStorage.getItem(CLE) === '1' } catch { return true }
}

// Vrai une fois le bandeau fermé (le bandeau « Installer l'appli » attend ce moment).
export function useInfoCookiesLue() {
  const [lu, setLu] = useState(dejaLu)
  useEffect(() => {
    const marquer = () => setLu(true)
    window.addEventListener('stmg-cookies-lu', marquer)
    return () => window.removeEventListener('stmg-cookies-lu', marquer)
  }, [])
  return lu
}

export function BandeauCookies() {
  const t = useT()
  const lu = useInfoCookiesLue()
  if (lu) return null
  const fermer = () => {
    try { localStorage.setItem(CLE, '1') } catch { /* stockage indisponible */ }
    window.dispatchEvent(new Event('stmg-cookies-lu'))
  }
  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-[60] px-3 pt-2" role="region" aria-label={t('cookiesTitle')} style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
      <div
        className="mx-auto flex max-w-md items-center gap-2.5 rounded-2xl border px-3 py-2 shadow-xl"
        style={{ backgroundColor: 'color-mix(in srgb, var(--c-bg) 94%, var(--c-accent) 6%)', borderColor: 'color-mix(in srgb, var(--c-accent) 30%, transparent)' }}
      >
        <span className="shrink-0 text-xl" aria-hidden>🍪</span>
        <p className="min-w-0 flex-1 text-[13px] leading-snug">
          {t('cookiesInfo')}{' '}
          <Link to="/confidentialite" onClick={fermer} className="font-semibold underline">{t('cookiesMore')}</Link>
        </p>
        <button onClick={fermer} className="shrink-0 rounded-xl px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--c-accent-fort)' }}>
          {t('cookiesOk')}
        </button>
      </div>
    </div>
  )
}
