// Dix façons de réviser une langue sans ouvrir un cours : défis, mises, scénarios de la vraie vie.
// Les questions viennent soit des QCM du manuel de la langue, soit de scénarios écrits pour ces modes
// (src/data/languesScenarios/<langue>.json). Tout est en français : l'interface est volontairement
// hors du système de traduction (data-no-translate), le contenu en langue étrangère aussi.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useStore } from '../store.jsx'
import {
  BANQUE_DEPART, BUDGET_SURVIE, DUREES, MISES, POINTS_PAR_BONNE_REPONSE, QUESTIONS_DEFI, SEUIL_MISE,
  creerCode, enregistrer, etatSemaine, itemsManuel, itemsScenario, lireCode, melanger, messageDefi,
  questionsPourMinutes, resoudreMise, titreDeLaSemaine, verdictEntretien, verdictSurvie,
} from '../data/languesModes.js'

const urlsManuel = {
  de: new URL('../../resources/langues/de.json', import.meta.url).href,
  en: new URL('../../resources/langues/en.json', import.meta.url).href,
  es: new URL('../../resources/langues/es.json', import.meta.url).href,
  it: new URL('../../resources/langues/it.json', import.meta.url).href,
  ar: new URL('../../resources/langues/ar.json', import.meta.url).href,
}
const scenarios = import.meta.glob('../data/languesScenarios/*.json')

const BRAVO = ['Propre.', 'Même ton prof serait surpris.', 'Tu as triché ? Non ? Respect.', 'Facile, hein.']
const AIE = ['Aïe.', 'Presque. Enfin non.', 'Le correcteur a soupiré.', 'Courage, personne ne regarde.']
const pioche = (liste, i) => liste[i % liste.length]

const MODES = [
  { id: 'pote', titre: 'Le test du pote', accroche: '5 questions, un code à envoyer. Ton pote essaie de te battre.', source: 'manuel' },
  { id: 'snap', titre: 'Réponds comme sur Snap', accroche: 'Un message arrive. Trois réponses, une seule ne te fait pas passer pour un idiot.', source: 'scenario', cle: 'snap' },
  { id: 'faux', titre: 'Le piège du faux ami', accroche: 'Des mots qui ressemblent au français et qui te trahissent.', source: 'scenario', cle: 'faux' },
  { id: 'serie', titre: 'Sous-titres de série', accroche: 'Une scène, une phrase à trous. Retrouve le mot qui manque.', source: 'scenario', cle: 'serie' },
  { id: 'minutes', titre: 'J’ai 3 minutes', accroche: 'Tu dis combien de temps tu as, le site choisit les questions.', source: 'manuel' },
  { id: 'survie', titre: 'Survie à l’étranger', accroche: 'Taxi, resto, vendeur de rue. Chaque erreur te coûte de l’argent.', source: 'scenario', cle: 'survie' },
  { id: 'mise', titre: 'Mise en jeu', accroche: 'Tu mises avant le quiz. Tu gagnes si tu assures, tu perds sinon.', source: 'manuel' },
  { id: 'classement', titre: 'Le classement sans pitié', accroche: 'Tes points de la semaine, et le titre qui va avec.', source: 'aucune' },
  { id: 'texto', titre: 'Traduis ce texto', accroche: 'Argot, abréviations et fautes : comprends ce que ton pote veut dire.', source: 'scenario', cle: 'texto' },
  { id: 'entretien', titre: 'Entretien vexant', accroche: 'Un recruteur te pose des questions gênantes. Ne perds pas ton stage.', source: 'scenario', cle: 'entretien' },
]

function useManuel(langue) {
  const [etat, setEtat] = useState({ langue: null, manuel: null, erreur: false })
  const [essai, setEssai] = useState(0)
  useEffect(() => {
    let actif = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    setEtat({ langue, manuel: null, erreur: false })
    fetch(urlsManuel[langue], { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error('manuel'); return r.json() })
      .then((manuel) => { if (actif) setEtat({ langue, manuel, erreur: false }) })
      .catch(() => { if (actif) setEtat({ langue, manuel: null, erreur: true }) })
      .finally(() => clearTimeout(timeout))
    return () => { actif = false; clearTimeout(timeout); controller.abort() }
  }, [langue, essai])
  return { manuel: etat.langue === langue ? etat.manuel : null, erreur: etat.langue === langue && etat.erreur, recharger: () => setEssai((n) => n + 1) }
}

