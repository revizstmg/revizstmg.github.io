import { useEffect, useRef, useState } from 'react'
import { shuffle } from '../games/common.jsx'
import { useT } from '../i18n.js'

// Pile de flashcards, commune aux exercices d'un chapitre et aux paquets
// enregistrés dans « Réviser ». On touche la carte pour la retourner, puis on
// la glisse : à DROITE « Je savais », à GAUCHE « À revoir ». Les boutons et les
// flèches du clavier font la même chose, avec la même animation : la carte
// s'envole avec un tampon, la suivante monte à sa place.

const SEUIL = 90 // px glissés pour valider la carte
const VITESSE = 0.5 // px/ms : un geste vif valide même sur une courte distance
const SORTIE = 320 // ms : durée de l'envol

const moinsDeMouvement = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
}
const vibrer = (motif) => {
  try { navigator.vibrate?.(motif) } catch { /* pas de vibreur */ }
}

// Déroulé d'une série : file des cartes, cartes ratées à revoir, cartes sues.
// phase : 'etude' → 'finSerie' (il reste des cartes à revoir) ou 'fini'.
export function useSerieCartes(cartes) {
  const [file, setFile] = useState(() => shuffle(cartes))
  const [i, setI] = useState(0)
  const [tour, setTour] = useState(0) // change à chaque nouvelle série
  const [aRevoir, setARevoir] = useState([])
  const [sues, setSues] = useState(() => new Set())
  const [phase, setPhase] = useState('etude')
  const carte = file[i]

  const noter = (ok) => {
    const reste = ok ? aRevoir : [...aRevoir, carte]
    if (ok) setSues((s) => new Set(s).add(carte.front))
    setARevoir(reste)
    if (i + 1 < file.length) setI(i + 1)
    else setPhase(reste.length ? 'finSerie' : 'fini')
  }
  const nouvelleSerie = (liste) => { setFile(shuffle(liste)); setI(0); setARevoir([]); setTour((n) => n + 1); setPhase('etude') }
  const revoirRatees = () => nouvelleSerie(aRevoir)
  const recommencer = () => { setSues(new Set()); nouvelleSerie(cartes) }

  return {
    carte, suivante: file[i + 1], apres: file[i + 2], i, longueur: file.length,
    cle: `${tour}-${i}`, premiere: tour === 0 && i === 0,
    aRevoir, sues, phase, noter, revoirRatees, recommencer,
  }
}

