// « Mon parcours » : des objectifs, un test de positionnement, puis un plan semaine par semaine
// qui se recalcule à chaque résultat (voir data/parcours.js). Calcul local : ni IA, ni coût.
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { todayKey } from '../data/srs.js'
import Qcm from '../games/Qcm.jsx'
import {
  NOTE_MIN, NOTE_MAX, HEURES, OBJECTIFS_DEFAUT, QUESTIONS_POSITIONNEMENT,
  construirePlan, themesDuParcours, matieresDuParcours, composerPositionnement, resultatPositionnement,
  objectifsValides, lundiDe, avancementSemaine,
} from '../data/parcours.js'

const dateCourte = (jour, lang) => new Date(`${jour}T12:00:00`).toLocaleDateString(lang, { day: 'numeric', month: 'short' })
const heures = (min) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? String(min % 60).padStart(2, '0') : ''}` : `${min} min`)

export default function Parcours() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <ParcoursPage />
}

function ParcoursPage() {
  const { state, setParcours } = useStore()
  const today = todayKey()
  const parcours = state.parcours || {}
  const matieres = useMemo(() => matieresDuParcours(state.track), [state.track])
  const [test, setTest] = useState(null) // { subjectId, questions } pendant un test de positionnement
  const [edition, setEdition] = useState(false)
  const configure = objectifsValides(parcours.objectifs)

  if (test) {
    return (
      <Test
        test={test}
        matiere={matieres.find((m) => m.id === test.subjectId)}
        onFin={(res) => {
          setParcours((avant) => ({ ...avant, positionnement: { ...(avant.positionnement || {}), [test.subjectId]: resultatPositionnement(res, today) } }))
          setTest(null)
        }}
        onQuitter={() => setTest(null)}
      />
    )
  }
  if (!configure || edition) {
    return (
      <Questionnaire
        matieres={matieres}
        initial={{ ...OBJECTIFS_DEFAUT, ...(parcours.objectifs || {}) }}
        modification={configure}
        onValider={(objectifs) => { setParcours((avant) => ({ ...avant, objectifs })); setEdition(false) }}
        onAnnuler={configure ? () => setEdition(false) : null}
      />
    )
  }
  return <Plan matieres={matieres} onTest={(subjectId) => setTest({ subjectId, questions: composerPositionnement(subjectId) })} onModifier={() => setEdition(true)} />
}

// --- Étape 1 : objectifs -------------------------------------------------------------------------
function Questionnaire({ matieres, initial, modification, onValider, onAnnuler }) {
  const [note, setNote] = useState(initial.noteVisee)
  const [h, setH] = useState(initial.heuresSemaine)
  const [difficiles, setDifficiles] = useState(initial.difficiles || [])
  const bascule = (id) => setDifficiles((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  const notes = Array.from({ length: NOTE_MAX - NOTE_MIN + 1 }, (_, i) => NOTE_MIN + i)
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="page-hero page-hero-compact">
        <p className="kicker">🗺️ Mon parcours</p>
        <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight">{modification ? 'Modifier mes objectifs' : 'Construisons ton parcours'}</h1>
        <p className="mt-2 text-sm">Trois questions pour un plan à ta mesure. Tu pourras tout changer plus tard.</p>
      </header>
      <form className="card space-y-5 p-5" onSubmit={(e) => { e.preventDefault(); onValider({ noteVisee: Number(note), heuresSemaine: Number(h), difficiles }) }}>
        <div>
          <label htmlFor="parcours-note" className="block font-semibold">Quelle note vises-tu au bac ?</label>
          <select id="parcours-note" value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900">
            {notes.map((n) => <option key={n} value={n}>{`${n} sur 20`}</option>)}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Plus tu vises haut, plus le plan prévoit de révisions.</p>
        </div>
        <div>
          <label htmlFor="parcours-heures" className="block font-semibold">Combien d’heures peux-tu réviser chaque semaine ?</label>
          <select id="parcours-heures" value={h} onChange={(e) => setH(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-900">
            {HEURES.map((x) => <option key={x} value={x}>{`${x} h par semaine`}</option>)}
          </select>
        </div>
        <fieldset>
          <legend className="font-semibold">Quelles matières te posent le plus de difficultés ?</legend>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Elles auront plus de temps dans ton plan. Tu peux n’en choisir aucune.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {matieres.map((m) => (
              <label key={m.id} className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600">
                <input type="checkbox" checked={difficiles.includes(m.id)} onChange={() => bascule(m.id)} />
                <span>{m.nom}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn-primary">{modification ? 'Enregistrer' : 'Voir mon parcours'}</button>
          {onAnnuler && <button type="button" onClick={onAnnuler} className="btn-ghost">Annuler</button>}
        </div>
      </form>
    </div>
  )
}

// --- Étape 2 : test de positionnement ----------------------------------------------------------------
function Test({ test, matiere, onFin, onQuitter }) {
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-4">
      <header className="page-hero page-hero-compact">
        <p className="kicker">🧭 Test de positionnement</p>
        <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight">{matiere?.nom}</h1>
        <p className="mt-2 text-sm">Quelques questions pour mesurer où tu en es. Une erreur ici n’a aucune conséquence : elle sert à t’orienter.</p>
      </header>
      {test.questions.length >= 3
        ? <Qcm game={{ id: 'positionnement', type: 'qcm', questions: test.questions }} mode="train" color={matiere?.color} onDone={onFin} />
        : <p className="card p-5 text-sm">Pas assez de questions dans cette matière pour la positionner.</p>}
      <button type="button" onClick={onQuitter} className="lien-retour">← Quitter le test</button>
    </div>
  )
}

// --- Étape 3 : le plan ---------------------------------------------------------------------------------
function Plan({ matieres, onTest, onModifier }) {
  const { state, setParcours } = useStore()
  const today = todayKey()
  const lang = state.lang || 'fr'
  const parcours = state.parcours
  const themes = useMemo(() => themesDuParcours(state.track), [state.track])
  // Le plan dépend de tout ce que l'élève a fait : il se recalcule dès que sa progression change.
  const plan = useMemo(() => construirePlan({ state, track: state.track, today, themes }), [state.chapters, state.srs, state.bacDate, parcours, state.track, today, themes])
  const courante = plan.semaines[0]
  const lundi = lundiDe(today)

  // Base de la semaine : ce qui était prévu quand elle a commencé, pour mesurer ce qui est fait.
  useEffect(() => {
    if (parcours?.semaine?.debut !== lundi) setParcours((avant) => ({ ...avant, semaine: { debut: lundi, minutes: courante.minutes } }))
  }, [lundi, parcours?.semaine?.debut, courante.minutes, setParcours])

  const av = avancementSemaine(parcours, courante, today)
  const testes = matieres.filter((m) => parcours?.positionnement?.[m.id])
  const aTester = matieres.filter((m) => !parcours?.positionnement?.[m.id])
  const o = parcours.objectifs
  const nomMatiere = (id) => matieres.find((m) => m.id === id)?.nom || id

  return (
    <div className="animate-lux mx-auto max-w-3xl space-y-5">
      <header className="page-hero page-hero-compact">
        <p className="kicker">🗺️ Mon parcours</p>
        <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight">Ton plan, semaine par semaine</h1>
        <p className="mt-2 text-sm">{`Objectif ${o.noteVisee} sur 20 · ${o.heuresSemaine} h par semaine · première épreuve dans ${plan.jours} jours`}</p>
        <button type="button" onClick={onModifier} className="mt-3 underline">Modifier mes objectifs</button>
      </header>

      {!plan.faisable && (
        <section className="card border-amber-400 p-5" role="status" aria-labelledby="parcours-alerte">
          <h2 id="parcours-alerte" className="font-display text-lg font-semibold">Ton plan est trop chargé</h2>
          <p className="mt-1 text-sm">{`Il manque environ ${heures(plan.manque)} pour atteindre ton objectif avant les épreuves. Il faudrait réviser environ ${plan.heuresConseillees} h par semaine, ou viser une note un peu plus basse.`}</p>
          <button type="button" className="btn-primary mt-3" onClick={() => setParcours((avant) => ({ ...avant, objectifs: { ...avant.objectifs, heuresSemaine: plan.heuresConseillees } }))}>{`Passer à ${plan.heuresConseillees} h par semaine`}</button>
        </section>
      )}

      {aTester.length > 0 && (
        <section className="card space-y-3 p-5" aria-labelledby="parcours-test">
          <h2 id="parcours-test" className="font-display text-lg font-semibold">Affine ton plan avec un test de positionnement</h2>
          <p className="text-sm">{`${QUESTIONS_POSITIONNEMENT} questions par matière : le plan saura où tu en es vraiment. Tu peux commencer par la matière qui t’inquiète.`}</p>
          <ul className="flex flex-wrap gap-2">
            {aTester.map((m) => <li key={m.id}><button type="button" onClick={() => onTest(m.id)} className="btn-ghost">{m.nom}</button></li>)}
          </ul>
        </section>
      )}

      <section className="card space-y-3 p-5" aria-labelledby="parcours-semaine">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="parcours-semaine" className="font-display text-xl font-semibold">Cette semaine</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">{`${dateCourte(courante.debut, lang)} – ${dateCourte(courante.fin, lang)}`}</span>
        </div>
        <div role="progressbar" aria-label="Avancement de la semaine" aria-valuemin={0} aria-valuemax={100} aria-valuenow={av.pct} className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div className="h-full rounded-full" style={{ width: `${av.pct}%`, backgroundColor: 'var(--c-accent-fort)' }} />
        </div>
        <p className="text-sm">{`${heures(av.fait)} faites sur ${heures(av.prevu)} prévues`}</p>
        {courante.taches.length === 0
          ? <p className="text-sm">Rien de prévu cette semaine : profites-en pour souffler ou avancer sur ce que tu veux.</p>
          : <ul className="divide-y divide-slate-100 dark:divide-slate-800">{courante.taches.map((t) => <Tache key={t.id} t={t} />)}</ul>}
      </section>

      <section className="space-y-3" aria-labelledby="parcours-suite">
        <h2 id="parcours-suite" className="font-display text-xl font-semibold">Les semaines suivantes</h2>
        {plan.semaines.slice(1, 5).map((s) => <SemaineVue key={s.index} s={s} lang={lang} nomMatiere={nomMatiere} ouverte={s.index === 1} />)}
        {plan.semaines.length > 5 && (
          <PlusTard semaines={plan.semaines.slice(5)} lang={lang} nomMatiere={nomMatiere} />
        )}
      </section>

      {testes.length > 0 && (
        <section className="card space-y-2 p-5" aria-labelledby="parcours-niveau">
          <h2 id="parcours-niveau" className="font-display text-lg font-semibold">Ton niveau de départ</h2>
          <ul className="space-y-1 text-sm">
            {testes.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{`${m.nom} · ${parcours.positionnement[m.id].score} %`}</span>
                <button type="button" onClick={() => onTest(m.id)} className="underline">Refaire le test</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">Le plan se recalcule tout seul à chaque exercice : ce que tu maîtrises prend moins de place, ce qui résiste en prend plus. Les durées sont des estimations.</p>
      <Link to="/accueil" className="lien-retour">← Retour à l’accueil</Link>
    </div>
  )
}

function Tache({ t }) {
  const lien = t.chapitres ? `/subject/${t.subjectId}/theme/${t.themeId}/chapter/${t.chapitres.de - 1}` : `/subject/${t.subjectId}/theme/${t.themeId}`
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"><Genre kind={t.kind} /> · {t.subjectName}</span>
        <span className="block font-medium leading-snug">{t.themeName}</span>
        {t.chapitres && <span className="block text-xs text-slate-600 dark:text-slate-300">{t.chapitres.de === t.chapitres.a ? `Chapitre ${t.chapitres.de} sur ${t.chapitresTotal}` : `Chapitres ${t.chapitres.de} à ${t.chapitres.a} sur ${t.chapitresTotal}`}</span>}
        <span className="block text-xs text-slate-500 dark:text-slate-400"><Pourquoi p={t.pourquoi} /></span>
      </span>
      <span className="shrink-0 text-sm font-semibold">{heures(t.minutes)}</span>
      <Link to={lien} className="btn-ghost shrink-0 !py-2" aria-label={`Ouvrir ${t.themeName}`}>Ouvrir</Link>
    </li>
  )
}

function Genre({ kind }) {
  if (kind === 'decouvrir') return <>Découvrir</>
  if (kind === 'consolider') return <>Consolider</>
  return <>Rappel</>
}

function Pourquoi({ p }) {
  if (p.cle === 'nouveau') return <>Pas encore abordé</>
  if (p.cle === 'ecart') return p.estime ? <>{`Niveau pas encore mesuré, objectif ${p.cible} %`}</> : <>{`Niveau estimé ${p.maitrise} %, objectif ${p.cible} %`}</>
  return p.estime ? <>Rappel avant l’épreuve · niveau pas encore mesuré</> : <>{`Rappel avant l’épreuve · niveau estimé ${p.maitrise} %`}</>
}

// Les semaines éloignées ne sont détaillées qu'à l'ouverture : la page reste légère.
function PlusTard({ semaines, lang, nomMatiere }) {
  const [ouvert, setOuvert] = useState(false)
  return (
    <details className="card p-4" onToggle={(e) => setOuvert(e.currentTarget.open)}>
      <summary className="cursor-pointer font-semibold">{`Les ${semaines.length} semaines d’après`}</summary>
      {ouvert && <div className="mt-3 space-y-3">{semaines.map((s) => <SemaineVue key={s.index} s={s} lang={lang} nomMatiere={nomMatiere} />)}</div>}
    </details>
  )
}

function SemaineVue({ s, lang, nomMatiere, ouverte = false }) {
  const [ouvert, setOuvert] = useState(ouverte)
  const parMatiere = new Map()
  for (const t of s.taches) parMatiere.set(t.subjectId, (parMatiere.get(t.subjectId) || 0) + t.minutes)
  return (
    <details className="card p-4" open={ouverte} onToggle={(e) => setOuvert(e.currentTarget.open)}>
      <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
        <span className="font-semibold">{`Semaine du ${dateCourte(s.debut, lang)}`}</span>
        <span className="text-sm text-slate-500 dark:text-slate-400">{s.minutes ? heures(s.minutes) : 'Libre'}</span>
      </summary>
      {s.taches.length === 0
        ? <p className="mt-2 text-sm">Semaine libre.</p>
        : (
          <>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{[...parMatiere].map(([id, min]) => `${nomMatiere(id)} ${heures(min)}`).join(' · ')}</p>
            {ouvert && <ul className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">{s.taches.map((t) => <Tache key={t.id} t={t} />)}</ul>}
          </>
        )}
    </details>
  )
}