function useScenarios(langue) {
  const [etat, setEtat] = useState({ langue: null, data: null })
  const chargeur = scenarios[`../data/languesScenarios/${langue}.json`]
  useEffect(() => {
    let actif = true
    if (!chargeur) { setEtat({ langue, data: null }); return undefined }
    chargeur().then((m) => { if (actif) setEtat({ langue, data: m.default }) }).catch(() => { if (actif) setEtat({ langue, data: null }) })
    return () => { actif = false }
  }, [langue, chargeur])
  return { data: etat.langue === langue ? etat.data : null, pret: etat.langue === langue, existe: !!chargeur }
}

// Une question à la fois : on touche une réponse, le verdict et l'explication arrivent tout de suite.
function Quiz({ items, onFin, resultat }) {
  const [i, setI] = useState(0)
  const [choix, setChoix] = useState(null)
  const [bonnes, setBonnes] = useState(0)
  const suivant = useRef(null)
  const envoye = useRef(false)
  const fini = i >= items.length
  const item = items[i]
  useEffect(() => { if (choix !== null) suivant.current?.focus() }, [choix])
  useEffect(() => {
    if (fini && !envoye.current) { envoye.current = true; onFin?.(bonnes, items.length) }
  }, [fini, bonnes, items.length, onFin])
  if (fini) return resultat(bonnes, items.length)
  const repondre = (k) => { if (choix !== null) return; setChoix(k); if (k === item.ok) setBonnes((b) => b + 1) }
  const avancer = () => { setChoix(null); setI((n) => n + 1) }
  const juste = choix === item.ok
  return (
    <div lang="fr" data-no-translate className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Question {i + 1} sur {items.length}</p>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700" aria-hidden><div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${(i / items.length) * 100}%` }} /></div>
      {item.intro && <p className="text-sm text-slate-600 dark:text-slate-300">{item.intro}</p>}
      <p className="font-display text-xl leading-snug" dir="auto" translate="no">{item.prompt}</p>
      <div role="group" aria-label="Réponses" className="grid gap-2">
        {item.options.map((o, k) => {
          const bonne = choix !== null && k === item.ok
          const mauvaise = choix === k && k !== item.ok
          return (
            <button key={`${i}-${k}`} type="button" disabled={choix !== null} onClick={() => repondre(k)} dir="auto" translate="no"
              className={`border px-3 py-2.5 text-left ${bonne ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : mauvaise ? 'border-rose-600 bg-rose-50 dark:bg-rose-900/30' : 'border-slate-300 bg-white hover:border-slate-500 dark:border-slate-600 dark:bg-slate-900'}`}
              style={{ borderRadius: 6 }}>
              {o}{bonne ? ' ✓' : mauvaise ? ' ✗' : ''}
            </button>
          )
        })}
      </div>
      {choix !== null && (
        <div lang="fr" data-no-translate className="space-y-2 bg-slate-100 p-3 text-sm dark:bg-slate-800" style={{ borderRadius: 6 }} aria-live="polite">
          <p className="font-semibold">{juste ? pioche(BRAVO, i) : pioche(AIE, i)}</p>
          {item.why && <p>{item.why}</p>}
          <button ref={suivant} type="button" className="btn-primary" onClick={avancer}>{i + 1 >= items.length ? 'Voir mon résultat' : 'Suivant'}</button>
        </div>
      )}
    </div>
  )
}