// `grand` : version plein écran (textes plus grands).
export function PileCartes({ serie, color = '#7c3aed', hauteur = 'h-[18rem]', grand = false }) {
  const t = useT()
  const { carte, suivante, apres, cle, noter } = serie
  const [retournee, setRetournee] = useState(false)
  const [glisse, setGlisse] = useState({ x: 0, y: 0, actif: false })
  const [sortie, setSortie] = useState(null) // 'gauche' | 'droite'
  const [parBouton, setParBouton] = useState(false) // envol déclenché sans glisser
  const geste = useRef({ x0: 0, y0: 0, dx: 0, dy: 0, px: 0, pt: 0, vx: 0, bouge: false })
  const minuteur = useRef(null)
  useEffect(() => () => clearTimeout(minuteur.current), [])

  const sortir = (sens, bouton = false) => {
    if (sortie || !carte) return
    const ok = sens === 'droite'
    vibrer(ok ? 12 : [8, 45, 8])
    setParBouton(bouton)
    setSortie(sens)
    minuteur.current = setTimeout(() => {
      // Tout change dans le même rendu : la carte suivante arrive face question.
      setRetournee(false); setSortie(null); setGlisse({ x: 0, y: 0, actif: false })
      noter(ok)
    }, moinsDeMouvement() ? 0 : SORTIE)
  }

  // Clavier : Espace / Entrée = retourner ; ← = à revoir ; → = je savais.
  useEffect(() => {
    const touche = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!sortie) setRetournee((r) => !r) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); sortir('gauche', true) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); sortir('droite', true) }
    }
    window.addEventListener('keydown', touche)
    return () => window.removeEventListener('keydown', touche)
  })

  const appui = (e) => {
    if (sortie) return
    const g = geste.current
    Object.assign(g, { x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, px: e.clientX, pt: e.timeStamp, vx: 0, bouge: false })
    setGlisse({ x: 0, y: 0, actif: true })
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* */ }
  }
  const deplacement = (e) => {
    if (!glisse.actif || sortie) return
    const g = geste.current
    g.dx = e.clientX - g.x0; g.dy = e.clientY - g.y0
    if (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6) g.bouge = true
    const dt = e.timeStamp - g.pt
    if (dt > 0) g.vx = 0.7 * ((e.clientX - g.px) / dt) + 0.3 * g.vx
    g.px = e.clientX; g.pt = e.timeStamp
    setGlisse({ x: g.dx, y: g.dy, actif: true })
  }
  const relache = () => {
    if (!glisse.actif || sortie) return
    const { dx, vx, bouge } = geste.current
    if (dx >= SEUIL || (vx > VITESSE && dx > 30)) return sortir('droite')
    if (dx <= -SEUIL || (vx < -VITESSE && dx < -30)) return sortir('gauche')
    if (!bouge) setRetournee((r) => !r) // simple touche = retourner
    setGlisse({ x: 0, y: 0, actif: false })
  }
  // Le navigateur reprend la main (défilement vertical d'une longue réponse).
  const annule = () => setGlisse({ x: 0, y: 0, actif: false })

  if (!carte) return null

  // Position de la carte du dessus.
  const largeur = typeof window === 'undefined' ? 400 : window.innerWidth
  let transform, transition
  if (sortie) {
    const s = sortie === 'droite' ? 1 : -1
    transform = `translate3d(${s * (largeur + 160)}px, ${glisse.y * 0.5 + 40}px, 0) rotate(${s * 24}deg)`
    // Lancée au doigt : la carte garde son élan. Par bouton : elle prend de la vitesse.
    const courbe = parBouton ? 'cubic-bezier(.5, .05, .75, .45)' : 'cubic-bezier(.15, .6, .35, 1)'
    transition = `transform ${SORTIE}ms ${courbe}, opacity ${SORTIE}ms ease-in`
  } else if (glisse.actif) {
    transform = `translate3d(${glisse.x}px, ${glisse.y * 0.2}px, 0) rotate(${glisse.x * 0.06}deg)`
    transition = 'none'
  } else {
    transform = 'translate3d(0, 0, 0)'
    transition = 'transform 450ms cubic-bezier(.2, 1.45, .4, 1)' // retour élastique
  }
  // Avancement du geste (0 → 1) : teinte, tampons, carte suivante qui monte.
  const avance = sortie ? 1 : Math.min(1, Math.abs(glisse.x) / SEUIL)
  const versDroite = sortie ? sortie === 'droite' : glisse.x > 0
  const teinte = versDroite ? '#10b981' : '#f43f5e'
  const suiviDirect = glisse.actif && !sortie

  const recto = (c) => (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white p-6 text-center shadow-xl [backface-visibility:hidden] dark:border-slate-700 dark:bg-slate-800">
      <span className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-slate-400">{t('question')}</span>
      <span className={`font-display font-semibold leading-snug ${grand ? 'text-[1.75rem]' : 'text-2xl'}`}>{c.front}</span>
      <span className="mt-5 text-xs text-slate-400">{t('tapToFlip')}</span>
    </div>
  )

  return (
    <div className="select-none">
      {/* Compteurs, du côté de leur geste : à revoir à gauche, sues à droite */}
      <div className="mb-3 flex items-center justify-between text-sm font-bold tabular-nums">
        <span className="chip bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300"><span key={serie.aRevoir.length} className="pop-badge">↩ {serie.aRevoir.length}</span></span>
        <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><span key={serie.sues.size} className="pop-badge">✓ {serie.sues.size}</span></span>
      </div>

      <div className={`relative ${hauteur}`}>
        {/* Troisième carte : simple épaisseur de la pile */}
        {apres && <div aria-hidden className="absolute inset-0 translate-y-6 scale-[0.88] rounded-[1.75rem] border border-slate-200 bg-white opacity-60 dark:border-slate-700 dark:bg-slate-800" />}

        {/* Carte suivante : elle monte à mesure que la carte du dessus s'en va */}
        {suivante && (
          <div
            key={`s-${cle}`}
            aria-hidden
            className="pile-entree absolute inset-0"
            style={{
              transform: `translate3d(0, ${12 * (1 - avance)}px, 0) scale(${0.94 + 0.06 * avance})`,
              transition: suiviDirect ? 'none' : `transform ${SORTIE}ms cubic-bezier(.2, .8, .2, 1)`,
            }}
          >
            {recto(suivante)}
          </div>
        )}

        {/* Carte du dessus */}
        <div
          key={`c-${cle}`}
          onPointerDown={appui} onPointerMove={deplacement} onPointerUp={relache} onPointerCancel={annule}
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          style={{ transform, transition, opacity: sortie ? 0.35 : 1, willChange: 'transform' }}
          role="button"
          tabIndex={0}
          aria-label={t('flipCard')}
        >
          <div className="h-full [perspective:1400px]">
            <div
              className="relative h-full [transform-style:preserve-3d]"
              style={{ transform: retournee ? 'rotateY(180deg)' : 'none', transition: moinsDeMouvement() ? 'none' : 'transform 480ms cubic-bezier(.2, .8, .2, 1)' }}
            >
              {recto(carte)}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-[1.75rem] border-2 bg-white p-6 text-center shadow-xl [backface-visibility:hidden] dark:bg-slate-800"
                style={{ transform: 'rotateY(180deg)', borderColor: color, backgroundImage: `linear-gradient(${color}14, ${color}14)` }}
              >
                <span className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.22em]" style={{ color }}>{t('answer')}</span>
                <span className={`font-medium leading-relaxed ${carte.back && carte.back.length > 90 ? 'text-base' : grand ? 'text-2xl' : 'text-lg'}`}>{carte.back}</span>
              </div>
            </div>
          </div>

          {/* Liseré de couleur pendant le geste */}
          <div className="pointer-events-none absolute inset-0 rounded-[1.75rem]" style={{ boxShadow: `inset 0 0 0 3px ${teinte}`, opacity: avance }} />
          {/* Tampons */}
          {(sortie === 'droite' || (!sortie && glisse.x > 0)) && (
            <div className={`pointer-events-none absolute left-5 top-5 -rotate-12 rounded-xl border-[3px] border-emerald-500 bg-white/80 px-3 py-1 font-display text-xl font-black text-emerald-500 dark:bg-slate-900/80 ${parBouton ? 'tampon-pop' : ''}`} style={{ opacity: avance }}>
              ✓ {t('iKnew')}
            </div>
          )}
          {(sortie === 'gauche' || (!sortie && glisse.x < 0)) && (
            <div className={`pointer-events-none absolute right-5 top-5 rotate-12 rounded-xl border-[3px] border-rose-500 bg-white/80 px-3 py-1 font-display text-xl font-black text-rose-500 dark:bg-slate-900/80 ${parBouton ? 'tampon-pop' : ''}`} style={{ opacity: avance }}>
              ↩ {t('toReview')}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => sortir('gauche', true)} className="btn bg-rose-100 py-3.5 font-bold text-rose-700 transition active:scale-95 hover:bg-rose-200 dark:bg-rose-950/50 dark:text-rose-300">↩ {t('toReview')}</button>
        <button onClick={() => sortir('droite', true)} className="btn bg-emerald-100 py-3.5 font-bold text-emerald-700 transition active:scale-95 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300">✓ {t('iKnew')}</button>
      </div>
      {serie.premiere && <p className="mt-3 text-center text-xs text-slate-400">{t('swipeHint')}</p>}
    </div>
  )
}
