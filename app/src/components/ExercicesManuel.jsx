// Les exercices du manuel PDF d'une langue, à faire directement sur le site.
import { useEffect, useMemo, useState } from 'react'
import { ordonnerExercices, estLibre, sorteExercice, verifier } from '../data/exercicesManuel.js'

const charger = {
  de: () => import('../../resources/langues/de.json'),
  en: () => import('../../resources/langues/en.json'),
  es: () => import('../../resources/langues/es.json'),
  it: () => import('../../resources/langues/it.json'),
  ar: () => import('../../resources/langues/ar.json'),
}

function Sorte({ e }) {
  const s = sorteExercice(e)
  if (s === 'production') return <>Expression guidée</>
  if (s === 'qcm') return <>Choisir et justifier</>
  if (s === 'traduction') return <>Traduction</>
  return <>Mini-exercice</>
}

function Exercice({ e, numero }) {
  const [saisie, setSaisie] = useState('')
  const [etat, setEtat] = useState(null) // null | 'juste' | 'faux' | 'montre'
  const [bilan, setBilan] = useState(null) // auto-évaluation des exercices libres
  const libre = estLibre(e)
  const idChamp = `manuel-${e.id}`
  const valider = (valeur = saisie) => { if (valeur.trim()) setEtat(verifier(e, valeur) ? 'juste' : 'faux') }
  const refaire = () => { setSaisie(''); setEtat(null); setBilan(null) }
  const corrige = etat !== null
  return (
    <li className="card p-4 space-y-3" id={idChamp}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{`Exercice ${numero}`} · <Sorte e={e} /></p>
      {e.context && <blockquote className="whitespace-pre-line rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800" dir="auto" translate="no">{e.context}</blockquote>}
      <p className="font-medium leading-relaxed" dir="auto" translate="no">{e.prompt}</p>
      {e.type === 'qcm' ? (
        <div role="radiogroup" aria-label={`Choix de l’exercice ${numero}`} className="grid gap-2 sm:grid-cols-2">
          {e.choices.map((c, i) => {
            const bonne = corrige && c === e.answer
            const choisie = corrige && c === saisie
            return (
              <button key={c} type="button" role="radio" aria-checked={choisie} disabled={corrige} dir="auto"
                onClick={() => { setSaisie(c); setEtat(c === e.answer ? 'juste' : 'faux') }}
                className={`rounded-xl border px-3 py-2.5 text-left ${bonne ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : choisie ? 'border-rose-600 bg-rose-50 dark:bg-rose-900/30' : 'border-slate-300 dark:border-slate-600'}`}>
                <b>{String.fromCharCode(65 + i)}.</b> {c}{bonne ? ' ✓' : choisie ? ' ✗' : ''}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-wrap items-stretch gap-2">
          <label htmlFor={`${idChamp}-r`} className="sr-only">{`Ta réponse à l’exercice ${numero}`}</label>
          {e.type === 'production' || libre
            ? <textarea id={`${idChamp}-r`} rows={2} dir="auto" value={saisie} disabled={corrige} onChange={(ev) => setSaisie(ev.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
            : <input id={`${idChamp}-r`} dir="auto" value={saisie} disabled={corrige} autoComplete="off" spellCheck={false} onChange={(ev) => setSaisie(ev.target.value)} onKeyDown={(ev) => ev.key === 'Enter' && valider()} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />}
          {!corrige && (libre
            ? <button type="button" className="btn-primary" onClick={() => setEtat('montre')}>Voir le corrigé</button>
            : <button type="button" className="btn-primary" onClick={() => valider()} disabled={!saisie.trim()}>Vérifier</button>)}
        </div>
      )}
      {corrige && (
        <div className="space-y-2 rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800" aria-live="polite">
          {etat === 'juste' && <p className="font-semibold text-emerald-700 dark:text-emerald-400">✓ Juste</p>}
          {etat === 'faux' && <p className="font-semibold text-rose-700 dark:text-rose-400">✗ Pas tout à fait</p>}
          <p><span className="font-semibold">{e.type === 'production' ? <>Exemple de réponse</> : <>Réponse attendue</>} :</span> <span dir="auto" translate="no">{e.answer}</span></p>
          {e.alternatives?.length > 0 && <p>Autres formes acceptées : <span dir="auto" translate="no">{e.alternatives.join(' ; ')}</span>.</p>}
          <p translate="no">{e.explanation}</p>
          {libre && <p className="text-slate-600 dark:text-slate-300">D’autres formulations peuvent être justes : compare avec ta réponse.</p>}
          {etat === 'montre' && !bilan && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-ghost" onClick={() => setBilan('juste')}>Ma réponse était juste</button>
              <button type="button" className="btn-ghost" onClick={() => setBilan('revoir')}>À revoir</button>
            </div>
          )}
          {bilan && <p className="font-semibold">{bilan === 'juste' ? '✓ Bien joué.' : 'À retravailler : refais l’exercice demain.'}</p>}
          <button type="button" className="btn-ghost" onClick={refaire}>Refaire</button>
        </div>
      )}
    </li>
  )
}

export default function ExercicesManuel({ langue, nomLangue }) {
  const [manuel, setManuel] = useState(null)
  const [groupe, setGroupe] = useState('')
  useEffect(() => {
    let actif = true
    setManuel(null); setGroupe('')
    charger[langue]().then((m) => { if (actif) setManuel(m.default) })
    return () => { actif = false }
  }, [langue])
  const ordre = useMemo(() => (manuel ? ordonnerExercices(manuel) : null), [manuel])
  if (!ordre) return <section className="card p-5" aria-busy="true"><p>Chargement des exercices…</p></section>
  const visibles = ordre.groupes.filter((g) => !groupe || g.id === groupe)
  return (
    <section aria-labelledby="manuel-exercices" className="space-y-4">
      <div>
        <p className="kicker">Les exercices du manuel, sur le site</p>
        <h2 id="manuel-exercices" className="font-display text-2xl">{`${ordre.total} exercices à faire en ligne.`}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{`Ce sont les mêmes exercices, dans le même ordre et avec les mêmes corrigés que le guide PDF ${nomLangue}. Pour les traductions et les productions libres, compare ta réponse au corrigé : d’autres formulations peuvent être justes.`}</p>
      </div>
      <label className="block text-sm font-semibold" htmlFor="manuel-lecon">Leçon</label>
      <select id="manuel-lecon" value={groupe} onChange={(ev) => setGroupe(ev.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-900">
        <option value="">Toutes les leçons</option>
        {ordre.groupes.map((g) => <option key={g.id} value={g.id}>{g.lecon ? `Leçon ${g.lecon}` : 'Bilan'} · {g.titre}</option>)}
      </select>
      {visibles.map((g) => (
        <div key={g.id} className="space-y-3">
          <h3 className="font-display text-lg font-semibold" dir="auto">{g.lecon ? `Leçon ${g.lecon}` : <>Bilan</>} · <span translate="no">{g.titre}</span></h3>
          <ol className="space-y-3">{g.exercices.map((e) => <Exercice key={e.id} e={e} numero={ordre.numeros.get(e.id)} />)}</ol>
        </div>
      ))}
    </section>
  )
}