// Parcours où chaque réponse a un coût (survie) ou une note (entretien).
function Parcours({ etapes, valeur, onFin, resultat, depart = 0 }) {
  const [i, setI] = useState(0)
  const [total, setTotal] = useState(depart)
  const [choix, setChoix] = useState(null)
  const suivant = useRef(null)
  const envoye = useRef(false)
  const fini = i >= etapes.length
  const etape = etapes[i]
  const options = useMemo(() => (etape ? melanger(etape.options) : []), [etape])
  // La meilleure réponse : la moins chère (survie) ou celle qui rapporte le plus de points (entretien).
  const meilleure = useMemo(() => (etape ? [...etape.options].sort((a, b) => (a.cout !== undefined ? a.cout - b.cout : b.pts - a.pts))[0] : null), [etape])
  useEffect(() => { if (choix !== null) suivant.current?.focus() }, [choix])
  useEffect(() => { if (fini && !envoye.current) { envoye.current = true; onFin?.(total) } }, [fini, total, onFin])
  if (fini) return resultat(total)
  const choisir = (o) => { if (choix) return; setChoix(o); setTotal((t) => valeur(t, o)) }
  return (
    <div lang="fr" data-no-translate className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Étape {i + 1} sur {etapes.length}</p>
      {etape.scene && <p className="text-sm text-slate-600 dark:text-slate-300">{etape.scene}</p>}
      <p className="font-display text-xl leading-snug" dir="auto" translate="no">{etape.prompt}</p>
      <div role="group" aria-label="Réponses" className="grid gap-2">
        {options.map((o) => (
          <button key={o.t} type="button" disabled={!!choix} onClick={() => choisir(o)} dir="auto" translate="no"
            className={`border px-3 py-2.5 text-left ${choix === o ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800' : 'border-slate-300 bg-white hover:border-slate-500 dark:border-slate-600 dark:bg-slate-900'}`} style={{ borderRadius: 6 }}>
            {o.t}{choix && o === meilleure && <span aria-label="meilleur choix"> ✓</span>}
          </button>
        ))}
      </div>
      {choix && (
        <div lang="fr" data-no-translate className="space-y-2 bg-slate-100 p-3 text-sm dark:bg-slate-800" style={{ borderRadius: 6 }} aria-live="polite">
          <p className="font-semibold">{choix.cout !== undefined ? (choix.cout === 0 ? 'Ça ne te coûte rien.' : `Ça te coûte ${choix.cout} €.`) : `${choix.pts} point${choix.pts > 1 ? 's' : ''} sur 3.`}</p>
          <p>{choix.w}</p>
          {choix !== meilleure && <p><b>Le meilleur choix était :</b> <span dir="auto" translate="no">{meilleure.t}</span> ✓</p>}
          <button ref={suivant} type="button" className="btn-primary" onClick={() => { setChoix(null); setI((n) => n + 1) }}>{i + 1 >= etapes.length ? 'Voir mon résultat' : 'Suivant'}</button>
        </div>
      )}
    </div>
  )
}

function Rejouer({ onClick, children = 'Rejouer' }) {
  return <button type="button" className="btn-ghost" onClick={onClick}>{children}</button>
}

function ScoreFinal({ bonnes, total, rejouer, children }) {
  return (
    <div lang="fr" data-no-translate className="space-y-3" aria-live="polite">
      <p className="font-display text-3xl">{bonnes} sur {total}</p>
      <p>{bonnes === total ? 'Sans faute. Ça fait peur.' : bonnes >= total / 2 ? 'Pas mal. Tu peux mieux, mais personne ne t’en veut.' : 'Il y a de la marge. Tu peux recommencer, la honte reste ici.'}</p>
      {children}
      <Rejouer onClick={rejouer} />
    </div>
  )
}

