import { TextePublic } from '../localisation/PublicText.jsx'
import { useId, useState } from 'react'
import { commun } from '../content/contenu.js'
import { Rich } from './ui.jsx'

// Briques communes aux projets accompagnés (étude de gestion en Première, Grand
// Oral en Terminale) : blocs repliables, onglets Sources, Analyse (tableau de
// caractérisation, diagnostic interne et externe, PESTEL) et Arguments A-E-I
// évalués avec une grille. Chaque page fournit son dossier `d` et sa fonction
// `maj`, qui accepte un objet partiel ou une fonction (dossier → dossier).
const OUTILS = commun('outils-projet')
export const CHAMP = 'w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-[color:var(--c-accent)] dark:border-slate-700'
export const ETIQUETTE = 'mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300'
export const LIEN = { color: 'var(--c-accent-texte)' }
const nouvelId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const lienValide = (s) => !s || /^https?:\/\/[^\s.]+\.[^\s]+$/i.test(s.trim())
export const virgule = (n) => String(n).replace('.', ',')
// Une idée par ligne dans les cases du diagnostic et du PESTEL.
const idees = (txt) => String(txt || '').split('\n').map((s) => s.trim()).filter(Boolean)

// « Auteur, « Titre », date, lien » : la façon de citer une source dans le dossier.
export function citation(src) {
  return [src.auteur, src.titre && `« ${src.titre} »`, src.date, src.lien].filter(Boolean).join(', ')
}

// Grille A-E-I d'un argument : chaque critère vaut 1 point. Les critères « auto »
// se vérifient tout seuls (notion renseignée, source reliée) ; les autres sont
// cochés par l'élève, et seulement si la partie concernée (`champ`, par défaut
// l'id du critère) est écrite.
export function critereRempli(critere, arg, sources = []) {
  if (critere.auto === 'notion') return !!String(arg.notion || '').trim()
  if (critere.auto === 'source') return !!arg.sourceId && sources.some((s) => s.id === arg.sourceId)
  return !!String(arg[critere.champ || critere.id] || '').trim() && !!arg.eval?.[critere.id]
}
export function noteArgument(arg, sources, grille) {
  return grille.filter((c) => critereRempli(c, arg, sources)).length
}
// Note sur 20 : la moyenne des grilles, ramenée sur 20 (au demi-point).
export function noteGlobale(args, sources, grille) {
  if (!args?.length) return null
  const moyenne = args.reduce((n, a) => n + noteArgument(a, sources, grille), 0) / args.length
  return Math.round((moyenne / grille.length) * 20 * 2) / 2
}

// ---- Export texte ---------------------------------------------------------------
export function analyseTexte(analyse = {}) {
  const lignes = []
  const liste = (titre, txt) => lignes.push(`${titre} :`, ...idees(txt).map((i) => `   - ${i}`))
  const carac = analyse.carac || {}
  const remplies = OUTILS.caracterisation.lignes.filter((l) => String(carac[l.id] || '').trim())
  if (remplies.length) {
    lignes.push('', "CARACTÉRISATION DE L'ORGANISATION")
    for (const l of remplies) lignes.push(`${l.label} : ${idees(carac[l.id]).join(' ; ')}`)
  }
  const swot = analyse.swot || {}
  for (const [titre, ids] of [['DIAGNOSTIC INTERNE', ['forces', 'faiblesses']], ['DIAGNOSTIC EXTERNE', ['opportunites', 'menaces']]]) {
    const cases = OUTILS.diagnostic.cases.filter((c) => ids.includes(c.id) && idees(swot[c.id]).length)
    if (cases.length) lignes.push('', titre)
    for (const c of cases) liste(c.label, swot[c.id])
  }
  const pestel = analyse.pestel || {}
  const facteurs = OUTILS.pestel.facteurs.filter((f) => idees(pestel[f.id]).length)
  if (facteurs.length) lignes.push('', 'PESTEL')
  for (const f of facteurs) liste(`${f.lettre} — ${f.label}`, pestel[f.id])
  return lignes
}

