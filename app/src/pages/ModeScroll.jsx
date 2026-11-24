import './ModeScroll.css'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
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
  trou: '✏️ À compléter', tri: '🗂️ A ou B ?', ordre: '🔢 Remets dans l’ordre', paires: '🔗 Associe', mot: '🔤 Mot mélangé',
}
const XP_BONNE_REPONSE = 3
const XP_PAR_TYPE = { qcm: 3, trou: 3, tri: 3, mot: 4, ordre: 5, paires: 5 }
const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]] } return t }
const vibrer = (ok) => { try { navigator.vibrate?.(ok ? 12 : [30, 40, 30]) } catch { /* pas de vibreur */ } }

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

// Les jeux rendent leur verdict par `fini(ok)` : une seule fois par carte.
function Feedback({ ok, children }) {
  return <p role="status" className="text-sm"><strong>{ok ? 'Bien joué ! ' : 'Pas tout à fait. '}</strong>{children}</p>
}

function Trou({ c, fini }) {
  const [choisi, setChoisi] = useState(null)
  // Le même mot peut manquer à deux endroits de la phrase : chaque trou se remplit à la fois.
  const morceaux = c.texte.split('____')
  const ok = choisi !== null && choisi === c.bonne
  return (
    <>
      <p className="scroll-texte">
        {morceaux.map((m, i) => (
          <Fragment key={i}>{m}{i < morceaux.length - 1 && <span className="scroll-trou" data-etat={choisi === null ? 'vide' : ok ? 'bon' : 'faux'}>{choisi === null ? '' : c.choix[choisi]}</span>}</Fragment>
        ))}
      </p>
      <div className="scroll-mots" role="group" aria-label="Mots proposés">
        {c.choix.map((m, i) => (
          <button key={i} type="button" disabled={choisi !== null} data-etat={choisi === null ? undefined : i === c.bonne ? 'bon' : i === choisi ? 'faux' : undefined} onClick={() => { setChoisi(i); fini(i === c.bonne) }}>{m}</button>
        ))}
      </div>
      {choisi !== null && <Feedback ok={ok}>{ok ? '' : <>Le mot manquant : <b>{c.choix[c.bonne]}</b>. </>}{c.explication && c.explication !== c.texte ? c.explication : ''}</Feedback>}
    </>
  )
}

function Tri({ c, fini }) {
  const [choisi, setChoisi] = useState(null)
  const ok = choisi === c.bonne
  return (
    <>
      <p className="text-sm opacity-80">{c.consigne}</p>
      <p className="scroll-flash" style={{ minHeight: '28%' }}><span>{c.texte}</span></p>
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Catégories">
        {c.categories.map((cat, i) => (
          <button key={cat.id} type="button" disabled={choisi !== null} className="scroll-tri" data-cote={i} data-etat={choisi === null ? undefined : cat.id === c.bonne ? 'bon' : cat.id === choisi ? 'faux' : undefined} onClick={() => { setChoisi(cat.id); fini(cat.id === c.bonne) }}>{cat.label}</button>
        ))}
      </div>
      {choisi !== null && <Feedback ok={ok}>{ok ? '' : <>C’était : <b>{c.categories.find((x) => x.id === c.bonne)?.label}</b>.</>}</Feedback>}
    </>
  )
}

function Ordre({ c, fini }) {
  const [reste, setReste] = useState(() => { const m = melange(c.etapes.map((texte, rang) => ({ texte, rang }))); return m.every((x, i) => x.rang === i) ? m.reverse() : m })
  const [pose, setPose] = useState([])
  const [erreurs, setErreurs] = useState(0)
  const [secoue, setSecoue] = useState(null)
  const fin = pose.length === c.etapes.length
  const choisir = (x) => {
    if (x.rang === pose.length) {
      const p = [...pose, x]
      setPose(p); setReste((r) => r.filter((y) => y !== x))
      if (p.length === c.etapes.length) fini(erreurs === 0)
    } else { setErreurs((e) => e + 1); setSecoue(x.rang); vibrer(false); setTimeout(() => setSecoue(null), 400) }
  }
  return (
    <>
      <p className="text-sm opacity-80">{c.consigne} <b>Touche dans l’ordre.</b></p>
      <ol className="scroll-ordre">{pose.map((x) => <li key={x.rang} data-etat="bon">{x.texte}</li>)}</ol>
      <div className="scroll-mots" role="group" aria-label="Étapes à placer">
        {reste.map((x) => <button key={x.rang} type="button" data-secoue={secoue === x.rang ? '1' : undefined} onClick={() => choisir(x)}>{x.texte}</button>)}
      </div>
      {fin && <Feedback ok={erreurs === 0}>{erreurs ? `${erreurs} erreur${erreurs > 1 ? 's' : ''} en route. ` : ''}{c.explication}</Feedback>}
    </>
  )
}