function ModePote({ langue, manuel, defi, onFin }) {
  const { pathname } = useLocation()
  const [code, setCode] = useState(defi?.langue === langue ? defi.code : null)
  const [ami, setAmi] = useState(defi?.langue === langue ? defi.score : null)
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState('')
  const [copie, setCopie] = useState(false)
  const [partie, setPartie] = useState(0)
  const items = useMemo(() => (code ? itemsManuel(manuel, QUESTIONS_DEFI, lireCode(code).seed) : []), [code, manuel, partie])
  if (!code) {
    const rejoindre = () => {
      const lu = lireCode(saisie)
      if (!lu) return setErreur('Ce code ne ressemble à rien. Colle-le tel que ton pote l’a écrit.')
      if (lu.langue !== langue) return setErreur('Ce code est pour une autre langue. Change de langue en haut de la page.')
      setErreur(''); setCode(lu.code); setAmi(lu.score)
    }
    return (
      <div lang="fr" data-no-translate className="space-y-4">
        <p>Tu lances un défi : 5 questions, toujours les mêmes pour ton pote et pour toi. Personne ne triche, tout se joue au score.</p>
        <button type="button" className="btn-primary" onClick={() => { setCode(creerCode(langue)); setAmi(null) }}>Lancer un défi</button>
        <div lang="fr" data-no-translate className="space-y-2">
          <label htmlFor="code-pote" className="block text-sm font-semibold">Ton pote t’a envoyé un code ?</label>
          <div className="flex flex-wrap gap-2">
            <input id="code-pote" value={saisie} onChange={(ev) => setSaisie(ev.target.value)} autoComplete="off" spellCheck={false} placeholder={`${langue}-1abc2d.4`} className="min-w-0 flex-1 border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" style={{ borderRadius: 6 }} />
            <button type="button" className="btn-ghost" onClick={rejoindre} disabled={!saisie.trim()}>Relever le défi</button>
          </div>
          {erreur && <p role="alert" className="text-sm text-rose-700 dark:text-rose-400">{erreur}</p>}
        </div>
      </div>
    )
  }
  const base = typeof window === 'undefined' ? '' : window.location.href.split('#')[0]
  return (
    <Quiz key={`${code}-${partie}`} items={items} onFin={(b) => onFin(b, QUESTIONS_DEFI)} resultat={(bonnes, total) => {
      const lien = `${base}#${pathname}?defi=${code}.${bonnes}`
      const texte = messageDefi(code, bonnes)
      return (
        <ScoreFinal lang="fr" data-no-translate bonnes={bonnes} total={total} rejouer={() => { setPartie((p) => p + 1); setAmi(null) }}>
          {ami !== null && <p className="font-semibold">{bonnes > ami ? `Ton pote avait ${ami}. Tu le bats, il va devoir se justifier.` : bonnes === ami ? `Égalité à ${ami}. Personne ne gagne, tout le monde s’en veut.` : `Ton pote avait ${ami}. Tu perds, mais c’était un beau combat.`}</p>}
          <div lang="fr" data-no-translate className="space-y-2 bg-slate-100 p-3 text-sm dark:bg-slate-800" style={{ borderRadius: 6 }}>
            <p className="font-semibold">Envoie ça à ton pote :</p>
            <p className="break-all" translate="no">{texte}</p>
            <p className="break-all" translate="no">{lien}</p>
            <button type="button" className="btn-ghost" onClick={() => { navigator.clipboard?.writeText(`${texte}\n${lien}`).then(() => setCopie(true)).catch(() => setCopie(false)) }}>{copie ? 'Copié' : 'Copier le message'}</button>
          </div>
        </ScoreFinal>
      )
    }} />
  )
}

function ModeScenario({ cle, liste, onFin }) {
  const [partie, setPartie] = useState(0)
  const items = useMemo(() => itemsScenario(liste, 6, Math.floor(Math.random() * 2 ** 30)), [liste, partie])
  return <Quiz key={partie} items={items} onFin={onFin} resultat={(b, t) => <ScoreFinal lang="fr" data-no-translate bonnes={b} total={t} rejouer={() => setPartie((p) => p + 1)} />} />
}

function ModeMinutes({ langue, manuel, donnees, onFin }) {
  const [minutes, setMinutes] = useState(null)
  const [partie, setPartie] = useState(0)
  const items = useMemo(() => {
    if (!minutes) return []
    const n = questionsPourMinutes(minutes)
    const seed = Math.floor(Math.random() * 2 ** 30)
    const ecrits = donnees ? ['snap', 'faux', 'serie', 'texto'].flatMap((k) => itemsScenario(donnees[k], 3, seed)) : []
    const r = melanger([...itemsManuel(manuel, n, seed), ...ecrits])
    return r.slice(0, n)
  }, [minutes, manuel, donnees, partie])
  if (!minutes) {
    const surprise = () => setMinutes(DUREES[Math.floor(Math.random() * DUREES.length)].minutes)
    return (
      <div lang="fr" data-no-translate className="space-y-3">
        <p>Dis combien de temps tu as, on choisit les questions. Tu n’as rien à décider.</p>
        <div className="flex flex-wrap gap-2">
          {DUREES.map((d) => <button key={d.minutes} type="button" className="btn-primary" onClick={() => setMinutes(d.minutes)}>{d.minutes} minute{d.minutes > 1 ? 's' : ''} · {d.questions} questions</button>)}
          <button type="button" className="btn-ghost" onClick={surprise}>Surprends-moi</button>
        </div>
      </div>
    )
  }
  return <Quiz key={`${minutes}-${partie}`} items={items} onFin={onFin} resultat={(b, t) => <ScoreFinal lang="fr" data-no-translate bonnes={b} total={t} rejouer={() => setPartie((p) => p + 1)}><button type="button" className="btn-ghost" onClick={() => setMinutes(null)}>Changer la durée</button></ScoreFinal>} />
}

