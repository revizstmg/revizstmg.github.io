import LevelToolNotice from '../components/LevelToolNotice.jsx'
import { TextePublic } from '../localisation/PublicText.jsx'
import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore, grandOralVide } from '../store.jsx'
import GRAND_ORAL from '../../content/commun/grand-oral.json'
import { SUBJECTS } from '../data/index.js'
import { trackLabel } from '../data/tracks.js'
import { useT } from '../i18n.js'
import { Rich, Ring } from '../components/ui.jsx'
import AudioRecorder from '../components/AudioRecorder.jsx'
import {
  CHAMP, ETIQUETTE, LIEN, Pli, Detail, Onglets, OngletSources, OngletAnalyse, OngletArguments,
  noteGlobale, virgule, analyseTexte, argumentsTexte, sourcesTexte, aDuContenu, telecharger,
} from '../components/DossierProjet.jsx'

// Grand Oral (Terminale STMG) : le même accompagnement que l'étude de gestion,
// adapté aux attendus de l'épreuve — les règles de la session 2027 et ce que le
// jury évalue (content/commun/grand-oral.json), les sources, l'analyse de
// l'organisation qui illustre les questions (caractérisation, diagnostic,
// PESTEL), puis les arguments A-E-I de chaque question, évalués avec une grille
// qui ajoute un critère d'oral. On s'y entraîne aussi : chronomètre aux durées
// de l'épreuve, enregistrement et auto-évaluation sur les critères du jury.
// Tout est sauvegardé avec la progression (state.grandOral).
const CONTENU = GRAND_ORAL
const GRILLE = CONTENU.aei.grille
const ONGLETS = [
  { id: 'consignes', icon: '📋', labelKey: 'egTabRules' },
  { id: 'sources', icon: '📚', labelKey: 'egTabSources' },
  { id: 'analyse', icon: '🔍', labelKey: 'egTabAnalysis' },
  { id: 'arguments', icon: '🧩', labelKey: 'egTabArguments' },
]
const QUESTIONS = [{ id: 'q1', label: 'Question 1' }, { id: 'q2', label: 'Question 2' }]
const questionDe = (a) => (a.question === 'q2' ? 'q2' : 'q1')

// La préparation en texte brut : questions, plan, analyse, arguments par
// question et sources.
export function preparationTexte(go) {
  const sources = go.sources || []
  const args = go.arguments || []
  const lignes = ['GRAND ORAL — MA PRÉPARATION', '']
  if (go.spec) lignes.push(`Spécialité : ${go.spec}`)
  for (const q of QUESTIONS) if (go[q.id]) lignes.push(`${q.label} : ${go[q.id]}`)
  if (go.organisation) lignes.push(`Organisation étudiée : ${go.organisation}`)
  if (String(go.notes || '').trim()) lignes.push('', 'MON PLAN', go.notes.trim())
  lignes.push(...analyseTexte(go.analyse))
  for (const q of QUESTIONS) {
    const liste = args.filter((a) => questionDe(a) === q.id)
    if (liste.length) lignes.push('', `ARGUMENTS — ${q.label.toUpperCase()}${go[q.id] ? ` : ${go[q.id]}` : ''}`, ...argumentsTexte(liste, sources, GRILLE))
  }
  if (args.length) lignes.push('', `Note de mes arguments (auto-évaluation) : ${virgule(noteGlobale(args, sources, GRILLE))}/20`)
  lignes.push(...sourcesTexte(sources))
  return lignes.join('\n') + '\n'
}

// Auto-évaluation sur les critères du jury : 1 à 5 par critère, ramené sur 20.
export function noteAutoEval(notes) {
  const valeurs = CONTENU.autoEval.map((c) => notes[c.key] || 0)
  if (valeurs.some((v) => !v)) return null
  const total = valeurs.reduce((s, v) => s + v, 0)
  return Math.round((total / (valeurs.length * 5)) * 20 * 2) / 2
}

// Sans filière (élève déconnecté), retour à l'accueil. Le test se fait ici, avant
// tout hook de la page : React exige les mêmes hooks à chaque affichage, sinon la
// déconnexion depuis cette page laisse un écran blanc.
export default function GrandOral() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <GrandOralPage />
}

