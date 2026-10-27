import {Link} from 'react-router-dom'
import {readNoteDraft,writeNoteDraft,clearNoteDraft} from '../data/noteDraft.js'
import NoteRevision from '../components/NoteRevision.jsx'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { getSubject } from '../data/index.js'
import { subjectsForTrack } from '../data/tracks.js'
import { todayKey } from '../data/srs.js'
import { useT, useLang, usePublicText } from '../i18n.js'
import { Empty } from '../components/ui.jsx'
import { lireNote, formaterNote, nouvelleNote, notesParMatiere, aAmeliorer, TOUTE_LA_MATIERE, SOUS_LA_MOYENNE } from '../notesClasse.js'

const champ = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--c-accent)] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800'

// « Mes notes de classe » : l'élève saisit la note reçue en classe ; la matière,
// puis le chapitre, se choisissent dans des menus tirés des cours de sa filière.
// L'offre gratuite dit ce qu'il faut améliorer (notesClasse.js), sans plus.
export default function MesNotes(){
  const {state}=useStore()
  return <MesNotesForm key={state.account?.id||'guest'}/>
}
function MesNotesForm() {
  const { state, ajouterNoteClasse, retirerNoteClasse } = useStore()
  const t = useT()
  const tr = usePublicText()
  const lang = useLang()
  const matieres = useMemo(() => subjectsForTrack(state.track).filter(Boolean), [state.track])
  const [draft] = useState(()=>readNoteDraft(state.account?.id))
  const [draftSaved,setDraftSaved]=useState(true)
  const [saisie, setSaisie] = useState(draft?.saisie||'')
  const [matiere, setMatiere] = useState(draft?.matiere||'')
  const [chapitre, setChapitre] = useState(draft?.chapitre||'')
  const [date, setDate] = useState(draft?.date||todayKey())
  const [erreur, setErreur] = useState('')
  const [questionsManquees, setQuestionsManquees] = useState(draft?.questionsManquees||'')
  const [revision, setRevision] = useState(draft?.revision||null)
  const [analysisBusy, setAnalysisBusy] = useState(false)
  const [ajoutee, setAjoutee] = useState(false)
  useEffect(()=>{
    if(!saisie&&!questionsManquees&&!revision&&!matiere&&!chapitre){clearNoteDraft(state.account?.id);return}
    setDraftSaved(writeNoteDraft(state.account?.id,{saisie,matiere,chapitre,date,questionsManquees,revision}))
  },[saisie,matiere,chapitre,date,questionsManquees,revision,state.account?.id])
  if (!state.track) return <Navigate to="/" replace />

  const aujourdhui = todayKey()
  const notes = state.notesClasse || []
  const choisie = matieres.find((s) => s.id === matiere)
  const sujet = (id) => matieres.find((s) => s.id === id) || getSubject(id)
  const nomChapitre = (sid, cid) => sujet(sid)?.chapters?.find((c) => c.id === cid)?.name || cid
  const note = (n) => `${formaterNote(n, lang)}/20`
  const jour = (d) => {
    try { return new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(`${d}T12:00:00`)) } catch { return d }
  }

  const ajouter = (e) => {
    e.preventDefault()
    setAjoutee(false)
    const valeur = lireNote(saisie)
    if (valeur == null) return setErreur('note')
    if (!choisie) return setErreur('matiere')
    if (!chapitre) return setErreur('chapitre')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > aujourdhui) return setErreur('date')
    ajouterNoteClasse(nouvelleNote({ note: valeur, matiere, chapitre, date, questionsManquees, revision }))
    setErreur('')
    setSaisie('')
    setQuestionsManquees('')
    setRevision(null)
    setChapitre('')
    setAjoutee(true)
  }

  const retirer = (n) => {
    if (confirm(tr('Supprimer cette note ?'))) retirerNoteClasse(n.id)
  }

  const priorites = aAmeliorer(notes)
  const groupes = notesParMatiere(notes, matieres)

  return (
    <div className="animate-lux space-y-5">
      <header className="page-hero page-hero-compact">
        <h1 className="font-display text-3xl font-medium leading-tight">📝 Mes notes de classe</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ajoute ta note et tes questions manquées, ou dépose ton sujet et ta copie. Le bilan expliqué et l’analyse de copie sont prévus dans Premium ; ils restent accessibles aux comptes connectés pendant le développement.</p>
      </header>
      <p className="text-sm"><Link to="/exemple-bilan" className="underline">Voir un exemple de bilan</Link> · <Link to="/offres" className="underline">Comparer les offres</Link></p>
      <hr className="rule-gold" />

      <form onSubmit={ajouter} noValidate className="card space-y-3 p-4" aria-labelledby="titre-ajout">
        <fieldset disabled={analysisBusy} className="space-y-3"><h2 id="titre-ajout" className="font-display text-lg font-semibold">Ajouter une note</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="note-valeur" className="block text-sm font-medium">Note sur 20</label>
            <input id="note-valeur" value={saisie} onChange={(e) => { setSaisie(e.target.value); setAjoutee(false) }} inputMode="decimal" autoComplete="off" maxLength={5} placeholder="15,50" className={`${champ} mt-1`} />
          </div>
          <div>
            <label htmlFor="note-date" className="block text-sm font-medium">Date du devoir</label>
            <input id="note-date" type="date" value={date} max={aujourdhui} onChange={(e) => setDate(e.target.value)} className={`${champ} mt-1`} />
          </div>
          <div>
            <label htmlFor="note-matiere" className="block text-sm font-medium">Matière</label>
            <select id="note-matiere" value={matiere} onChange={(e) => { setMatiere(e.target.value); setChapitre(''); setRevision(null) }} className={`${champ} mt-1`}>
              <option value="">— {t('chooseSubject')} —</option>
              {matieres.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="note-chapitre" className="block text-sm font-medium">Chapitre</label>
            <select id="note-chapitre" value={chapitre} onChange={(e) => { setChapitre(e.target.value); setRevision(null) }} disabled={!choisie} className={`${champ} mt-1`}>
              <option value="">— {t('chooseChapterShort')} —</option>
              {(choisie?.chapters || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              {choisie && <option value={TOUTE_LA_MATIERE}>Toute la matière (bac blanc, devoir commun)</option>}
            </select>
          </div>
        </div>
        <label className="block text-sm font-medium" htmlFor="questions-manquees">Question(s) manquée(s) · facultatif
          <textarea id="questions-manquees" rows={4} maxLength={6000} value={questionsManquees} onChange={e => { setQuestionsManquees(e.target.value); setRevision(null) }} className={`${champ} mt-1`} placeholder="Ex. Question 3 : je n’ai pas su calculer la TVA déductible…" />
        </label>
        </fieldset>
        <NoteRevision key={`${matiere}:${chapitre}:${state.account?.id}`} subject={matiere} chapter={chapitre} missed={questionsManquees} owner={state.account?.id} result={revision} onResult={setRevision} onBusy={setAnalysisBusy} />
        {erreur && (
          <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-400">
            {erreur === 'note' ? 'Écris une note sur 20, par exemple 15,50.' : erreur === 'matiere' ? 'Choisis la matière.' : erreur === 'chapitre' ? 'Choisis le chapitre.' : 'Choisis le jour du devoir, au plus tard aujourd’hui.'}
          </p>
        )}
        {ajoutee && !erreur && <p role="status" className="text-sm font-medium text-emerald-600 dark:text-emerald-400">✓ Note ajoutée</p>}
        <button type="submit" disabled={analysisBusy} className="btn-primary w-full sm:w-auto">Ajouter</button>
        <p role="status" className="text-xs text-slate-600 dark:text-slate-300">{draftSaved?'Ton brouillon et ton bilan restent dans cet onglet après rechargement. Ajoute la note pour les sauvegarder avec ta progression. Les fichiers doivent être sélectionnés à nouveau après rechargement.':'Le brouillon ne peut pas être conservé sur cet appareil. Copie tes questions avant de quitter cette page.'}</p>
      </form>

      <section aria-labelledby="titre-ameliorer" className="space-y-3">
        <h2 id="titre-ameliorer" className="px-1 font-display text-xl font-medium">🎯 Ce qu’il faut améliorer</h2>
        {notes.length === 0 ? (
          <Empty icon="📝">Ajoute ta première note : tu verras ici les chapitres à retravailler.</Empty>
        ) : priorites.length === 0 ? (
          <p className="card p-4 text-sm text-slate-600 dark:text-slate-300">
            Rien à retravailler en priorité : aucune moyenne de chapitre sous {SOUS_LA_MOYENNE}/20. Note plusieurs chapitres d’une même matière pour voir ton point le plus faible.
          </p>
        ) : (
          <ul className="space-y-2">
            {priorites.map((p) => {
              const s = sujet(p.matiere)
              return (
                <li key={`${p.matiere}:${p.chapitre}`} className="card relative overflow-hidden p-4">
                  <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: s?.color }} aria-hidden />
                  <div className="flex items-start gap-3 pl-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold texte-matiere" style={{ '--mc': s?.color }}>{s?.name || p.matiere}</p>
                      <p className="font-bold leading-snug">{nomChapitre(p.matiere, p.chapitre)}</p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {p.raison === 'sous-la-moyenne' ? 'Sous la moyenne' : `Ta moyenne la plus basse en ${s?.short || s?.name || p.matiere}`}
                        {' · '}
                        {p.nombre > 1 ? `moyenne de ${p.nombre} notes` : '1 note'}
                      </p>
                    </div>
                    <span className="shrink-0 text-lg font-bold tabular-nums">{note(p.moyenne)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {groupes.length > 0 && (
        <section aria-labelledby="titre-notes" className="space-y-3">
          <h2 id="titre-notes" className="px-1 font-display text-xl font-medium">📒 Toutes mes notes</h2>
          {groupes.map((g) => {
            const s = sujet(g.matiere)
            return (
              <div key={g.matiere} className="card p-0">
                <div className="flex items-center gap-2 border-b border-slate-100 p-4 dark:border-slate-800">
                  <h3 className="min-w-0 flex-1 truncate font-display font-semibold">{s?.icon} {s?.name || g.matiere}</h3>
                  <span className="shrink-0 text-sm tabular-nums text-slate-500 dark:text-slate-400">Moyenne {note(g.moyenne)}</span>
                </div>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {g.notes.map((n) => (
                    <li key={n.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-snug">{n.chapitre === TOUTE_LA_MATIERE ? 'Toute la matière' : nomChapitre(n.matiere, n.chapitre)}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{jour(n.date)}</span>
                        {n.questionsManquees && <span className="mt-2 block whitespace-pre-wrap text-sm">Questions manquées : {n.questionsManquees}</span>}
                        <details className="mt-3 text-sm"><summary className="cursor-pointer">Mon bilan et mes exercices</summary><NoteRevision subject={n.matiere} chapter={n.chapitre} missed={n.questionsManquees || ''} owner={state.account?.id} result={n.revision} onResult={value => { if (value) ajouterNoteClasse({ ...n, revision: value, ajouteLe: Date.now() }) }} onBusy={() => {}} /></details>
                      </div>
                      <span className={`shrink-0 font-semibold tabular-nums ${n.note < SOUS_LA_MOYENNE ? 'text-rose-600 dark:text-rose-400' : ''}`}>{note(n.note)}</span>
                      <button type="button" onClick={() => retirer(n)} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800" aria-label="Supprimer la note">✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      )}

      <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
        🔒 Tes notes sont privées : ni ta classe, ni ton professeur, ni l’espace parent ne les voient. Elles sont sauvegardées avec ta progression, comptent dans « Télécharger mes données » et s’effacent avec ton compte.
      </p>
    </div>
  )
}
