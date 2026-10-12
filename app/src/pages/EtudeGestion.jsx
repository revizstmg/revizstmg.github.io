import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { commun } from '../content/contenu.js'
import { SUBJECTS } from '../data/index.js'
import { Rich } from '../components/ui.jsx'
import { useT } from '../i18n.js'

// Étude de gestion (Première STMG) : un espace qui accompagne le projet de bout en
// bout — les consignes (content/commun/etude-gestion.json), les sources de
// l'élève, puis ses arguments construits avec la méthode A-E-I. Tout est
// sauvegardé avec la progression (state.etudeGestion).
const CONTENU = commun('etude-gestion')
const ONGLETS = [
  { id: 'consignes', icon: '📋', labelKey: 'egTabRules' },
  { id: 'sources', icon: '📚', labelKey: 'egTabSources' },
  { id: 'arguments', icon: '🧩', labelKey: 'egTabArguments' },
]
const CHAMP = 'w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--c-accent)] dark:border-slate-700'
const ETIQUETTE = 'mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300'
const nouvelId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const lienValide = (s) => !s || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(s.trim())

// « Auteur, « Titre », date, lien » : la façon de citer une source dans le dossier.
export function citation(src) {
  return [src.auteur, src.titre && `« ${src.titre} »`, src.date, src.lien].filter(Boolean).join(', ')
}

// Le dossier en texte brut : problématique, arguments A-E-I et sources.
export function dossierTexte(eg) {
  const sources = eg.sources || []
  const numero = (id) => sources.findIndex((s) => s.id === id) + 1
  const lignes = ['ÉTUDE DE GESTION', '']
  if (eg.theme) lignes.push(`Thème : ${eg.theme}`)
  if (eg.organisation) lignes.push(`Organisation étudiée : ${eg.organisation}`)
  if (eg.problematique) lignes.push(`Problématique : ${eg.problematique}`)
  lignes.push('', 'ARGUMENTS (méthode A-E-I)')
  ;(eg.arguments || []).forEach((a, k) => {
    lignes.push('', `${k + 1}. ${a.a || '(affirmation à écrire)'}`)
    if (a.e) lignes.push(`   Explication : ${a.e}${a.notion ? ` (notion : ${a.notion})` : ''}`)
    if (a.i) lignes.push(`   Illustration : ${a.i}${a.sourceId && numero(a.sourceId) > 0 ? ` [source ${numero(a.sourceId)}]` : ''}`)
  })
  lignes.push('', 'SOURCES')
  sources.forEach((s, k) => lignes.push(`[${k + 1}] ${s.type ? `${s.type} — ` : ''}${citation(s)}`))
  return lignes.join('\n') + '\n'
}