function Paires({ c, fini }) {
  const [droite] = useState(() => melange(c.paires.map((p, i) => ({ texte: p.d, i }))))
  const [gauche, setGauche] = useState(null)
  const [trouvees, setTrouvees] = useState([])
  const [erreurs, setErreurs] = useState(0)
  const [rate, setRate] = useState(null)
  const fin = trouvees.length === c.paires.length
  const choisirDroite = (d) => {
    if (gauche === null) return
    if (d.i === gauche) {
      const t = [...trouvees, gauche]
      setTrouvees(t); setGauche(null)
      if (t.length === c.paires.length) fini(erreurs <= 1)
    } else { setErreurs((e) => e + 1); setRate(d.i); vibrer(false); setTimeout(() => setRate(null), 400) }
  }
  return (
    <>
      <p className="text-sm opacity-80">Touche un terme, puis sa définition.</p>
      <div className="scroll-paires">
        <div>{c.paires.map((p, i) => <button key={i} type="button" disabled={trouvees.includes(i)} data-etat={trouvees.includes(i) ? 'bon' : gauche === i ? 'choisi' : undefined} onClick={() => setGauche(i)}>{p.g}</button>)}</div>
        <div>{droite.map((d) => <button key={d.i} type="button" disabled={trouvees.includes(d.i)} data-etat={trouvees.includes(d.i) ? 'bon' : undefined} data-secoue={rate === d.i ? '1' : undefined} onClick={() => choisirDroite(d)}>{d.texte}</button>)}</div>
      </div>
      {fin && <Feedback ok={erreurs <= 1}>{erreurs ? `${erreurs} erreur${erreurs > 1 ? 's' : ''}.` : 'Sans faute !'}</Feedback>}
    </>
  )
}

function Mot({ c, fini }) {
  const lettres = useMemo(() => {
    const base = c.mot.split('').map((l, i) => ({ l, i }))
    let m = melange(base)
    if (m.every((x, k) => x.i === k)) m = m.reverse()
    return m
  }, [c.mot])
  const [pose, setPose] = useState([])
  const [rate, setRate] = useState(false)
  const [revele, setRevele] = useState(false)
  const [erreur, setErreur] = useState(false)
  const mot = pose.map((x) => x.l).join('')
  const gagne = mot.toLowerCase() === c.mot.toLowerCase() && pose.length === c.mot.length
  const poser = (x) => {
    if (gagne || revele) return
    const p = [...pose, x]
    setPose(p)
    if (p.length === c.mot.length) {
      if (p.map((y) => y.l).join('').toLowerCase() === c.mot.toLowerCase()) fini(!erreur)
      else { setErreur(true); setRate(true); vibrer(false); setTimeout(() => { setPose([]); setRate(false) }, 600) }
    }
  }
  return (
    <>
      <p className="scroll-texte">{c.indice}</p>
      <div className="scroll-lettres" data-secoue={rate ? '1' : undefined} data-etat={gagne ? 'bon' : undefined} aria-label="Ta réponse" aria-live="polite">
        {revele ? c.mot.split('').map((l, k) => <span key={k}>{l}</span>) : c.mot.split('').map((_, k) => <span key={k}>{pose[k]?.l || ''}</span>)}
      </div>
      <div className="scroll-mots" role="group" aria-label="Lettres">
        {lettres.map((x) => <button key={x.i} type="button" disabled={pose.includes(x) || gagne || revele} onClick={() => poser(x)}>{x.l}</button>)}
      </div>
      {!gagne && !revele && <div className="flex gap-3"><button type="button" className="btn-ghost" onClick={() => setPose([])}>Effacer</button><button type="button" className="btn-ghost" onClick={() => { setRevele(true); fini(false) }}>Je sèche</button></div>}
      {(gagne || revele) && <Feedback ok={gagne && !revele}>{gagne ? '' : <>Le mot était <b>{c.mot}</b>.</>}</Feedback>}
    </>
  )
}

