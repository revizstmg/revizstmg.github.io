// Fait patienter une page le temps que les matières dont elle a besoin soient
// chargées (voir chargerMatiere dans data/index.js). Une matière déjà chargée
// s'affiche tout de suite, sans indicateur.
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { chargerMatieres, matiereChargee, ALL_CHAPTERS } from '../data/index.js'
import { ORDRE_MATIERES } from './contenu.js'
import { subjectsForTrack } from '../data/tracks.js'
import { useStore } from '../store.jsx'
import { useT } from '../i18n.js'

export function Chargement({ erreur, onReessayer }) {
  const t = useT()
  return (
    <div role="status" aria-live="polite" className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center">
      {erreur ? (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('loadingContentError')}</p>
          <button type="button" onClick={onReessayer} className="btn btn-primary">{t('retry')}</button>
        </>
      ) : (
        <>
          <span aria-hidden className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-[color:var(--c-accent)]" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('loadingContent')}</p>
        </>
      )}
    </div>
  )
}

export default function Contenu({ matieres, children }) {
  // Une matière inconnue (lien erroné) n'est jamais chargée : la page affichera
  // « introuvable » au lieu d'attendre indéfiniment.
  const ids = (matieres || []).filter((id) => id && ORDRE_MATIERES.includes(id))
  const cle = ids.join(',')
  const toutesChargees = ids.every(matiereChargee)
  const [pret, setPret] = useState(toutesChargees)
  const [erreur, setErreur] = useState(false)
  const [essai, setEssai] = useState(0)

  useEffect(() => {
    if (ids.every(matiereChargee)) { setPret(true); setErreur(false); return }
    let actif = true
    setPret(false); setErreur(false)
    chargerMatieres(ids).then(
      () => { if (actif) setPret(true) },
      () => { if (actif) setErreur(true) },
    )
    return () => { actif = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, essai])

  if (!pret || !toutesChargees) return <Chargement erreur={erreur} onReessayer={() => setEssai((n) => n + 1)} />
  return children
}

// Pages d'une matière : /subject/:sid/…
export function ContenuMatiere({ children }) {
  const { sid } = useParams()
  return <Contenu matieres={[sid]}>{children}</Contenu>
}

// Pages qui piochent dans toutes les matières de la filière de l'élève
// (bac blanc, révision express, coach IA, défi du jour, duels).
export function ContenuFiliere({ children }) {
  const { state } = useStore()
  const ids = subjectsForTrack(state.track).filter((s) => s && !s.comingSoon).map((s) => s.id)
  return <Contenu matieres={ids}>{children}</Contenu>
}

// Matières d'une liste de thèmes (favoris, reprise…).
export function matieresDesThemes(themeIds) {
  return [...new Set((themeIds || []).map((id) => ALL_CHAPTERS[id]?.subjectId).filter(Boolean))]
}