function telecharger(nom, texte) {
  const url = URL.createObjectURL(new Blob([texte], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Sans filière (élève déconnecté), retour à l'accueil. Le test se fait ici, avant
// tout hook de la page : React exige les mêmes hooks à chaque affichage.
export default function EtudeGestion() {
  const { state } = useStore()
  if (!state.track) return <Navigate to="/" replace />
  return <EtudeGestionPage />
}

function EtudeGestionPage() {
  const { state, setEtudeGestion } = useStore()
  const t = useT()
  const [onglet, setOnglet] = useState('consignes')
  const eg = state.etudeGestion || {}
  const nb = { sources: (eg.sources || []).length, arguments: (eg.arguments || []).length }

  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="text-center">
        <p className="kicker">🔎 {t('egTitle')}</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">{t('egTitle')}</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">{CONTENU.intro}</p>
        <span className="mx-auto mt-3 block h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,transparent,#c8a24e,transparent)' }} />
      </header>

      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label={t('egTitle')}>
        {ONGLETS.map((o) => {
          const actif = onglet === o.id
          return (
            <button key={o.id} role="tab" aria-selected={actif} onClick={() => setOnglet(o.id)}
              className={`rounded-xl px-1.5 py-2.5 text-xs font-semibold transition sm:text-sm ${actif ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
              style={actif ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
              <span aria-hidden>{o.icon}</span> {t(o.labelKey)}{nb[o.id] ? ` (${nb[o.id]})` : ''}
            </button>
          )
        })}
      </div>

      {onglet === 'consignes' && <Consignes eg={eg} maj={setEtudeGestion} />}
      {onglet === 'sources' && <Sources eg={eg} maj={setEtudeGestion} />}
      {onglet === 'arguments' && <Arguments eg={eg} maj={setEtudeGestion} versSources={() => setOnglet('sources')} />}
    </div>
  )
}

// ---- 1. Consignes -------------------------------------------------------------
function Consignes({ eg, maj }) {
  const themes = SUBJECTS.find((s) => s.id === 'p1-sgn')?.chapters || []
  const coches = eg.coches || {}
  const faits = CONTENU.dossier.filter((d) => coches[d.id]).length
  return (
    <div className="space-y-5">
      <section className="card space-y-3 p-5">
        <h2 className="font-display text-xl font-medium">🎯 Mon projet</h2>
        <label className="block">
          <span className={ETIQUETTE}>Thème du programme</span>
          <select value={eg.theme || ''} onChange={(e) => maj({ theme: e.target.value })} className={CHAMP}>
            <option value="">Choisis un thème…</option>
            {themes.map((th) => <option key={th.id} value={th.name}>{th.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={ETIQUETTE}>Organisation étudiée</span>
          <input value={eg.organisation || ''} onChange={(e) => maj({ organisation: e.target.value })} placeholder="Ex. : la boulangerie de mon quartier, une association sportive…" className={CHAMP} maxLength={160} />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>Ma problématique</span>
          <textarea value={eg.problematique || ''} onChange={(e) => maj({ problematique: e.target.value })} rows={3} placeholder="Une question précise, qui part d'une question de gestion du programme." className={CHAMP} maxLength={400} />
        </label>
        {eg.problematique && !eg.problematique.trim().endsWith('?') && (
          <p className="text-xs text-amber-700 dark:text-amber-300">💡 Une problématique se formule comme une question : termine-la par un point d'interrogation.</p>
        )}
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 font-display text-xl font-medium">📏 Les règles</h2>
        {CONTENU.regles.map((r) => (
          <div key={r.h} className="card p-4">
            <h3 className="font-display font-semibold">{r.h}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200"><Rich text={r.c} /></p>
          </div>
        ))}
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl font-medium">🧭 La démarche conseillée</h2>
        <ol className="mt-3 space-y-3">
          {CONTENU.demarche.map((d, k) => (
            <li key={d.h} className="flex gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: 'var(--c-accent-fort)' }} aria-hidden>{k + 1}</span>
              <span className="text-sm"><b>{d.h}.</b> {d.c}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl font-medium">✅ Mon dossier contient…</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{faits} / {CONTENU.dossier.length} parties prêtes</p>
        <div className="mt-3 space-y-2">
          {CONTENU.dossier.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <input type="checkbox" checked={!!coches[d.id]} onChange={(e) => maj((x) => ({ ...x, coches: { ...(x.coches || {}), [d.id]: e.target.checked } }))} className="h-4 w-4" style={{ accentColor: 'var(--c-accent-fort)' }} />
              <span className="text-sm">{d.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl font-medium">💡 Conseils</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
          {CONTENU.conseils.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>

      {themes.length > 0 && (
        <section className="card p-5">
          <h2 className="font-display text-xl font-medium">📖 Revoir le cours</h2>
          <div className="mt-3 grid gap-2">
            {themes.map((th) => (
              <Link key={th.id} to={`/subject/p1-sgn/theme/${th.id}`} className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">{th.name} ›</Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-1 text-xs text-slate-500 dark:text-slate-400">
        <p className="font-semibold">Textes officiels</p>
        <ul className="mt-1 space-y-1">
          {CONTENU.references.map((r) => (
            <li key={r.lien}><a href={r.lien} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--c-accent-texte)' }}>{r.titre}</a></li>
          ))}
        </ul>
        <p className="mt-2">Le calendrier et la forme exacte de l'étude sont fixés par ton professeur.</p>
      </section>
    </div>
  )
}

// ---- 2. Sources ---------------------------------------------------------------
const SOURCE_VIDE = { type: '', titre: '', auteur: '', date: '', lien: '', notes: '', fiable: {} }

function Sources({ eg, maj }) {
  const sources = eg.sources || []
  const [brouillon, setBrouillon] = useState(SOURCE_VIDE)
  const [edition, setEdition] = useState(null) // id de la source modifiée
  const [erreur, setErreur] = useState('')
  const champ = (k) => (e) => setBrouillon((b) => ({ ...b, [k]: e.target.value }))

  const enregistrer = () => {
    if (!brouillon.titre.trim()) { setErreur('Donne au moins un titre à ta source.'); return }
    if (!lienValide(brouillon.lien)) { setErreur('Le lien doit commencer par http:// ou https://'); return }
    const propre = { ...brouillon, titre: brouillon.titre.trim(), auteur: brouillon.auteur.trim(), date: brouillon.date.trim(), lien: brouillon.lien.trim() }
    maj((x) => ({
      ...x,
      sources: edition
        ? (x.sources || []).map((s) => (s.id === edition ? { ...propre, id: edition } : s))
        : [...(x.sources || []), { ...propre, id: nouvelId() }],
    }))
    setBrouillon(SOURCE_VIDE); setEdition(null); setErreur('')
  }
  const modifier = (s) => { setBrouillon({ ...SOURCE_VIDE, ...s }); setEdition(s.id); setErreur('') }
  const supprimer = (id) => {
    if (!confirm('Supprimer cette source ? Les arguments qui l’utilisent n’y seront plus reliés.')) return
    maj((x) => ({ ...x, sources: (x.sources || []).filter((s) => s.id !== id), arguments: (x.arguments || []).map((a) => (a.sourceId === id ? { ...a, sourceId: '' } : a)) }))
  }
  const types = new Set(sources.map((s) => s.type).filter(Boolean))

  return (
    <div className="space-y-5">
      <section className="card space-y-3 p-5">
        <h2 className="font-display text-xl font-medium">{edition ? '✏️ Modifier la source' : '➕ Ajouter une source'}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={ETIQUETTE}>Type</span>
            <select value={brouillon.type} onChange={champ('type')} className={CHAMP}>
              <option value="">Choisis…</option>
              {CONTENU.typesSources.map((ty) => <option key={ty}>{ty}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Date</span>
            <input value={brouillon.date} onChange={champ('date')} placeholder="Ex. : mars 2026" className={CHAMP} maxLength={40} />
          </label>
        </div>
        <label className="block">
          <span className={ETIQUETTE}>Titre *</span>
          <input value={brouillon.titre} onChange={champ('titre')} placeholder="Titre de l'article, du document, de l'entretien…" className={CHAMP} maxLength={200} />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>Auteur ou organisme</span>
          <input value={brouillon.auteur} onChange={champ('auteur')} placeholder="Ex. : INSEE, Le Monde, la gérante du magasin" className={CHAMP} maxLength={120} />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>Lien (si la source est en ligne)</span>
          <input value={brouillon.lien} onChange={champ('lien')} placeholder="https://…" className={CHAMP} maxLength={400} inputMode="url" />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>Ce que j'en retiens</span>
          <textarea value={brouillon.notes} onChange={champ('notes')} rows={3} placeholder="Les faits, chiffres ou citations utiles pour ton étude." className={CHAMP} maxLength={1500} />
        </label>
        <fieldset>
          <legend className={ETIQUETTE}>Fiabilité</legend>
          <div className="space-y-1.5">
            {CONTENU.fiabilite.map((f) => (
              <label key={f.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!brouillon.fiable?.[f.id]} onChange={(e) => setBrouillon((b) => ({ ...b, fiable: { ...(b.fiable || {}), [f.id]: e.target.checked } }))} className="h-4 w-4" style={{ accentColor: 'var(--c-accent-fort)' }} />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
        {erreur && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{erreur}</p>}
        <div className="flex flex-wrap gap-2">
          <button onClick={enregistrer} className="btn-primary" style={{ backgroundColor: 'var(--c-accent-fort)' }}>{edition ? 'Enregistrer' : 'Ajouter la source'}</button>
          {edition && <button onClick={() => { setBrouillon(SOURCE_VIDE); setEdition(null); setErreur('') }} className="btn-ghost">Annuler</button>}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 font-display text-xl font-medium">📚 Mes sources ({sources.length})</h2>
        {sources.length === 0 && <p className="card p-4 text-center text-sm text-slate-500 dark:text-slate-400">Aucune source pour l'instant. Ajoute la première ci-dessus.</p>}
        {sources.length >= 2 && types.size < 2 && (
          <p className="px-1 text-xs text-amber-700 dark:text-amber-300">💡 Varie tes sources : mêle documents (presse, rapports, documents de l'organisation) et terrain (entretien, questionnaire, observation).</p>
        )}
        {sources.map((s, k) => {
          const score = CONTENU.fiabilite.filter((f) => s.fiable?.[f.id]).length
          return (
            <article key={s.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">[{k + 1}]</span>
                {s.type && <span className="chip bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s.type}</span>}
                <span className={`chip ${score === 3 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'}`}>Fiabilité {score}/3</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{s.titre}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 [overflow-wrap:anywhere]">{citation(s)}</p>
              {s.notes && <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">{s.notes}</p>}
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => modifier(s)} className="font-semibold underline" style={{ color: 'var(--c-accent-texte)' }}>Modifier</button>
                <button onClick={() => supprimer(s.id)} className="font-semibold text-rose-600 underline dark:text-rose-400">Supprimer</button>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}

// ---- 3. Arguments A-E-I -------------------------------------------------------
const ARGUMENT_VIDE = { a: '', e: '', notion: '', i: '', sourceId: '' }

function Arguments({ eg, maj, versSources }) {
  const t = useT()
  const sources = eg.sources || []
  const args = eg.arguments || []
  const [brouillon, setBrouillon] = useState(ARGUMENT_VIDE)
  const [edition, setEdition] = useState(null)
  const [exemple, setExemple] = useState(false)
  const [erreur, setErreur] = useState('')
  const champ = (k) => (e) => setBrouillon((b) => ({ ...b, [k]: e.target.value }))
  const ETAPES = CONTENU.aei.etapes

  const enregistrer = () => {
    if (!brouillon.a.trim()) { setErreur('Commence par l’affirmation : c’est l’idée que tu défends.'); return }
    maj((x) => ({
      ...x,
      arguments: edition
        ? (x.arguments || []).map((a) => (a.id === edition ? { ...brouillon, id: edition } : a))
        : [...(x.arguments || []), { ...brouillon, id: nouvelId() }],
    }))
    setBrouillon(ARGUMENT_VIDE); setEdition(null); setErreur('')
  }
  const deplacer = (k, sens) => maj((x) => {
    const liste = [...(x.arguments || [])]
    const j = k + sens
    if (j < 0 || j >= liste.length) return x
    ;[liste[k], liste[j]] = [liste[j], liste[k]]
    return { ...x, arguments: liste }
  })
  const supprimer = (id) => { if (confirm('Supprimer cet argument ?')) maj((x) => ({ ...x, arguments: (x.arguments || []).filter((a) => a.id !== id) })) }
  const sourceDe = (id) => sources.find((s) => s.id === id)

  return (
    <div className="space-y-5">
      <section className="card p-5" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 35%, transparent)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ma problématique</p>
        <p className="mt-1 font-display text-lg">{eg.problematique || 'Pas encore écrite : remplis-la dans l’onglet « Consignes ».'}</p>
      </section>

      <section className="card p-5">
        <h2 className="font-display text-xl font-medium">🧩 La méthode A-E-I</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{CONTENU.aei.intro}</p>
        <div className="mt-3 space-y-2">
          {ETAPES.map((et) => (
            <div key={et.id} className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display text-lg font-bold text-white" style={{ backgroundColor: 'var(--c-accent-fort)' }} aria-hidden>{et.lettre}</span>
              <span className="text-sm"><b>{et.h}</b> — {et.c}{exemple && <span className="mt-1 block italic text-slate-600 dark:text-slate-300">Exemple : {et.exemple}</span>}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setExemple((v) => !v)} className="mt-3 text-sm font-semibold underline" style={{ color: 'var(--c-accent-texte)' }}>{exemple ? 'Masquer l’exemple' : 'Voir un exemple complet'}</button>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-xl font-medium">{edition ? '✏️ Modifier l’argument' : '➕ Nouvel argument'}</h2>
        <label className="block">
          <span className={ETIQUETTE}>A — Affirmation *</span>
          <textarea value={brouillon.a} onChange={champ('a')} rows={2} placeholder={ETAPES[0].c} className={CHAMP} maxLength={400} />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>E — Explication</span>
          <textarea value={brouillon.e} onChange={champ('e')} rows={3} placeholder={ETAPES[1].c} className={CHAMP} maxLength={1200} />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>Notion du cours utilisée</span>
          <input value={brouillon.notion} onChange={champ('notion')} placeholder="Ex. : intelligence collective, valeur ajoutée, risque…" className={CHAMP} maxLength={120} />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>I — Illustration</span>
          <textarea value={brouillon.i} onChange={champ('i')} rows={3} placeholder={ETAPES[2].c} className={CHAMP} maxLength={1200} />
        </label>
        <label className="block">
          <span className={ETIQUETTE}>Source de l'illustration</span>
          <select value={brouillon.sourceId} onChange={champ('sourceId')} className={CHAMP}>
            <option value="">Aucune source</option>
            {sources.map((s, k) => <option key={s.id} value={s.id}>[{k + 1}] {s.titre}</option>)}
          </select>
        </label>
        {sources.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Pas encore de source : <button onClick={versSources} className="font-semibold underline" style={{ color: 'var(--c-accent-texte)' }}>ajoute-la dans l'onglet Sources</button>.</p>
        )}
        {erreur && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{erreur}</p>}
        <div className="flex flex-wrap gap-2">
          <button onClick={enregistrer} className="btn-primary" style={{ backgroundColor: 'var(--c-accent-fort)' }}>{edition ? 'Enregistrer' : 'Ajouter l’argument'}</button>
          {edition && <button onClick={() => { setBrouillon(ARGUMENT_VIDE); setEdition(null); setErreur('') }} className="btn-ghost">Annuler</button>}
        </div>
      </section>

      <section className="space-y-2.5">
        <h2 className="px-1 font-display text-xl font-medium">🗂️ Mes arguments ({args.length})</h2>
        {args.length === 0 && <p className="card p-4 text-center text-sm text-slate-500 dark:text-slate-400">Aucun argument pour l'instant.</p>}
        {args.map((a, k) => {
          const src = sourceDe(a.sourceId)
          const manque = [!a.e && 'l’explication', !a.i && 'l’illustration', a.i && !src && 'la source de l’illustration'].filter(Boolean)
          return (
            <article key={a.id} className="card space-y-2 p-4">
              <p className="font-display font-semibold">{k + 1}. {a.a}</p>
              {a.e && <p className="text-sm"><b>Explication.</b> {a.e}{a.notion && <span className="text-slate-500 dark:text-slate-400"> (notion : {a.notion})</span>}</p>}
              {a.i && <p className="text-sm"><b>Illustration.</b> {a.i}</p>}
              {src && <p className="text-xs text-slate-500 dark:text-slate-400 [overflow-wrap:anywhere]">📎 {citation(src)}</p>}
              {manque.length > 0 && <p className="text-xs text-amber-700 dark:text-amber-300">À compléter : {manque.join(', ')}.</p>}
              <div className="flex flex-wrap gap-3 pt-1 text-sm">
                <button onClick={() => deplacer(k, -1)} disabled={k === 0} className="disabled:opacity-40" aria-label="Monter">↑</button>
                <button onClick={() => deplacer(k, 1)} disabled={k === args.length - 1} className="disabled:opacity-40" aria-label="Descendre">↓</button>
                <button onClick={() => { setBrouillon({ ...ARGUMENT_VIDE, ...a }); setEdition(a.id); setErreur(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="font-semibold underline" style={{ color: 'var(--c-accent-texte)' }}>Modifier</button>
                <button onClick={() => supprimer(a.id)} className="font-semibold text-rose-600 underline dark:text-rose-400">Supprimer</button>
              </div>
            </article>
          )
        })}
      </section>

      {(args.length > 0 || sources.length > 0) && (
        <button onClick={() => telecharger('etude-de-gestion.txt', dossierTexte(eg))} className="btn-gold w-full !py-3">⬇️ {t('egDownload')}</button>
      )}
    </div>
  )
}