function Carte({ c, fini }) {
  const [retournee, setRetournee] = useState(false)
  const [choisi, setChoisi] = useState(null)
  return (
    <section className="scroll-carte" data-genre={c.type} aria-label={PUCES[c.type]}>
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
                onClick={() => { setChoisi(i); fini(i === c.bonne) }}
              >
                <CourseText text={ch} />
              </button>
            ))}
          </div>
          {choisi !== null && <Feedback ok={choisi === c.bonne}>{c.explication && <CourseText text={c.explication} />}</Feedback>}
        </>
      )}
      {c.type === 'trou' && <Trou c={c} fini={fini} />}
      {c.type === 'tri' && <Tri c={c} fini={fini} />}
      {c.type === 'ordre' && <Ordre c={c} fini={fini} />}
      {c.type === 'paires' && <Paires c={c} fini={fini} />}
      {c.type === 'mot' && <Mot c={c} fini={fini} />}
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
  const [jeu, setJeu] = useState({ bonnes: 0, essais: 0, serie: 0, meilleure: 0 })
  const liste = useRef(null)
  const faits = useRef(new Set())
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
  // Verdict d'un jeu : XP et série une seule fois par carte ; une bonne réponse fait passer à la carte suivante.
  const verdict = (i, type) => (ok) => {
    if (faits.current.has(i)) return
    faits.current.add(i)
    vibrer(ok)
    if (ok) addXp(XP_PAR_TYPE[type] || XP_BONNE_REPONSE)
    setJeu((j) => { const serie = ok ? j.serie + 1 : 0; return { bonnes: j.bonnes + (ok ? 1 : 0), essais: j.essais + 1, serie, meilleure: Math.max(j.meilleure, serie) } })
    if (ok) setTimeout(() => liste.current?.scrollBy({ top: liste.current.clientHeight, behavior: 'smooth' }), 1300)
  }
  const fermer = () => navigate('/scroll')
  return createPortal(
    <div className="scroll-flux" role="region" aria-label="Mode Scroll" lang="fr" data-no-translate>
      <div className="scroll-haut">
        <button type="button" onClick={fermer} aria-label="Fermer le mode scroll" className="grid h-10 w-10 place-items-center rounded-full text-xl">✕</button>
        <div className="scroll-barre" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index + 1} aria-label="Avancement"><span style={{ width: `${((index + 1) / total) * 100}%` }} /></div>
        {jeu.serie >= 2 && <span className="scroll-serie" aria-label={`Série de ${jeu.serie} bonnes réponses`}>🔥 ×{jeu.serie}</span>}
        <span className="text-xs tabular-nums">{index + 1} / {total}</span>
      </div>
      <div className="scroll-liste" ref={liste} onScroll={onScroll} tabIndex={0}>
        {cartes.map((c, i) => <Carte key={i} c={c} fini={verdict(i, c.type)} />)}
        <section className="scroll-carte items-center text-center" aria-label="Fin">
          <p className="text-5xl" aria-hidden>{jeu.essais && jeu.bonnes / jeu.essais >= 0.7 ? '🏆' : '🎉'}</p>
          <h2 className="font-display text-2xl font-semibold">Thème terminé</h2>
          <p className="text-sm"><CourseText text={theme.short || theme.name} /></p>
          {jeu.essais > 0 && <p className="scroll-texte">{jeu.bonnes} bonne{jeu.bonnes > 1 ? 's' : ''} réponse{jeu.bonnes > 1 ? 's' : ''} sur {jeu.essais} · meilleure série 🔥 ×{jeu.meilleure}</p>}
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
