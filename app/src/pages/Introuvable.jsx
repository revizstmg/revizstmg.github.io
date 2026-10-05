import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../i18n.js'

// Page « introuvable » : adresse inconnue, ou matière, thème, chapitre qui
// n'existe plus (ancien favori, lien mal recopié, chapitres réorganisés).
// `retour` ({ to, label }) propose de remonter au niveau qui existe encore ;
// sans lui, on revient à l'accueil.
export default function Introuvable({ retour }) {
  const t = useT()
  const titre = t('notFoundTitle')
  useEffect(() => {
    const avant = document.title
    document.title = `${titre} — RévizSTMG`
    return () => { document.title = avant }
  }, [titre])

  return (
    <div className="animate-lux mx-auto max-w-md py-10 text-center">
      <p className="font-display text-6xl font-semibold" style={{ color: 'var(--c-accent-texte)' }} aria-hidden>404</p>
      <h1 className="mt-2 font-display text-2xl font-semibold">{titre}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(retour ? 'notFoundMoved' : 'notFoundText')}</p>
      <Link to={retour?.to || '/'} className="btn-primary mt-6 inline-flex">
        {retour ? `${t('notFoundBack')} ${retour.label}` : t('notFoundHome')}
      </Link>
    </div>
  )
}