function GrandOralPage() {
  const { state, setGrandOral } = useStore()
  const t = useT()
  const [onglet, setOnglet] = useState('consignes')
  const go = { ...grandOralVide(), ...(state.grandOral || {}) }
  const nb = { sources: go.sources.length, arguments: go.arguments.length }
  const questions = QUESTIONS.map((q) => ({ ...q, texte: go[q.id] }))

  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <LevelToolNotice level="terminale-stmg">
      <header className="page-hero text-center">
        <p className="kicker">🎓 {t('grandOral')}</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{t('grandOral')}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400"><TextePublic text={CONTENU.intro} /></p>
      </header>

      <div className="grid grid-cols-3 gap-2 text-center">
        {CONTENU.enBref.map((x) => (
          <div key={x.l} className="rounded-xl p-2.5" style={{ backgroundColor: 'color-mix(in srgb, var(--c-accent) 10%, transparent)' }}>
            <p className="font-display text-xl font-bold" style={LIEN}><TextePublic text={x.v} /></p>
            <p className="text-xs text-slate-600 dark:text-slate-300"><TextePublic text={x.l} /></p>
          </div>
        ))}
      </div>

      <Onglets onglets={ONGLETS.map((o) => ({ ...o, label: t(o.labelKey) }))} actif={onglet} choisir={setOnglet} label={t('grandOral')} nb={nb} />

      {onglet === 'consignes' && <Consignes go={go} maj={setGrandOral} track={state.track} />}
      {onglet === 'sources' && <OngletSources d={go} maj={setGrandOral} />}
      {onglet === 'analyse' && <OngletAnalyse d={go} maj={setGrandOral} />}
      {onglet === 'arguments' && (
        <OngletArguments d={go} maj={setGrandOral} grille={GRILLE} aei={CONTENU.aei} questions={questions} versSources={() => setOnglet('sources')}
          notion={{ label: 'Notion de ta spécialité utilisée', exemple: 'Ex. : besoin en fonds de roulement, fidélisation…' }}
          entete={(
            <section className="card space-y-2 p-4" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 35%, transparent)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mes questions</p>
              {questions.map((q) => (
                <p key={q.id} className="font-display text-lg leading-snug"><span className="text-sm font-semibold" style={LIEN}><TextePublic text={q.label} /> · </span>{q.texte || 'À écrire dans l’onglet « Consignes ».'}</p>
              ))}
            </section>
          )} />
      )}

      {aDuContenu(go) && (
        <button onClick={() => telecharger('grand-oral.txt', preparationTexte(go))} className="btn-gold w-full !py-3">⬇️ {t('goDownload')}</button>
      )}
      </LevelToolNotice>
    </div>
  )
}

