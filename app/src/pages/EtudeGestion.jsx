import { useId, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { commun } from '../content/contenu.js'
import { SUBJECTS } from '../data/index.js'
import { Rich } from '../components/ui.jsx'
import { useT } from '../i18n.js'

// Étude de gestion (Première STMG) : un espace qui accompagne le projet de bout en
// bout — les consignes (content/commun/etude-gestion.json), les sources de
// l'élève, puis ses arguments construits avec la méthode A-E-I et évalués avec
// une grille. Tout est sauvegardé avec la progression (state.etudeGestion).
// Pour ne pas noyer l'élève sous le texte, chaque bloc est replié : on n'affiche
// que son titre, et il se déploie quand on appuie dessus.
const CONTENU = commun('etude-gestion')
const GRILLE = CONTENU.aei.grille
const ONGLETS = [
  { id: 'consignes', icon: '📋', labelKey: 'egTabRules' },
  { id: 'sources', icon: '📚', labelKey: 'egTabSources' },
  { id: 'arguments', icon: '🧩', labelKey: 'egTabArguments' },
]
const CHAMP = 'w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--c-accent)] dark:border-slate-700'
const ETIQUETTE = 'mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300'
const LIEN = { color: 'var(--c-accent-texte)' }
const nouvelId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const lienValide = (s) => !s || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(s.trim())

// « Auteur, « Titre », date, lien » : la façon de citer une source dans le dossier.
export function citation(src) {
  return [src.auteur, src.titre && `« ${src.titre} »`, src.date, src.lien].filter(Boolean).join(', ')
}

// Grille A-E-I d'un argument : chaque critère vaut 1 point. Les critères « auto »
// se vérifient tout seuls (notion renseignée, source reliée) ; les autres sont
// cochés par l'élève, et seulement si la partie concernée est écrite.
export function critereRempli(critere, arg, sources = []) {
  if (critere.auto === 'notion') return !!String(arg.notion || '').trim()
  if (critere.auto === 'source') return !!arg.sourceId && sources.some((s) => s.id === arg.sourceId)
  return !!String(arg[critere.id] || '').trim() && !!arg.eval?.[critere.id]
}
export function noteArgument(arg, sources = []) {
  return GRILLE.filter((c) => critereRempli(c, arg, sources)).length
}
// Note globale sur 20 : la moyenne des grilles, ramenée sur 20 (au demi-point).
export function noteGlobale(args = [], sources = []) {
  if (!args.length) return null
  const moyenne = args.reduce((n, a) => n + noteArgument(a, sources), 0) / args.length
  return Math.round((moyenne / GRILLE.length) * 20 * 2) / 2
}
const virgule = (n) => String(n).replace('.', ',')

// Le dossier en texte brut : problématique, arguments A-E-I et sources.
export function dossierTexte(eg) {
  const sources = eg.sources || []
  const args = eg.arguments || []
  const numero = (id) => sources.findIndex((s) => s.id === id) + 1
  const lignes = ['ÉTUDE DE GESTION', '']
  if (eg.theme) lignes.push(`Thème : ${eg.theme}`)
  if (eg.organisation) lignes.push(`Organisation étudiée : ${eg.organisation}`)
  if (eg.problematique) lignes.push(`Problématique : ${eg.problematique}`)
  lignes.push('', 'ARGUMENTS (méthode A-E-I)')
  args.forEach((a, k) => {
    lignes.push('', `${k + 1}. ${a.a || '(affirmation à écrire)'}`)
    if (a.e) lignes.push(`   Explication : ${a.e}${a.notion ? ` (notion : ${a.notion})` : ''}`)
    if (a.i) lignes.push(`   Illustration : ${a.i}${a.sourceId && numero(a.sourceId) > 0 ? ` [source ${numero(a.sourceId)}]` : ''}`)
    lignes.push(`   Auto-évaluation : ${noteArgument(a, sources)}/${GRILLE.length}`)
  })
  if (args.length) lignes.push('', `Note de mes arguments (auto-évaluation) : ${virgule(noteGlobale(args, sources))}/20`)
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

// Bloc repliable : un titre (et une ligne de résumé) ; le contenu se déploie au
// toucher. `ouvert` + `basculer` permettent de le piloter depuis le parent.
function Pli({ icon, titre, sous, initial = false, ouvert, basculer, children }) {
  const [interne, setInterne] = useState(initial)
  const id = useId()
  const estOuvert = ouvert ?? interne
  return (
    <section className="card overflow-hidden p-0">
      <button type="button" onClick={basculer || (() => setInterne((v) => !v))} aria-expanded={estOuvert} aria-controls={id}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/40">
        {icon && <span className="text-xl" aria-hidden>{icon}</span>}
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-medium leading-snug">{titre}</span>
          {sous && <span className="block text-xs text-slate-500 dark:text-slate-400">{sous}</span>}
        </span>
        <span className={`text-xl text-slate-400 transition-transform ${estOuvert ? 'rotate-90' : ''}`} aria-hidden>›</span>
      </button>
      {estOuvert && <div id={id} className="border-t border-slate-100 p-4 dark:border-slate-800">{children}</div>}
    </section>
  )
}

// Petit pli à l'intérieur d'une catégorie (une règle, une étape).
function Detail({ repere, titre, children }) {
  const [ouvert, setOuvert] = useState(false)
  const id = useId()
  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <button type="button" onClick={() => setOuvert((v) => !v)} aria-expanded={ouvert} aria-controls={id} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
        {repere && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'var(--c-accent-fort)' }} aria-hidden>{repere}</span>}
        <span className="min-w-0 flex-1 text-sm font-semibold">{titre}</span>
        <span className={`text-slate-400 transition-transform ${ouvert ? 'rotate-90' : ''}`} aria-hidden>›</span>
      </button>
      {ouvert && <div id={id} className="px-3 pb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{children}</div>}
    </div>
  )
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
    <div className="space-y-3">
      <Pli icon="🎯" titre="Mon projet" sous={eg.organisation || 'Thème, organisation, problématique'} initial>
        <div className="space-y-3">
          <label className="block">
            <span className={ETIQUETTE}>Thème du programme</span>
            <select value={eg.theme || ''} onChange={(e) => maj({ theme: e.target.value })} className={CHAMP}>
              <option value="">Choisis un thème…</option>
              {themes.map((th) => <option key={th.id} value={th.name}>{th.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Organisation étudiée</span>
            <input value={eg.organisation || ''} onChange={(e) => maj({ organisation: e.target.value })} placeholder="Ex. : la boulangerie de mon quartier" className={CHAMP} maxLength={160} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Ma problématique</span>
            <textarea value={eg.problematique || ''} onChange={(e) => maj({ problematique: e.target.value })} rows={3} placeholder="Une question précise, tirée du programme." className={CHAMP} maxLength={400} />
          </label>
          {eg.problematique && !eg.problematique.trim().endsWith('?') && (
            <p className="text-xs text-amber-700 dark:text-amber-300">💡 Termine ta problématique par un point d'interrogation.</p>
          )}
        </div>
      </Pli>

      <Pli icon="📏" titre="Les règles" sous={`${CONTENU.regles.length} règles officielles`}>
        <div className="space-y-2">
          {CONTENU.regles.map((r) => <Detail key={r.h} titre={r.h}><Rich text={r.c} /></Detail>)}
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Le calendrier et la forme exacte sont fixés par ton professeur.</p>
      </Pli>

      <Pli icon="🧭" titre="La démarche" sous={`${CONTENU.demarche.length} étapes`}>
        <div className="space-y-2">
          {CONTENU.demarche.map((d, k) => <Detail key={d.h} repere={k + 1} titre={d.h}>{d.c}</Detail>)}
        </div>
      </Pli>

      <Pli icon="✅" titre="Mon dossier" sous={`${faits} / ${CONTENU.dossier.length} parties prêtes`}>
        <div className="space-y-1">
          {CONTENU.dossier.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <input type="checkbox" checked={!!coches[d.id]} onChange={(e) => maj((x) => ({ ...x, coches: { ...(x.coches || {}), [d.id]: e.target.checked } }))} className="h-4 w-4" style={{ accentColor: 'var(--c-accent-fort)' }} />
              <span className="text-sm">{d.label}</span>
            </label>
          ))}
        </div>
      </Pli>

      <Pli icon="💡" titre="Les conseils" sous={`${CONTENU.conseils.length} conseils`}>
        <ul className="list-disc space-y-1.5 pl-5 text-sm">
          {CONTENU.conseils.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </Pli>

      {themes.length > 0 && (
        <Pli icon="📖" titre="Revoir le cours" sous={`${themes.length} thèmes`}>
          <div className="grid gap-2">
            {themes.map((th) => (
              <Link key={th.id} to={`/subject/p1-sgn/theme/${th.id}`} className="rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-semibold transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700">{th.name} ›</Link>
            ))}
          </div>
        </Pli>
      )}

      <Pli icon="📜" titre="Textes officiels" sous={`${CONTENU.references.length} textes`}>
        <ul className="space-y-2 text-sm">
          {CONTENU.references.map((r) => (
            <li key={r.lien}><a href={r.lien} target="_blank" rel="noopener noreferrer" className="underline" style={LIEN}>{r.titre}</a></li>
          ))}
        </ul>
      </Pli>
    </div>
  )
}

// ---- 2. Sources ---------------------------------------------------------------
const SOURCE_VIDE = { type: '', titre: '', auteur: '', date: '', lien: '', notes: '', fiable: {} }

function Sources({ eg, maj }) {
  const sources = eg.sources || []
  const [brouillon, setBrouillon] = useState(SOURCE_VIDE)
  const [edition, setEdition] = useState(null) // id de la source modifiée
  const [formulaire, setFormulaire] = useState(sources.length === 0)
  const [erreur, setErreur] = useState('')
  const champ = (k) => (e) => setBrouillon((b) => ({ ...b, [k]: e.target.value }))

  const fermer = () => { setBrouillon(SOURCE_VIDE); setEdition(null); setErreur(''); setFormulaire(false) }
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
    fermer()
  }
  const modifier = (s) => { setBrouillon({ ...SOURCE_VIDE, ...s }); setEdition(s.id); setErreur(''); setFormulaire(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const supprimer = (id) => {
    if (!confirm('Supprimer cette source ? Les arguments qui l’utilisent n’y seront plus reliés.')) return
    maj((x) => ({ ...x, sources: (x.sources || []).filter((s) => s.id !== id), arguments: (x.arguments || []).map((a) => (a.sourceId === id ? { ...a, sourceId: '' } : a)) }))
  }
  const types = new Set(sources.map((s) => s.type).filter(Boolean))

  return (
    <div className="space-y-3">
      <Pli icon={edition ? '✏️' : '➕'} titre={edition ? 'Modifier la source' : 'Ajouter une source'} ouvert={formulaire} basculer={() => (formulaire ? fermer() : setFormulaire(true))}>
        <div className="space-y-3">
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
            <input value={brouillon.titre} onChange={champ('titre')} placeholder="Titre de l'article, de l'entretien…" className={CHAMP} maxLength={200} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Auteur ou organisme</span>
            <input value={brouillon.auteur} onChange={champ('auteur')} placeholder="Ex. : INSEE, la gérante du magasin" className={CHAMP} maxLength={120} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Lien (si la source est en ligne)</span>
            <input value={brouillon.lien} onChange={champ('lien')} placeholder="https://…" className={CHAMP} maxLength={400} inputMode="url" />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Ce que j'en retiens</span>
            <textarea value={brouillon.notes} onChange={champ('notes')} rows={3} placeholder="Faits, chiffres ou citations utiles." className={CHAMP} maxLength={1500} />
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
            {edition && <button onClick={fermer} className="btn-ghost">Annuler</button>}
          </div>
        </div>
      </Pli>

      <h2 className="px-1 pt-2 font-display text-xl font-medium">📚 Mes sources ({sources.length})</h2>
      {sources.length === 0 && <p className="card p-4 text-center text-sm text-slate-500 dark:text-slate-400">Aucune source pour l'instant.</p>}
      {sources.length >= 2 && types.size < 2 && (
        <p className="px-1 text-xs text-amber-700 dark:text-amber-300">💡 Varie tes sources : documents et terrain (entretien, questionnaire, observation).</p>
      )}
      {sources.map((s, k) => {
        const score = CONTENU.fiabilite.filter((f) => s.fiable?.[f.id]).length
        return (
          <Pli key={s.id} titre={`[${k + 1}] ${s.titre}`} sous={`${s.type ? `${s.type} · ` : ''}Fiabilité ${score}/3`}>
            <p className="text-sm text-slate-600 dark:text-slate-300 [overflow-wrap:anywhere]">{citation(s)}</p>
            {s.notes && <p className="mt-2 whitespace-pre-line text-sm">{s.notes}</p>}
            <div className="mt-3 flex gap-3 text-sm">
              <button onClick={() => modifier(s)} className="font-semibold underline" style={LIEN}>Modifier</button>
              <button onClick={() => supprimer(s.id)} className="font-semibold text-rose-600 underline dark:text-rose-400">Supprimer</button>
            </div>
          </Pli>
        )
      })}
    </div>
  )
}

// ---- 3. Arguments A-E-I -------------------------------------------------------
const ARGUMENT_VIDE = { a: '', e: '', notion: '', i: '', sourceId: '', eval: {} }

function Arguments({ eg, maj, versSources }) {
  const t = useT()
  const sources = eg.sources || []
  const args = eg.arguments || []
  const [brouillon, setBrouillon] = useState(ARGUMENT_VIDE)
  const [edition, setEdition] = useState(null)
  const [formulaire, setFormulaire] = useState(args.length === 0)
  const [exemple, setExemple] = useState(false)
  const [erreur, setErreur] = useState('')
  const champ = (k) => (e) => setBrouillon((b) => ({ ...b, [k]: e.target.value }))
  const ETAPES = CONTENU.aei.etapes
  const globale = noteGlobale(args, sources)

  const fermer = () => { setBrouillon(ARGUMENT_VIDE); setEdition(null); setErreur(''); setFormulaire(false) }
  const enregistrer = () => {
    if (!brouillon.a.trim()) { setErreur('Commence par l’affirmation : c’est l’idée que tu défends.'); return }
    maj((x) => ({
      ...x,
      arguments: edition
        ? (x.arguments || []).map((a) => (a.id === edition ? { ...a, ...brouillon, id: edition } : a))
        : [...(x.arguments || []), { ...brouillon, id: nouvelId() }],
    }))
    fermer()
  }
  const changer = (id, patch) => maj((x) => ({ ...x, arguments: (x.arguments || []).map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
  const deplacer = (k, sens) => maj((x) => {
    const liste = [...(x.arguments || [])]
    const j = k + sens
    if (j < 0 || j >= liste.length) return x
    ;[liste[k], liste[j]] = [liste[j], liste[k]]
    return { ...x, arguments: liste }
  })
  const supprimer = (id) => { if (confirm('Supprimer cet argument ?')) maj((x) => ({ ...x, arguments: (x.arguments || []).filter((a) => a.id !== id) })) }
  const modifier = (a) => { setBrouillon({ ...ARGUMENT_VIDE, ...a }); setEdition(a.id); setErreur(''); setFormulaire(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="space-y-3">
      <section className="card p-4" style={{ boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-accent) 35%, transparent)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ma problématique</p>
        <p className="mt-1 font-display text-lg">{eg.problematique || 'À écrire dans l’onglet « Consignes ».'}</p>
      </section>

      <Pli icon="🧩" titre="La méthode A-E-I" sous="Affirmation · Explication · Illustration">
        <div className="space-y-2">
          {ETAPES.map((et) => (
            <Detail key={et.id} repere={et.lettre} titre={et.h}>
              {et.c}
              {exemple && <span className="mt-1 block italic text-slate-600 dark:text-slate-300">Exemple : {et.exemple}</span>}
            </Detail>
          ))}
        </div>
        <button onClick={() => setExemple((v) => !v)} className="mt-3 text-sm font-semibold underline" style={LIEN}>{exemple ? 'Masquer les exemples' : 'Ajouter un exemple à chaque étape'}</button>
      </Pli>

      <Pli icon={edition ? '✏️' : '➕'} titre={edition ? 'Modifier l’argument' : 'Nouvel argument'} ouvert={formulaire} basculer={() => (formulaire ? fermer() : setFormulaire(true))}>
        <div className="space-y-3">
          <label className="block">
            <span className={ETIQUETTE}>A — Affirmation *</span>
            <textarea value={brouillon.a} onChange={champ('a')} rows={2} placeholder="L'idée que tu défends, en une phrase." className={CHAMP} maxLength={400} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>E — Explication</span>
            <textarea value={brouillon.e} onChange={champ('e')} rows={3} placeholder="Pourquoi et comment c'est vrai." className={CHAMP} maxLength={1200} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Notion du cours utilisée</span>
            <input value={brouillon.notion} onChange={champ('notion')} placeholder="Ex. : valeur ajoutée, risque…" className={CHAMP} maxLength={120} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>I — Illustration</span>
            <textarea value={brouillon.i} onChange={champ('i')} rows={3} placeholder="Un fait, un chiffre, un exemple de ton organisation." className={CHAMP} maxLength={1200} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>Source de l'illustration</span>
            <select value={brouillon.sourceId} onChange={champ('sourceId')} className={CHAMP}>
              <option value="">Aucune source</option>
              {sources.map((s, k) => <option key={s.id} value={s.id}>[{k + 1}] {s.titre}</option>)}
            </select>
          </label>
          {sources.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">Pas encore de source : <button onClick={versSources} className="font-semibold underline" style={LIEN}>ajoute-la dans l'onglet Sources</button>.</p>
          )}
          {erreur && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{erreur}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={enregistrer} className="btn-primary" style={{ backgroundColor: 'var(--c-accent-fort)' }}>{edition ? 'Enregistrer' : 'Ajouter l’argument'}</button>
            {edition && <button onClick={fermer} className="btn-ghost">Annuler</button>}
          </div>
        </div>
      </Pli>

      <h2 className="px-1 pt-2 font-display text-xl font-medium">🗂️ Mes arguments ({args.length})</h2>
      {globale != null && (
        <section className="card flex items-center gap-4 p-4">
          <span className="font-display text-3xl font-semibold" style={LIEN}>{virgule(globale)}<span className="text-base">/20</span></span>
          <span className="text-sm text-slate-600 dark:text-slate-300">Note de tes arguments : la moyenne de tes grilles A-E-I. Ouvre un argument pour l'évaluer.</span>
        </section>
      )}
      {args.length === 0 && <p className="card p-4 text-center text-sm text-slate-500 dark:text-slate-400">Aucun argument pour l'instant.</p>}
      {args.map((a, k) => {
        const src = sources.find((s) => s.id === a.sourceId)
        const note = noteArgument(a, sources)
        return (
          <Pli key={a.id} titre={`${k + 1}. ${a.a}`} sous={`Note : ${note}/${GRILLE.length}`}>
            <div className="space-y-2 text-sm">
              {a.e && <p><b>Explication.</b> {a.e}{a.notion && <span className="text-slate-500 dark:text-slate-400"> (notion : {a.notion})</span>}</p>}
              {a.i && <p><b>Illustration.</b> {a.i}</p>}
              {src && <p className="text-xs text-slate-500 dark:text-slate-400 [overflow-wrap:anywhere]">📎 {citation(src)}</p>}
            </div>

            <fieldset className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <legend className="px-1 text-sm font-semibold">Évaluer cet argument</legend>
              <div className="space-y-1.5">
                {GRILLE.map((c) => {
                  const ecrit = !c.auto && !!String(a[c.id] || '').trim()
                  const coche = critereRempli(c, a, sources)
                  return (
                    <label key={c.id} className={`flex items-start gap-2 text-sm ${!c.auto && !ecrit ? 'opacity-60' : ''}`}>
                      <input type="checkbox" checked={coche} disabled={!!c.auto || !ecrit}
                        onChange={(e) => changer(a.id, { eval: { ...(a.eval || {}), [c.id]: e.target.checked } })}
                        className="mt-0.5 h-4 w-4 shrink-0" style={{ accentColor: 'var(--c-accent-fort)' }} />
                      <span><b>{c.etape}</b> · {c.label}{c.auto ? ' (vérifié automatiquement)' : ''}</span>
                    </label>
                  )
                })}
              </div>
              <p className="mt-2 text-sm font-semibold">Note : {note}/{GRILLE.length}</p>
            </fieldset>

            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <button onClick={() => deplacer(k, -1)} disabled={k === 0} className="disabled:opacity-40" aria-label="Monter">↑</button>
              <button onClick={() => deplacer(k, 1)} disabled={k === args.length - 1} className="disabled:opacity-40" aria-label="Descendre">↓</button>
              <button onClick={() => modifier(a)} className="font-semibold underline" style={LIEN}>Modifier</button>
              <button onClick={() => supprimer(a.id)} className="font-semibold text-rose-600 underline dark:text-rose-400">Supprimer</button>
            </div>
          </Pli>
        )
      })}

      {(args.length > 0 || sources.length > 0) && (
        <button onClick={() => telecharger('etude-de-gestion.txt', dossierTexte(eg))} className="btn-gold w-full !py-3">⬇️ {t('egDownload')}</button>
      )}
    </div>
  )
}