function ModeMise({ manuel, banque, onFin }) {
  const [mise, setMise] = useState(null)
  const [partie, setPartie] = useState(0)
  const [issue, setIssue] = useState(null)
  const items = useMemo(() => itemsManuel(manuel, QUESTIONS_DEFI, Math.floor(Math.random() * 2 ** 30)), [manuel, partie])
  const misesPossibles = MISES.filter((m) => m <= banque)
  if (!mise) {
    return (
      <div lang="fr" data-no-translate className="space-y-3">
        <p>Ta banque : <b>{banque} points</b> (ils ne comptent que dans ce mode). Tu mises, puis 5 questions. Avec {SEUIL_MISE} bonnes réponses ou plus, tu gagnes ta mise. Sinon, tu la perds.</p>
        <div className="flex flex-wrap gap-2">
          {misesPossibles.map((m) => <button key={m} type="button" className="btn-primary" onClick={() => { setIssue(null); setMise(m) }}>Miser {m}</button>)}
        </div>
      </div>
    )
  }
  return (
    <Quiz key={`${mise}-${partie}`} items={items} onFin={(b, t) => { const r = resoudreMise(banque, mise, b); setIssue(r); onFin(b, t, { banque: r.banque }) }}
      resultat={(bonnes, total) => (
        <ScoreFinal lang="fr" data-no-translate bonnes={bonnes} total={total} rejouer={() => { setMise(null); setPartie((p) => p + 1) }}>
          {issue && <p className="font-semibold">{issue.gagne ? `Tu gagnes ${mise} points. Ta banque passe à ${issue.banque}.` : `Tu perds ${mise} points. Ta banque passe à ${issue.banque}.`}{issue.refinance ? ' Le casino te refait un petit crédit, par pitié.' : ''}</p>}
        </ScoreFinal>
      )} />
  )
}

function ModeClassement({ semaine }) {
  const t = titreDeLaSemaine(semaine.points)
  return (
    <div lang="fr" data-no-translate className="space-y-3">
      <p className="font-display text-3xl">{semaine.points} points cette semaine</p>
      <p className="text-lg"><b>{t.titre}</b></p>
      <p className="text-slate-600 dark:text-slate-300">{t.blague}</p>
      <p className="text-sm">Chaque bonne réponse dans les autres modes te rapporte {POINTS_PAR_BONNE_REPONSE} points. Le compteur repart à zéro chaque lundi et reste sur cet appareil. Pour te comparer à ta classe, le classement officiel est <Link to="/classement" className="underline">ici</Link>.</p>
    </div>
  )
}

function ModeSurvie({ donnees, onFin }) {
  const [partie, setPartie] = useState(0)
  const s = donnees.survie
  return (
    <div lang="fr" data-no-translate className="space-y-3">
      <p className="font-semibold">{s.titre}</p>
      <p className="text-sm">Tu pars avec {BUDGET_SURVIE} €. Tout ce qui reste à la fin est à toi.</p>
      <Parcours key={partie} etapes={s.etapes} depart={s.budget} valeur={(t, o) => t - o.cout} onFin={(reste) => onFin(Math.max(0, Math.round(reste / 10)), 10)}
        resultat={(reste) => { const v = verdictSurvie(reste); return <div lang="fr" data-no-translate className="space-y-3" aria-live="polite"><p className="font-display text-3xl">{reste >= 0 ? `Il te reste ${reste} €` : `Tu es à découvert de ${-reste} €`}</p><p><b>{v.titre}</b></p><p>{v.texte}</p><Rejouer onClick={() => setPartie((p) => p + 1)} /></div> }} />
    </div>
  )
}

function ModeEntretien({ donnees, onFin }) {
  const [partie, setPartie] = useState(0)
  const e = donnees.entretien
  const max = e.questions.length * 3
  return (
    <div lang="fr" data-no-translate className="space-y-3">
      <p className="font-semibold">{e.poste}</p>
      <Parcours key={partie} etapes={e.questions.map((q) => ({ ...q, scene: null }))} depart={0} valeur={(t, o) => t + o.pts} onFin={(total) => onFin(Math.round((total / max) * 6), 6)}
        resultat={(total) => { const v = verdictEntretien(total, max); return <div lang="fr" data-no-translate className="space-y-3" aria-live="polite"><p className="font-display text-3xl">{total} sur {max}</p><p><b>{v.titre}</b></p><p>{v.texte}</p><Rejouer onClick={() => setPartie((p) => p + 1)} /></div> }} />
    </div>
  )
}

