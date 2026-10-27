// Sujet d'entraînement à l'épreuve anticipée de mathématiques (Première) :
// toute la copie sur une page, comme le jour de l'épreuve, sous un chronomètre
// de 2 h indicatif (on peut rendre avant ou après). Après « Rendre ma copie »,
// chaque réponse est corrigée avec sa démarche. Le total ne compte que les
// résultats : la rédaction et la langue (2 points sur 20) ne s'évaluent pas ici.
import { useEffect, useState } from 'react'
import { useStore } from '../store.jsx'
import { composerSujetMaths, corriger, reponseJuste, texteReponse, nombre, BO_MATHS } from '../data/sujetMaths.js'

const hms = (s) => `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`

// « P_A(B) » s'affiche avec A en indice.
function Maths({ children }) {
  const morceaux = String(children).split(/_([A-ZĀ])/)
  return morceaux.map((m, i) => (i % 2 ? <sub key={i}>{m}</sub> : m))
}

function Question({ q, numero, valeur, onChange, corrige }) {
  const juste = corrige && reponseJuste(q, valeur)
  const champ = (
    <input
      id={`rep-${q.id}`}
      value={valeur || ''}
      onChange={(e) => onChange(q.id, e.target.value)}
      disabled={corrige}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      aria-describedby={`enonce-${q.id}`}
      className="w-28 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-base dark:border-slate-600 dark:bg-slate-900"
    />
  )
  return (
    <li className="space-y-2">
      <p id={`enonce-${q.id}`} className="text-sm leading-relaxed"><span className="font-semibold">{numero}.</span> <Maths>{q.enonce}</Maths> <span className="text-xs text-slate-500 dark:text-slate-400">{`(${nombre(q.points)} pt)`}</span></p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`rep-${q.id}`} className="sr-only">{`Réponse à la question ${numero}`}</label>
        {q.avant && <span className="font-mono text-sm">{q.unite}</span>}
        {champ}
        {!q.avant && q.unite && <span className="font-mono text-sm">{q.unite}</span>}
        {corrige && <span className={`text-sm font-semibold ${juste ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>{juste ? '✓ Juste' : `✗ Réponse attendue : ${texteReponse(q)}`}</span>}
      </div>
      {corrige && <p className="rounded-lg bg-slate-100 p-2.5 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Maths>{q.correction}</Maths></p>}
    </li>
  )
}

export default function SujetMaths({ onExit }) {
  const { addXp } = useStore()
  const [sujet, setSujet] = useState(() => composerSujetMaths())
  const [reponses, setReponses] = useState({})
  const [resultat, setResultat] = useState(null)
  const [debut, setDebut] = useState(() => Date.now())
  const [ecoule, setEcoule] = useState(0)

  useEffect(() => {
    if (resultat) return
    const id = setInterval(() => setEcoule(Math.floor((Date.now() - debut) / 1000)), 1000)
    return () => clearInterval(id)
  }, [debut, resultat])

  const toutes = sujet.parties.flatMap((p) => p.exercices.flatMap((e) => e.questions))
  const vides = toutes.filter((q) => !String(reponses[q.id] || '').trim()).length
  const changer = (id, v) => setReponses((r) => ({ ...r, [id]: v }))
  const rendre = () => {
    const r = corriger(sujet, reponses)
    setResultat(r)
    addXp(Math.round(r.total * 6))
    window.scrollTo({ top: 0 })
  }
  const nouveau = () => {
    setSujet(composerSujetMaths()); setReponses({}); setResultat(null); setDebut(Date.now()); setEcoule(0)
    window.scrollTo({ top: 0 })
  }
  const reste = sujet.duree - ecoule
  let numero = 0

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-2 p-3.5">
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">➗ Sujet d’entraînement · non officiel</span>
          <span className="block font-display font-semibold">Épreuve anticipée de mathématiques · 2 h · sans calculatrice</span>
        </span>
        {!resultat && (
          <span className={`font-mono text-sm font-semibold ${reste < 0 ? 'text-rose-700 dark:text-rose-400' : ''}`} aria-label="Temps restant">
            ⏱ {reste >= 0 ? hms(reste) : `+${hms(-reste)}`}
          </span>
        )}
      </div>

      {resultat && (
        <section className="card animate-pop-in space-y-3 p-5 text-center" aria-labelledby="bilan-maths">
          <h2 id="bilan-maths" className="font-display text-xl font-semibold">Ta copie est corrigée</h2>
          <p className="font-display text-4xl font-semibold" style={{ color: 'var(--c-accent-texte)' }}>{nombre(resultat.total)} / 20</p>
          <ul className="mx-auto max-w-xs space-y-1 text-left text-sm">
            {resultat.parties.map((p) => <li key={p.titre} className="flex justify-between gap-3"><span>{p.titre}</span><span className="font-semibold">{nombre(p.points)} / {p.bareme}</span></li>)}
          </ul>
          <p className="text-sm text-slate-600 dark:text-slate-300">Ce total compte seulement les résultats justes : ce n’est pas une note d’examen. À l’épreuve, le correcteur lit aussi ta démarche, et 2 points sur 20 portent sur la maîtrise de la langue (orthographe, syntaxe, raisonnement, vocabulaire). Compare ta démarche à chaque correction ci-dessous.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{`Temps passé : ${hms(ecoule)} sur 2 h.`}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={nouveau} className="btn-primary" style={{ backgroundColor: 'var(--c-accent-fort)' }}>Nouveau sujet</button>
            <button onClick={onExit} className="btn-ghost">Terminer</button>
          </div>
        </section>
      )}

      {sujet.parties.map((p) => (
        <section key={p.titre} className="card space-y-4 p-5" aria-label={p.titre}>
          <header>
            <h2 className="font-display text-xl font-semibold">{p.titre} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{`· ${p.bareme} points`}</span></h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{p.consigne}</p>
          </header>
          {p.exercices.map((e) => (
            <div key={e.id} className="space-y-3">
              {e.titre && <h3 className="font-display text-lg font-semibold">{e.titre} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{`· ${e.domaine} · ${nombre(e.questions.reduce((n, q) => n + q.points, 0))} points`}</span></h3>}
              {e.contexte && <p className="text-sm leading-relaxed"><Maths>{e.contexte}</Maths></p>}
              {e.tableau && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-center text-sm">
                    <thead><tr>{e.tableau.entetes.map((h, i) => <th key={i} scope="col" className="border border-slate-300 px-2 py-1.5 font-semibold dark:border-slate-600">{h}</th>)}</tr></thead>
                    <tbody>{e.tableau.lignes.map(([titre, ...cases]) => (
                      <tr key={titre}><th scope="row" className="border border-slate-300 px-2 py-1.5 text-left font-semibold dark:border-slate-600">{titre}</th>{cases.map((c, i) => <td key={i} className="border border-slate-300 px-2 py-1.5 font-mono dark:border-slate-600">{c}</td>)}</tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              <ol className="space-y-4">
                {e.questions.map((q) => { numero += 1; return <Question key={q.id} q={q} numero={numero} valeur={reponses[q.id]} onChange={changer} corrige={!!resultat} /> })}
              </ol>
            </div>
          ))}
        </section>
      ))}

      {!resultat && (
        <div className="card space-y-2 p-4 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300">Nombres décimaux avec une virgule (12,5), fractions avec une barre (7/12).</p>
          {vides > 0 && <p className="text-sm font-semibold">{vides > 1 ? `${vides} questions sans réponse.` : 'Une question sans réponse.'}</p>}
          <button onClick={rendre} className="btn-gold w-full !py-3">Rendre ma copie</button>
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400"><a className="underline" href={BO_MATHS} target="_blank" rel="noreferrer">Format de l’épreuve : note de service du 11 septembre 2026 (BO spécial n° 4)</a></p>
      <p className="text-xs text-slate-500 dark:text-slate-400">Sujet composé par l’application avec les notions des chapitres de Première ; il ne remplace pas les sujets de ton professeur.</p>
      <button onClick={onExit} className="lien-retour">← Quitter</button>
    </div>
  )
}
