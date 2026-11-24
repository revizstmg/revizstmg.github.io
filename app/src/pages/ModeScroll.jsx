import './ModeScroll.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { subjectsForTrack } from '../data/tracks.js'
import { getChapter } from '../data/index.js'
import { construireFlux } from '../data/scroll.js'
import { CourseText } from '../components/Course.jsx'
import Introuvable from './Introuvable.jsx'

// Mode Scroll : le cours en cartes courtes, une par écran, pour réviser d'un pouce sur téléphone.
// Ouvert à tous, sans compte ni abonnement.
const PUCES = {
  cours: '📘 L’essentiel', formule: '🧮 Formule', piege: '⚠️ Piège', astuce: '💡 Astuce', exemple: '🔎 Exemple', flash: '🃏 Flashcard', qcm: '⚡ Question éclair',
}
const XP_BONNE_REPONSE = 3

// Choix du thème à parcourir.
export default function ModeScroll() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  const matieres = subjectsForTrack(state.track).filter((s) => !s.comingSoon && !s.resourceOnly && (s.chapters || []).length && !['langues', 'p1-langues'].includes(s.id))
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-4 py-2" lang="fr" data-no-translate>
      <header className="page-hero page-hero-compact text-center">
        <p className="kicker">📱 Mode Scroll</p>
        <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight">Révise en faisant défiler</h1>
        <p className="mt-2 text-sm">Un point de cours, une flashcard ou une question par écran. Fais glisser vers le haut : pas besoin de chercher quoi lire.</p>
      </header>
      <div className="space-y-2">
        {matieres.map((s) => (
          <details key={s.id} className="card p-3">
            <summary className="flex cursor-pointer items-center gap-3 font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-xl text-lg" style={{ backgroundColor: `${s.color}22` }} aria-hidden>{s.icon || '📘'}</span>
              <span className="flex-1">{s.short || s.name}</span>
              <span className="text-xs font-normal">{s.chapters.length} thèmes</span>
            </summary>
            <ul className="mt-3 space-y-1.5">
              {s.chapters.map((th) => (
                <li key={th.id}>
                  <Link to={`/scroll/${s.id}/${th.id}`} className="block rounded-xl border border-slate-200 px-3 py-2.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                    <CourseText text={th.short || th.name} />
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  )
}

function Carte({ c, onBonne }) {
  const [retournee, setRetournee] = useState(false)
  const [choisi, setChoisi] = useState(null)
  return (
    <section className="scroll-carte" aria-label={PUCES[c.type]}>
      <span className="scroll-puce">{PUCES[c.type]}</span>
      <p className="text-xs opacity-70"><CourseText text={c.chapitre} /></p>
      {c.type === 'flash' && (
        <>
          <button type="button" className="scroll-flash" aria-pressed={retournee} onClick={() => setRetournee((v) => !v)}>
            <span><CourseText text={retournee ? c.verso : c.recto} /></span>
          </button>
          <p className="scroll-indice">{retournee ? 'Touche pour revoir le terme' : 'Touche la carte pour voir la réponse'}</p>
        </>
      )}
      {c.type === 'qcm' && (
        <>
          <p className="scroll-texte whitespace-pre-line"><CourseText text={c.q} /></p>
          <div className="scroll-choix" role="group" aria-label="Réponses">
            {c.choix.map((ch, i) => (
              <button
                key={i}
                type="button"
                disabled={choisi !== null}
                data-etat={choisi === null ? undefined : i === c.bonne ? 'bon' : i === choisi ? 'faux' : undefined}
                onClick={() => { setChoisi(i); if (i === c.bonne) onBonne() }}
              >
                <CourseText text={ch} />
              </button>
            ))}
          </div>
          {choisi !== null && (
            <p role="status" className="text-sm">
              <strong>{choisi === c.bonne ? `Bravo ! +${XP_BONNE_REPONSE} XP. ` : 'Pas tout à fait. '}</strong>
              {c.explication && <CourseText text={c.explication} />}
            </p>
          )}
        </>
      )}
      {c.type === 'formule' && <p className="scroll-formule"><CourseText text={c.texte} /></p>}
      {c.type === 'exemple' && (
        <>
          <p className="font-display text-lg font-semibold"><CourseText text={c.titre} /></p>
          <p className="scroll-texte whitespace-pre-line"><CourseText text={c.texte} /></p>
        </>
      )}
      {['cours', 'piege', 'astuce'].includes(c.type) && <p className="scroll-texte"><CourseText text={c.texte} /></p>}
      <p className="scroll-indice" aria-hidden>↑ Fais glisser pour continuer</p>
    </section>
  )
}

// Le fil de cartes d'un thème.
export function FluxScroll() {
  const { sid, tid } = useParams()
  const { state, addXp } = useStore()
  const navigate = useNavigate()
  const theme = getChapter(tid)
  const cartes = useMemo(() => (theme && theme.subjectId === sid ? construireFlux(tid) : []), [theme, sid, tid])
  const [index, setIndex] = useState(0)
  const liste = useRef(null)
  const gagnes = useRef(new Set())
  useEffect(() => {
    liste.current?.focus()
    // Le fil occupe tout l'écran : la page derrière ne doit pas défiler.
    const avant = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = avant }
  }, [])
  if (!state.track) return <Navigate to="/" replace />
  if (!theme || theme.subjectId !== sid) return <Introuvable />
  const total = cartes.length + 1
  const onScroll = (e) => {
    const h = e.currentTarget.clientHeight || 1
    setIndex(Math.min(total - 1, Math.round(e.currentTarget.scrollTop / h)))
  }
  const fermer = () => navigate('/scroll')
  return createPortal(
    <div className="scroll-flux" role="region" aria-label="Mode Scroll" lang="fr" data-no-translate>
      <div className="scroll-haut">
        <button type="button" onClick={fermer} aria-label="Fermer le mode scroll" className="grid h-10 w-10 place-items-center rounded-full text-xl">✕</button>
        <div className="scroll-barre" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index + 1} aria-label="Avancement"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
        <span className="text-xs tabular-nums">{index + 1} / {total}</span>
      </div>
      <div className="scroll-liste" ref={liste} onScroll={onScroll} tabIndex={0}>
        {cartes.map((c, i) => <Carte key={i} c={c} onBonne={() => { if (!gagnes.current.has(i)) { gagnes.current.add(i); addXp(XP_BONNE_REPONSE) } }} />)}
        <section className="scroll-carte items-center text-center" aria-label="Fin">
          <p className="text-5xl" aria-hidden>🎉</p>
          <h2 className="font-display text-2xl font-semibold">Thème terminé</h2>
          <p className="text-sm"><CourseText text={theme.short || theme.name} /></p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-primary" onClick={() => liste.current?.scrollTo({ top: 0 })}>Recommencer</button>
            <Link to={`/subject/${sid}/theme/${tid}`} className="btn-ghost">Voir le cours complet</Link>
            <Link to="/scroll" className="btn-ghost">Autre thème</Link>
          </div>
        </section>
      </div>
    </div>,
    document.body,
  )
}