export default function LanguesModes({ langue, nomLangue, defiTexte = '' }) {
  const defi = useMemo(() => lireCode(defiTexte), [defiTexte])
  const { addXp } = useStore()
  const { manuel, erreur, recharger } = useManuel(langue)
  const sc = useScenarios(langue)
  const [mode, setMode] = useState(defi?.langue === langue ? 'pote' : null)
  const [semaine, setSemaine] = useState(() => etatSemaine())
  useEffect(() => { setMode(defi?.langue === langue ? 'pote' : null) }, [langue, defi])
  const finir = useCallback((bonnes, total, extra = {}) => {
    addXp((bonnes || 0) * 2)
    setSemaine(enregistrer({ points: (bonnes || 0) * POINTS_PAR_BONNE_REPONSE, ...extra }))
  }, [addXp])
  const actif = MODES.find((m) => m.id === mode)
  const dispo = (m) => (m.source === 'scenario' ? !!sc.data?.[m.cle] : m.source === 'manuel' ? !!manuel : true)
  // Titre honnête : en arabe, les scénarios écrits à la main n'existent pas encore, donc on annonce les modes vraiment prêts.
  const nbPrets = MODES.filter(dispo).length
  const titreModes = !sc.pret || !manuel ? `Des modes pour ${nomLangue}.` : nbPrets === MODES.length ? `Dix modes pour ${nomLangue}.` : `${nbPrets} modes prêts pour ${nomLangue}, les autres arrivent.`
  const rendu = () => {
    if (!actif) return null
    if (actif.source === 'manuel' && !manuel) return erreur ? <p lang="fr" data-no-translate role="alert">Le manuel de {nomLangue} n’a pas pu se charger. <button type="button" className="underline" onClick={recharger}>Réessayer</button></p> : <p lang="fr" data-no-translate aria-busy="true">Chargement…</p>
    if (actif.source === 'scenario' && !sc.data?.[actif.cle]) return <p lang="fr" data-no-translate>Ce mode n’existe pas encore en {nomLangue} : il faut des phrases écrites et relues par quelqu’un qui parle la langue.</p>
    switch (actif.id) {
      case 'pote': return <ModePote key={defiTexte} langue={langue} manuel={manuel} defi={defi} onFin={finir} />
      case 'snap': case 'faux': case 'serie': case 'texto': return <ModeScenario cle={actif.cle} liste={sc.data[actif.cle]} onFin={finir} />
      case 'minutes': return <ModeMinutes langue={langue} manuel={manuel} donnees={sc.data} onFin={finir} />
      case 'mise': return <ModeMise manuel={manuel} banque={semaine.banque ?? BANQUE_DEPART} onFin={finir} />
      case 'classement': return <ModeClassement semaine={semaine} />
      case 'survie': return <ModeSurvie donnees={sc.data} onFin={finir} />
      case 'entretien': return <ModeEntretien donnees={sc.data} onFin={finir} />
      default: return null
    }
  }
  return (
    <section aria-labelledby="langues-modes" className="space-y-4" lang="fr" data-no-translate>
      <div>
        <p className="kicker">Réviser sans en avoir l’air</p>
        <h2 id="langues-modes" className="font-display text-2xl">{titreModes}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Aucun cours à lire. Tu touches, tu réponds, tu te fais corriger. Chaque bonne réponse te rapporte des points.</p>
      </div>
      {!actif ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODES.map((m, k) => {
            const ok = dispo(m)
            const attente = m.source === 'scenario' && !sc.pret
            return (
              <li key={m.id}>
                <button type="button" onClick={() => setMode(m.id)} disabled={!ok && !attente && m.source === 'scenario'}
                  className="card flex h-full w-full flex-col gap-1 p-4 text-left disabled:opacity-60">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mode {k + 1}</span>
                  <span className="font-display text-lg font-semibold">{m.titre}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{m.accroche}</span>
                  {!ok && !attente && m.source === 'scenario' && <span className="text-xs font-semibold">Pas encore dans cette langue</span>}
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="card space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-semibold">{actif.titre}</h3>
            <button type="button" className="btn-ghost" onClick={() => setMode(null)}>Tous les modes</button>
          </div>
          {rendu()}
        </div>
      )}
    </section>
  )
}