export function argumentsTexte(args, sources, grille) {
  const numero = (id) => sources.findIndex((s) => s.id === id) + 1
  return args.flatMap((a, k) => [
    '',
    `${k + 1}. ${a.a || '(affirmation à écrire)'}`,
    ...(a.e ? [`   Explication : ${a.e}${a.notion ? ` (notion : ${a.notion})` : ''}`] : []),
    ...(a.i ? [`   Illustration : ${a.i}${a.sourceId && numero(a.sourceId) > 0 ? ` [source ${numero(a.sourceId)}]` : ''}`] : []),
    `   Auto-évaluation : ${noteArgument(a, sources, grille)}/${grille.length}`,
  ])
}

export function sourcesTexte(sources) {
  return ['', 'SOURCES', ...sources.map((s, k) => `[${k + 1}] ${s.type ? `${s.type} — ` : ''}${citation(s)}`)]
}

export function aDuContenu(d) {
  return !!((d.arguments || []).length || (d.sources || []).length || analyseTexte(d.analyse).length)
}

export function telecharger(nom, texte) {
  const url = URL.createObjectURL(new Blob([texte], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---- Blocs repliables et onglets ------------------------------------------------
// Bloc repliable : un titre (et une ligne de résumé) ; le contenu se déploie au
// toucher. `ouvert` + `basculer` permettent de le piloter depuis le parent.
export function Pli({ icon, titre, sous, initial = false, ouvert, basculer, children }) {
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
export function Detail({ repere, titre, children }) {
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

export function Onglets({ onglets, actif, choisir, label, nb = {} }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label={label}>
      {onglets.map((o) => {
        const est = actif === o.id
        return (
          <button key={o.id} role="tab" aria-selected={est} onClick={() => choisir(o.id)}
            className={`rounded-xl px-1.5 py-2.5 text-xs font-semibold transition sm:text-sm ${est ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
            style={est ? { backgroundColor: 'var(--c-accent-fort)' } : undefined}>
            <span aria-hidden>{o.icon}</span> {o.label}{nb[o.id] ? ` (${nb[o.id]})` : ''}
          </button>
        )
      })}
    </div>
  )
}

// ---- Sources --------------------------------------------------------------------
const SOURCE_VIDE = { type: '', titre: '', auteur: '', date: '', lien: '', notes: '', fiable: {} }

export function OngletSources({ d, maj }) {
  const sources = d.sources || []
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
                {OUTILS.typesSources.map((ty) => <option key={ty}>{ty}</option>)}
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
              {OUTILS.fiabilite.map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!brouillon.fiable?.[f.id]} onChange={(e) => setBrouillon((b) => ({ ...b, fiable: { ...(b.fiable || {}), [f.id]: e.target.checked } }))} className="h-4 w-4" style={{ accentColor: 'var(--c-accent-fort)' }} />
                  <TextePublic text={f.label} />
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
        const score = OUTILS.fiabilite.filter((f) => s.fiable?.[f.id]).length
        return (
          <Pli key={s.id} titre={`[${k + 1}] ${s.titre}`} sous={`${s.type ? `${s.type} · ` : ''}Fiabilité ${score}/${OUTILS.fiabilite.length}`}>
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

// ---- Analyse : caractérisation, diagnostic interne et externe, PESTEL -----------
const CARAC = OUTILS.caracterisation
const DIAG = OUTILS.diagnostic
const PESTEL = OUTILS.pestel
const rempli = (obj, liste) => liste.filter((x) => String(obj[x.id] || '').trim()).length

export function OngletAnalyse({ d, maj }) {
  const base = useId()
  const an = d.analyse || {}
  const carac = an.carac || {}
  const swot = an.swot || {}
  const pestel = an.pestel || {}
  const ecrire = (partie, cle) => (e) => {
    const v = e.target.value
    maj((x) => {
      const a = x.analyse || {}
      return { ...x, analyse: { ...a, [partie]: { ...(a[partie] || {}), [cle]: v } } }
    })
  }

  return (
    <div className="space-y-3">
      <section className="card p-4">
        <label className="block">
          <span className={ETIQUETTE}>Organisation étudiée</span>
          <input value={d.organisation || ''} onChange={(e) => maj({ organisation: e.target.value })} placeholder="Ex. : la boulangerie de mon quartier" className={CHAMP} maxLength={160} />
        </label>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Trois outils du cours de management pour analyser ton organisation. Chaque tableau se déploie quand tu appuies dessus.</p>
      </section>

      <Pli icon="🏢" titre="Tableau de caractérisation" sous={`${rempli(carac, CARAC.lignes)} / ${CARAC.lignes.length} lignes remplies`}>
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-300"><TextePublic text={CARAC.intro} /></p>
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Caractérisation de {d.organisation || 'l’organisation'}</caption>
          <tbody>
            {CARAC.lignes.map((l) => {
              const id = `${base}-c-${l.id}`
              return (
                <tr key={l.id} className="border-t border-slate-100 align-top dark:border-slate-800">
                  <th scope="row" className="w-[32%] py-2.5 pr-3 text-left">
                    <label htmlFor={id} className="text-sm font-semibold"><TextePublic text={l.label} /></label>
                  </th>
                  <td className="py-2.5">
                    {l.long
                      ? <textarea id={id} value={carac[l.id] || ''} onChange={ecrire('carac', l.id)} rows={3} placeholder={l.exemple} aria-describedby={`${id}-aide`} className={CHAMP} maxLength={600} />
                      : <input id={id} value={carac[l.id] || ''} onChange={ecrire('carac', l.id)} list={l.choix ? `${id}-choix` : undefined} placeholder={l.exemple || (l.choix ? 'Choisis ou écris…' : '')} aria-describedby={`${id}-aide`} className={CHAMP} maxLength={200} />}
                    {l.choix && <datalist id={`${id}-choix`}>{l.choix.map((c) => <option key={c} value={c} />)}</datalist>}
                    <span id={`${id}-aide`} className="mt-1 block text-xs text-slate-500 dark:text-slate-400"><TextePublic text={l.aide} /></span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Pli>

      <Pli icon="🔍" titre="Diagnostic interne et externe" sous={`${rempli(swot, DIAG.cases)} / ${DIAG.cases.length} cases remplies · forces, faiblesses, opportunités, menaces`}>
        <div className="space-y-2">
          {DIAG.methode.map((m) => <Detail key={m.h} titre={<TextePublic text={m.h} />}><Rich translate text={m.c} /></Detail>)}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {DIAG.cases.map((c) => {
            const id = `${base}-d-${c.id}`
            const couleur = c.signe === '+' ? '#059669' : '#e11d48'
            return (
              <div key={c.id} className="rounded-xl p-3" style={{ backgroundColor: `color-mix(in srgb, ${couleur} 9%, transparent)` }}>
                <div className="flex items-baseline justify-between gap-2">
                  <label htmlFor={id} className="font-semibold">{c.signe} <TextePublic text={c.label} /></label>
                  <span className="text-xs text-slate-600 dark:text-slate-300"><TextePublic text={c.cote} /></span>
                </div>
                <p id={`${id}-aide`} className="mb-1.5 mt-0.5 text-xs text-slate-600 dark:text-slate-300"><TextePublic text={c.aide} /> Une idée par ligne.</p>
                <textarea id={id} value={swot[c.id] || ''} onChange={ecrire('swot', c.id)} rows={4} placeholder={c.exemple} aria-describedby={`${id}-aide`} className={`${CHAMP} bg-white/60 dark:bg-slate-900/40`} maxLength={1200} />
              </div>
            )
          })}
        </div>
      </Pli>

      <Pli icon="🌍" titre="PESTEL" sous={`${rempli(pestel, PESTEL.facteurs)} / ${PESTEL.facteurs.length} facteurs analysés`}>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300"><TextePublic text={PESTEL.intro} /></p>
        <div className="space-y-3">
          {PESTEL.facteurs.map((f) => {
            const id = `${base}-p-${f.id}`
            return (
              <div key={f.id} className="flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full font-bold text-white" style={{ backgroundColor: 'var(--c-accent-fort)' }} aria-hidden>{f.lettre}</span>
                <div className="min-w-0 flex-1">
                  <label htmlFor={id} className="block text-sm font-semibold"><TextePublic text={f.label} /></label>
                  <p id={`${id}-aide`} className="mb-1.5 text-xs text-slate-500 dark:text-slate-400"><TextePublic text={f.aide} /></p>
                  <textarea id={id} value={pestel[f.id] || ''} onChange={ecrire('pestel', f.id)} rows={2} placeholder="Une idée par ligne." aria-describedby={`${id}-aide`} className={CHAMP} maxLength={1200} />
                </div>
              </div>
            )
          })}
        </div>
      </Pli>
    </div>
  )
}

// ---- Arguments A-E-I ------------------------------------------------------------
const ARGUMENT_VIDE = { a: '', e: '', notion: '', i: '', sourceId: '', eval: {} }

// `questions` (Grand Oral) : [{ id, label, texte }] — chaque argument est alors
// rattaché à une question, et la liste est rangée par question.
export function OngletArguments({ d, maj, grille, aei, entete, notion, questions, versSources }) {
  const sources = d.sources || []
  const args = d.arguments || []
  const vide = { ...ARGUMENT_VIDE, ...(questions ? { question: questions[0].id } : {}) }
  const [brouillon, setBrouillon] = useState(vide)
  const [edition, setEdition] = useState(null)
  const [formulaire, setFormulaire] = useState(args.length === 0)
  const [exemple, setExemple] = useState(false)
  const [erreur, setErreur] = useState('')
  const champ = (k) => (e) => setBrouillon((b) => ({ ...b, [k]: e.target.value }))
  const globale = noteGlobale(args, sources, grille)
  const groupe = (a) => (questions ? (questions.some((q) => q.id === a.question) ? a.question : questions[0].id) : '')

  const fermer = () => { setBrouillon(vide); setEdition(null); setErreur(''); setFormulaire(false) }
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
  // Monter ou descendre un argument parmi ceux de la même question.
  const deplacer = (id, sens) => maj((x) => {
    const liste = [...(x.arguments || [])]
    const k = liste.findIndex((a) => a.id === id)
    const voisins = liste.map((a, j) => j).filter((j) => groupe(liste[j]) === groupe(liste[k]))
    const j = voisins[voisins.indexOf(k) + sens]
    if (j === undefined) return x
    ;[liste[k], liste[j]] = [liste[j], liste[k]]
    return { ...x, arguments: liste }
  })
  const supprimer = (id) => { if (confirm('Supprimer cet argument ?')) maj((x) => ({ ...x, arguments: (x.arguments || []).filter((a) => a.id !== id) })) }
  const modifier = (a) => { setBrouillon({ ...vide, ...a, ...(questions ? { question: groupe(a) } : {}) }); setEdition(a.id); setErreur(''); setFormulaire(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const groupes = questions
    ? questions.map((q) => ({ ...q, liste: args.filter((a) => groupe(a) === q.id) }))
    : [{ id: '', liste: args }]

  return (
    <div className="space-y-3">
      {entete}

      <Pli icon="🧩" titre="La méthode A-E-I" sous="Affirmation · Explication · Illustration">
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-300"><TextePublic text={aei.intro} /></p>
        <div className="space-y-2">
          {aei.etapes.map((et) => (
            <Detail key={et.id} repere={et.lettre} titre={<TextePublic text={et.h} />}>
              <TextePublic text={et.c} />
              {exemple && <span className="mt-1 block italic text-slate-600 dark:text-slate-300">Exemple : <TextePublic text={et.exemple} /></span>}
            </Detail>
          ))}
        </div>
        <button onClick={() => setExemple((v) => !v)} className="mt-3 text-sm font-semibold underline" style={LIEN}>{exemple ? 'Masquer les exemples' : 'Ajouter un exemple à chaque étape'}</button>
      </Pli>

      <Pli icon={edition ? '✏️' : '➕'} titre={edition ? 'Modifier l’argument' : 'Nouvel argument'} ouvert={formulaire} basculer={() => (formulaire ? fermer() : setFormulaire(true))}>
        <div className="space-y-3">
          {questions && (
            <label className="block">
              <span className={ETIQUETTE}>Pour quelle question ?</span>
              <select value={brouillon.question} onChange={champ('question')} className={CHAMP}>
                {questions.map((q) => <option key={q.id} value={q.id}>{q.label}{q.texte ? ` — ${q.texte.length > 60 ? `${q.texte.slice(0, 60)}…` : q.texte}` : ''}</option>)}
              </select>
            </label>
          )}
          <label className="block">
            <span className={ETIQUETTE}>A — Affirmation *</span>
            <textarea value={brouillon.a} onChange={champ('a')} rows={2} placeholder="L'idée que tu défends, en une phrase." className={CHAMP} maxLength={400} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>E — Explication</span>
            <textarea value={brouillon.e} onChange={champ('e')} rows={3} placeholder="Pourquoi et comment c'est vrai." className={CHAMP} maxLength={1200} />
          </label>
          <label className="block">
            <span className={ETIQUETTE}>{notion.label}</span>
            <input value={brouillon.notion} onChange={champ('notion')} placeholder={notion.exemple} className={CHAMP} maxLength={120} />
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
          <span className="text-sm text-slate-600 dark:text-slate-300">Note de tes arguments : la moyenne de tes grilles. Ouvre un argument pour l'évaluer.</span>
        </section>
      )}
      {args.length === 0 && <p className="card p-4 text-center text-sm text-slate-500 dark:text-slate-400">Aucun argument pour l'instant.</p>}
      {args.length > 0 && groupes.map((g) => {
        const note = noteGlobale(g.liste, sources, grille)
        return (
          <div key={g.id} className="space-y-3">
            {questions && (
              <h3 className="px-1 pt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {g.label}{g.texte ? ` : ${g.texte}` : ''} <span className="font-normal text-slate-500 dark:text-slate-400">· {g.liste.length ? `${g.liste.length} argument${g.liste.length > 1 ? 's' : ''}, ${virgule(note)}/20` : 'aucun argument'}</span>
              </h3>
            )}
            {g.liste.map((a, k) => (
              <CarteArgument key={a.id} a={a} k={k} dernier={k === g.liste.length - 1} sources={sources} grille={grille}
                changer={changer} deplacer={deplacer} modifier={modifier} supprimer={supprimer} />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function CarteArgument({ a, k, dernier, sources, grille, changer, deplacer, modifier, supprimer }) {
  const src = sources.find((s) => s.id === a.sourceId)
  const note = noteArgument(a, sources, grille)
  return (
    <Pli titre={`${k + 1}. ${a.a}`} sous={`Note : ${note}/${grille.length}`}>
      <div className="space-y-2 text-sm">
        {a.e && <p><b>Explication.</b> {a.e}{a.notion && <span className="text-slate-500 dark:text-slate-400"> (notion : {a.notion})</span>}</p>}
        {a.i && <p><b>Illustration.</b> {a.i}</p>}
        {src && <p className="text-xs text-slate-500 dark:text-slate-400 [overflow-wrap:anywhere]">📎 {citation(src)}</p>}
      </div>

      <fieldset className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
        <legend className="px-1 text-sm font-semibold">Évaluer cet argument</legend>
        <div className="space-y-1.5">
          {grille.map((c) => {
            const ecrit = !c.auto && !!String(a[c.champ || c.id] || '').trim()
            const coche = critereRempli(c, a, sources)
            return (
              <label key={c.id} className={`flex items-start gap-2 text-sm ${!c.auto && !ecrit ? 'opacity-60' : ''}`}>
                <input type="checkbox" checked={coche} disabled={!!c.auto || !ecrit}
                  onChange={(e) => changer(a.id, { eval: { ...(a.eval || {}), [c.id]: e.target.checked } })}
                  className="mt-0.5 h-4 w-4 shrink-0" style={{ accentColor: 'var(--c-accent-fort)' }} />
                <span><b><TextePublic text={c.etape} /></b> · <TextePublic text={c.label} />{c.auto ? ' (vérifié automatiquement)' : ''}</span>
              </label>
            )
          })}
        </div>
        <p className="mt-2 text-sm font-semibold">Note : {note}/{grille.length}</p>
      </fieldset>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <button onClick={() => deplacer(a.id, -1)} disabled={k === 0} className="disabled:opacity-40" aria-label="Monter">↑</button>
        <button onClick={() => deplacer(a.id, 1)} disabled={dernier} className="disabled:opacity-40" aria-label="Descendre">↓</button>
        <button onClick={() => modifier(a)} className="font-semibold underline" style={LIEN}>Modifier</button>
        <button onClick={() => supprimer(a.id)} className="font-semibold text-rose-600 underline dark:text-rose-400">Supprimer</button>
      </div>
    </Pli>
  )
}