// ---- Consignes ------------------------------------------------------------------
function Consignes({ go, maj, track }) {
  const specs = Object.keys(CONTENU.banque)
  const maSpec = specs.includes(track?.specialty) ? track.specialty : specs[0]
  const [banqueSpec, setBanqueSpec] = useState(maSpec)
  const banque = CONTENU.banque[banqueSpec]
  const nbExemples = specs.reduce((n, k) => n + CONTENU.banque[k].items.length, 0)
  // « Utiliser » remplit la première question libre, sinon remplace la seconde.
  const utiliser = (texte) => maj(go.q1 ? { q2: texte } : { q1: texte })
  const ecrites = QUESTIONS.filter((q) => String(go[q.id] || '').trim()).length
  const cours = [track?.specialty, 'management'].map((id) => SUBJECTS.find((s) => s.id === id)).filter((s) => s?.chapters?.length)

  return (
    <div className="space-y-3">
      <Pli icon="🎯" titre="Mes deux questions" sous={`${ecrites} / 2 questions écrites`} initial>
        <div className="space-y-3">
          <label className="block">
            <span className={ETIQUETTE}>Ma spécialité</span>
            <input value={go.spec || ''} onChange={(e) => maj({ spec: e.target.value })} placeholder={`Ex. : ${trackLabel(track)}`} className={CHAMP} maxLength={160} />
          </label>
          {QUESTIONS.map((q) => (
            <label key={q.id} className="block">
              <span className={ETIQUETTE}><TextePublic text={q.label} /></span>
              <textarea value={go[q.id] || ''} onChange={(e) => maj({ [q.id]: e.target.value })} rows={2} placeholder="Une question précise, qui appelle une réponse argumentée." className={CHAMP} maxLength={400} />
            </label>
          ))}
          {QUESTIONS.some((q) => go[q.id] && !go[q.id].trim().endsWith('?')) && (
            <p className="text-xs text-amber-700 dark:text-amber-300">💡 Termine chaque question par un point d'interrogation.</p>
          )}
          <label className="block">
            <span className={ETIQUETTE}>Organisation étudiée (facultatif)</span>
            <input value={go.organisation || ''} onChange={(e) => maj({ organisation: e.target.value })} placeholder="L'organisation réelle qui illustre tes questions" className={CHAMP} maxLength={160} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Mon plan</span>
            <textarea value={go.notes || ''} onChange={(e) => maj({ notes: e.target.value })} rows={6} className={CHAMP} maxLength={4000}
              placeholder={'Pourquoi j’ai choisi cette question : …\nPartie 1 : idée + exemple\nPartie 2 : idée + exemple\nConclusion : …'} />
          </label>
          {(go.spec || go.q1 || go.q2 || go.notes) && (
            <button onClick={() => { if (confirm('Effacer tes questions et ton plan ?')) maj({ spec: '', q1: '', q2: '', notes: '' }) }} className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400">
              ↺ Effacer mes questions et mon plan
            </button>
          )}
        </div>
      </Pli>

      <Pli icon="📏" titre="L'épreuve" sous="Les règles de la session 2027">
        <div className="space-y-2">
          {CONTENU.regles.map((r) => <Detail key={r.h} titre={<TextePublic text={r.h} />}><Rich translate text={r.c} /></Detail>)}
        </div>
      </Pli>

      <Pli icon="⚖️" titre="Ce que le jury évalue" sous={`${CONTENU.jury.criteres.length} critères`}>
        <div className="space-y-2">
          {CONTENU.jury.criteres.map((c) => <Detail key={c.h} titre={<>{c.icon} <TextePublic text={c.h} /></>}><TextePublic text={c.c} /></Detail>)}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400"><TextePublic text={CONTENU.jury.note} /></p>
      </Pli>

      <Pli icon="🧭" titre="La démarche" sous={`${CONTENU.demarche.length} étapes`}>
        <div className="space-y-2">
          {CONTENU.demarche.map((d, k) => <Detail key={d.h} repere={k + 1} titre={<TextePublic text={d.h} />}><TextePublic text={d.c} /></Detail>)}
        </div>
      </Pli>

      <Pli icon="💡" titre="Les conseils" sous={`${CONTENU.conseils.length} conseils`}>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {CONTENU.conseils.map((c) => <li key={c}><TextePublic text={c} /></li>)}
        </ul>
      </Pli>

      <Pli icon="🗂️" titre="Banque de questions" sous={`${nbExemples} exemples, chacun avec un angle`}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {specs.map((k) => {
            const v = CONTENU.banque[k]
            const actif = banqueSpec === k
            return (
              <button key={k} onClick={() => setBanqueSpec(k)} aria-pressed={actif}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${actif ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                style={actif ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
                {v.icon} <TextePublic text={v.label} />{k === maSpec ? ' ★' : ''}
              </button>
            )
          })}
        </div>
        <div className="space-y-2">
          {banque.items.map((it) => (
            <div key={it.q} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug">« <TextePublic text={it.q} /> »</p>
                <button onClick={() => utiliser(it.q)} className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: 'var(--c-accent-fort)' }}>Utiliser</button>
              </div>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold" style={LIEN}>Angle :</span> <TextePublic text={it.angle} /></p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">★ Ta spécialité. Ce sont des exemples pour t’inspirer : tes deux questions se choisissent avec tes professeurs.</p>
      </Pli>

      <Pli icon="⏱️" titre="M'entraîner à l'oral" sous="Chronomètre aux durées de l'épreuve, enregistrement">
        <Entrainement />
      </Pli>

      <Pli icon="📝" titre="M'auto-évaluer comme le jury" sous={`${CONTENU.autoEval.length} critères, une note sur 20`}>
        <AutoEval />
      </Pli>

      {cours.length > 0 && (
        <Pli icon="📖" titre="Revoir le cours" sous="Pour préparer l'échange avec le jury">
          <div className="grid gap-2">
            {cours.map((s) => (
              <Link key={s.id} to={`/subject/${s.id}`} className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"><TextePublic text={s.name} /> ›</Link>
            ))}
          </div>
        </Pli>
      )}

      <Pli icon="📜" titre="Textes officiels" sous={`${CONTENU.references.length} textes`}>
        <ul className="space-y-2 text-sm">
          {CONTENU.references.map((r) => (
            <li key={r.lien}><a href={r.lien} target="_blank" rel="noopener noreferrer" className="underline" style={LIEN}><TextePublic text={r.titre} /></a></li>
          ))}
        </ul>
      </Pli>
    </div>
  )
}

// ---- Entraînement : chronomètre aux durées de l'épreuve -------------------------
const deux = (n) => String(n).padStart(2, '0')

function Entrainement() {
  const PRATIQUE = CONTENU.pratique
  const [choix, setChoix] = useState(PRATIQUE[1].key)
  const [total, setTotal] = useState(PRATIQUE[1].min * 60)
  const [reste, setReste] = useState(PRATIQUE[1].min * 60)
  const [enCours, setEnCours] = useState(false)
  const minuteur = useRef(null)

  useEffect(() => {
    if (!enCours) return
    minuteur.current = setInterval(() => {
      setReste((r) => {
        if (r <= 1) { clearInterval(minuteur.current); setEnCours(false); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(minuteur.current)
  }, [enCours])

  const regler = (min, cle = null) => { setEnCours(false); setChoix(cle); setTotal(min * 60); setReste(min * 60) }
  const minutes = Math.round(total / 60)
  const pct = total > 0 ? (1 - reste / total) * 100 : 0

  return (
    <div>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">Choisis un temps, mets-toi debout et parle sans lire tes notes jusqu’à la fin du chrono.</p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {PRATIQUE.map((p) => {
          const actif = choix === p.key
          return (
            <button key={p.key} onClick={() => regler(p.min, p.key)} aria-pressed={actif}
              className={`rounded-xl px-2 py-2 text-center text-xs font-semibold transition ${actif ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
              style={actif ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
              <TextePublic text={p.label} /><br /><span className="font-normal">{p.min} min</span>
            </button>
          )
        })}
      </div>
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">Durée libre :</span>
        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1 dark:border-slate-700">
          <button onClick={() => regler(Math.max(1, minutes - 1))} aria-label="Moins une minute" className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">−</button>
          <span className="w-14 text-center text-sm font-semibold tabular-nums">{minutes} min</span>
          <button onClick={() => regler(Math.min(30, minutes + 1))} aria-label="Plus une minute" className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">+</button>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <Ring value={pct} color={reste === 0 ? '#3f9d6d' : 'var(--c-accent)'} size={180}
          label={(
            <span className="flex flex-col items-center">
              <span className="font-display text-5xl font-semibold tabular-nums" style={{ color: reste === 0 ? '#3f9d6d' : 'var(--c-accent-texte)' }}>{deux(Math.floor(reste / 60))}:{deux(reste % 60)}</span>
              <span className="mt-1 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">{reste === 0 ? 'Terminé' : enCours ? 'En cours' : 'Prêt'}</span>
            </span>
          )} />
        <div className="mt-4 flex w-full max-w-xs gap-2">
          <button onClick={() => { if (reste === 0) setReste(total); setEnCours((r) => !r) }}
            className="flex-1 rounded-2xl px-4 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90" style={{ backgroundColor: 'var(--c-accent-fort)' }}>
            {enCours ? '⏸ Pause' : reste === 0 ? '↺ Recommencer' : '▶ Démarrer'}
          </button>
          <button onClick={() => { setEnCours(false); setReste(total) }} aria-label="Remettre le chrono à zéro"
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">↺</button>
        </div>
      </div>
      <AudioRecorder />
    </div>
  )
}

// ---- Auto-évaluation sur les critères du jury -----------------------------------
function AutoEval() {
  const CRITERES = CONTENU.autoEval
  const [notes, setNotes] = useState({})
  const note = noteAutoEval(notes)
  // Couleurs lisibles en thème clair comme sombre.
  const verdict = note == null ? null
    : note >= 17 ? { t: 'Prêt·e pour le jour J 🎉', c: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' }
      : note >= 14 ? { t: 'Solide : peaufine les détails 👍', c: 'bg-cyan-50 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200' }
        : note >= 10 ? { t: 'En bonne voie : continue à t’entraîner 💪', c: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' }
          : { t: 'À retravailler : entraîne-toi régulièrement 🔁', c: 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200' }
  const faible = note == null ? null : CRITERES.reduce((a, b) => (notes[b.key] < notes[a.key] ? b : a))

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Après un passage blanc, note-toi honnêtement de 1 à 5 sur chaque critère du jury. Tu obtiens une note indicative sur 20 et un conseil sur ton point faible.</p>
      <div className="space-y-3">
        {CRITERES.map((c) => (
          <div key={c.key} className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium"><span aria-hidden>{c.icon}</span> <TextePublic text={c.label} /></span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setNotes((p) => ({ ...p, [c.key]: n }))} aria-label={`${c.label} : ${n} sur 5`} aria-pressed={notes[c.key] === n}
                  className="grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold transition"
                  style={(notes[c.key] || 0) >= n ? { backgroundColor: 'var(--c-accent-fort)', color: '#fff' } : { backgroundColor: 'color-mix(in srgb, var(--c-accent) 12%, transparent)', color: 'var(--c-accent-texte)' }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {verdict && (
        <div className={`mt-5 rounded-2xl p-4 text-center ${verdict.c}`}>
          <p className="font-display text-4xl font-bold tabular-nums">{virgule(note)}<span className="text-xl">/20</span></p>
          <p className="mt-1 font-semibold">{verdict.t}</p>
          {note < 20 && <p className="mx-auto mt-2 max-w-md text-sm text-slate-700 dark:text-slate-200"><span className="font-semibold">À travailler en priorité, {faible.label.toLowerCase()} :</span> {faible.tip}</p>}
          <button onClick={() => setNotes({})} className="mt-3 text-xs font-semibold text-slate-600 hover:underline dark:text-slate-300">↺ Refaire une auto-évaluation</button>
        </div>
      )}
    </div>
  )
}
