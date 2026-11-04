import { useMemo, useState } from 'react'
import {
  EPS, CHAMPS, REPARTITIONS, estimerNote, moyenneEpreuves, lignesSeuil, ligneSeuil,
  positionSeuil, vitesseDemiFond, planEntrainement, familleDe, FAMILLES_ENTRAINEMENT, ENTRAINEMENTS, lireValeur,
} from '../data/epsBac.js'

// « Sport au bac » : les activités du contrôle en cours de formation d'EPS, leurs repères d'évaluation nationaux
// (BO n° 9 du 26 février 2026), une estimation de note et des entraînements adaptés. Le texte reste en français.
const DEGRES = [1, 2, 3, 4]
const NIVEAUX = { 'au-dessus': 'au-dessus du seuil national', 'au-seuil': 'proche du seuil national', 'en-dessous': 'en dessous du seuil national' }
const AFL_LABEL = { afl1: 'AFL1 · performance', afl2: 'AFL2 · s’entraîner', afl3: 'AFL3 · rôles' }

export default function SportBac() {
  const [champId, setChampId] = useState('ca1')
  const champ = CHAMPS.find((c) => c.id === champId)
  return (
    <div className="animate-lux mx-auto max-w-3xl space-y-5" lang="fr" data-no-translate>
      <header className="page-hero page-hero-compact text-center">
        <p className="kicker">🏅 EPS au bac</p>
        <h1 className="mt-1 font-display text-[1.9rem] font-medium leading-tight">Sport au bac</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Les activités du bac, comment elles sont notées et des entraînements pour progresser.</p>
      </header>

      <Regle />

      <section aria-labelledby="sb-champs" className="space-y-3">
        <h2 id="sb-champs" className="font-display text-xl font-semibold">Les cinq champs d’apprentissage</h2>
        <div className="grid gap-2 sm:grid-cols-2" role="tablist" aria-label="Champs d’apprentissage">
          {CHAMPS.map((c) => (
            <button key={c.id} role="tab" aria-selected={c.id === champId} onClick={() => setChampId(c.id)}
              className={`card flex items-start gap-3 p-3 text-left ${c.id === champId ? 'ring-2 ring-[color:var(--c-accent)]' : ''}`}>
              <span className="text-2xl" aria-hidden>{c.icone}</span>
              <span><strong className="block">Champ {c.numero}</strong><span className="block text-sm text-slate-600 dark:text-slate-300">{c.activites}</span></span>
            </button>
          ))}
        </div>
        <ChampDetail champ={champ} />
      </section>

      {champId === 'ca1' && <Seuils />}
      <Estimation />
      <Entrainement />

      <footer className="card p-4 text-xs text-slate-600 dark:text-slate-300">
        <p><strong>Source :</strong> {EPS.source.texte}, {EPS.source.bo}. <a className="underline" href={EPS.source.urlNote} target="_blank" rel="noopener noreferrer">Note de service</a> · <a className="underline" href={EPS.source.urlAnnexe} target="_blank" rel="noopener noreferrer">Annexe 1 (PDF)</a></p>
        <p className="mt-2">{EPS.source.limite}</p>
      </footer>
    </div>
  )
}

function Regle() {
  const e = EPS.epreuve
  return (
    <section lang="fr" data-no-translate className="card space-y-2 p-4" aria-labelledby="sb-regle">
      <h2 id="sb-regle" className="font-display text-xl font-semibold">Comment ça marche</h2>
      <ul className="list-disc space-y-1 ps-5 text-sm">
        <li>{e.regle}</li>
        <li>{e.repartition}</li>
        <li>Coefficient : {e.coefficient}. <span className="text-slate-500">{e.coefficientFiabilite}</span></li>
        <li>{e.specialite}</li>
        <li>{e.ponctuel}</li>
      </ul>
    </section>
  )
}

function ChampDetail({ champ }) {
  return (
    <div lang="fr" data-no-translate className="card space-y-3 p-4" role="tabpanel" aria-label={`Champ ${champ.numero}`}>
      <h3 className="font-display text-lg font-semibold">{champ.icone} Champ {champ.numero} : {champ.titre}</h3>
      <p className="text-sm"><strong>Activités :</strong> {champ.activites}</p>
      <ul className="flex flex-wrap gap-2 text-xs">
        {champ.familles.flatMap((f) => f.activites.map((a) => <li key={f.id + a} className="rounded-full border border-slate-300 px-2 py-0.5 dark:border-slate-600">{a}</li>))}
      </ul>
      <div>
        <h4 className="font-semibold">AFL1 · sur 12 points</h4>
        <p className="text-sm text-slate-600 dark:text-slate-300">{champ.afl1.intitule}</p>
        {champ.afl1.elements.map((el) => (
          <details key={el.id} className="mt-2 rounded-xl border border-slate-200 p-2 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-semibold">{el.nom} <span className="font-normal text-slate-500">({el.points} points)</span></summary>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">{el.criteres.map((c) => <li key={c}>{c}</li>)}</ul>
          </details>
        ))}
        {champ.afl1.remarque && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{champ.afl1.remarque}</p>}
      </div>
      <Afl titre="AFL2 · sur 8 points avec l’AFL3" afl={champ.afl2} />
      <Afl titre="AFL3 · rôles" afl={champ.afl3} />
      <p className="text-xs text-slate-600 dark:text-slate-300">{champ.choix}</p>
    </div>
  )
}

function Afl({ titre, afl }) {
  return (
    <details lang="fr" data-no-translate className="rounded-xl border border-slate-200 p-2 dark:border-slate-700">
      <summary className="cursor-pointer text-sm font-semibold">{titre}</summary>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{afl.intitule}</p>
      <ol className="mt-2 list-none space-y-1 text-sm">{afl.degres.map((d) => <li key={d}>{d}</li>)}</ol>
    </details>
  )
}

function Seuils() {
  const [sexe, setSexe] = useState('g')
  const [ligneId, setLigneId] = useState('d800')
  const [saisie, setSaisie] = useState('')
  const ligne = ligneSeuil(ligneId)
  const valeur = lireValeur(ligne, saisie)
  const position = valeur != null ? positionSeuil(ligne, sexe, valeur) : null
  const vitesse = valeur != null ? vitesseDemiFond(ligne, valeur) : null
  const exemple = ligne.type === 'temps' ? 'ex. 3’10, 3:10 ou 31,5 secondes' : 'ex. 14,2'
  return (
    <section lang="fr" data-no-translate className="card space-y-3 p-4" aria-labelledby="sb-seuils">
      <h2 id="sb-seuils" className="font-display text-xl font-semibold">Seuils nationaux du champ 1</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">{EPS.seuilsCA1.intitule}. {EPS.seuilsCA1.note}</p>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tableau des seuils nationaux">
        <table className="w-full min-w-[28rem] text-sm">
          <caption className="sr-only">Seuils de performance nationaux médians</caption>
          <thead><tr className="text-left"><th scope="col" className="py-1 pe-2">Épreuve</th><th scope="col" className="py-1 pe-2">Garçons</th><th scope="col" className="py-1">Filles</th></tr></thead>
          <tbody>
            {EPS.seuilsCA1.lignes.map((l) => (
              <tr key={l.id} className="border-t border-slate-200 dark:border-slate-700">
                <th scope="row" className="py-1 pe-2 text-left font-medium">{l.nom}{l.detail && <span className="block text-xs font-normal text-slate-500">{l.detail}</span>}</th>
                <td className="py-1 pe-2">{l.g}</td><td className="py-1">{l.f}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="font-semibold">Où te situes-tu ?</h3>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-sm">Épreuve
          <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={ligneId} onChange={(e) => { setLigneId(e.target.value); setSaisie('') }}>
            {EPS.seuilsCA1.lignes.map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
          </select>
        </label>
        <label className="text-sm">Je suis
          <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={sexe} onChange={(e) => setSexe(e.target.value)}>
            <option value="g">un garçon</option><option value="f">une fille</option>
          </select>
        </label>
        <label className="text-sm">Ma performance ({exemple})
          <input className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" inputMode="decimal" value={saisie} onChange={(e) => setSaisie(e.target.value)} />
        </label>
      </div>
      <div role="status" aria-live="polite" className="text-sm">
        {position ? (
          <p>Seuil {sexe === 'g' ? 'garçons' : 'filles'} : <strong>{position.reference}</strong>. Tu es <strong>{NIVEAUX[position.niveau]}</strong> ({position.ecart > 0 ? '+' : ''}{position.ecart} {ligne.type === 'temps' ? 's' : 'm'} d’écart){vitesse ? <>, soit environ {vitesse} km/h</> : null}. {position.niveau === 'au-seuil' ? 'Le seuil correspond à 3 points sur 6 pour la performance.' : ''}</p>
        ) : saisie ? <p className="text-amber-800 dark:text-amber-300">Valeur non reconnue.</p> : null}
      </div>
    </section>
  )
}

function Estimation() {
  const [champId, setChampId] = useState('ca1')
  const champ = CHAMPS.find((c) => c.id === champId)
  const [d1, setD1] = useState([3, 3])
  const [d2, setD2] = useState(3)
  const [d3, setD3] = useState(3)
  const [rep, setRep] = useState('4-4')
  const [notes, setNotes] = useState({ a: '', b: '', c: '' })
  const resultat = useMemo(() => {
    try { return estimerNote({ degresAfl1: d1, degreAfl2: d2, degreAfl3: d3, repartition: rep.split('-').map(Number) }) } catch { return null }
  }, [d1, d2, d3, rep])
  const moyenne = moyenneEpreuves([notes.a, notes.b, notes.c].map((n) => Number(String(n).replace(',', '.'))).filter((n, i) => [notes.a, notes.b, notes.c][i] !== '' && n >= 0 && n <= 20))
  const selectDegre = (valeur, set, label) => (
    <label className="text-sm">{label}
      <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={valeur} onChange={(e) => set(Number(e.target.value))}>
        {DEGRES.map((d) => <option key={d} value={d}>Degré {d}</option>)}
      </select>
    </label>
  )
  return (
    <section lang="fr" data-no-translate className="card space-y-3 p-4" aria-labelledby="sb-estim">
      <h2 id="sb-estim" className="font-display text-xl font-semibold">Estimer ma note d’une épreuve</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">Choisis le degré qui te ressemble le plus pour chaque élément. C’est une estimation : la note réelle est fixée par tes deux professeurs avec le barème de ton lycée.</p>
      <label className="block text-sm">Champ d’apprentissage
        <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={champId} onChange={(e) => setChampId(e.target.value)}>
          {CHAMPS.map((c) => <option key={c.id} value={c.id}>Champ {c.numero} : {c.activites}</option>)}
        </select>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {champ.afl1.elements.map((el, i) => selectDegre(d1[i], (v) => setD1((x) => x.map((y, k) => (k === i ? v : y))), `AFL1 : ${el.nom}`))}
        {selectDegre(d2, setD2, 'AFL2 : s’entraîner')}
        {selectDegre(d3, setD3, 'AFL3 : rôles')}
        <label className="text-sm">Répartition AFL2 / AFL3
          <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={rep} onChange={(e) => setRep(e.target.value)}>
            {REPARTITIONS.map(([a, b]) => <option key={`${a}-${b}`} value={`${a}-${b}`}>{a} points / {b} points</option>)}
          </select>
        </label>
      </div>
      {resultat && (
        <p role="status" aria-live="polite" className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
          AFL1 ≈ {resultat.afl1}/12 · AFL2 ≈ {resultat.afl2}/{rep.split('-')[0]} · AFL3 ≈ {resultat.afl3}/{rep.split('-')[1]}<br />
          <strong className="text-base">Note estimée ≈ {resultat.total}/20</strong> (entre {resultat.min} et {resultat.max})
        </p>
      )}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Ma moyenne sur les trois épreuves</legend>
        <div className="grid grid-cols-3 gap-2">
          {[['a', 'Épreuve 1'], ['b', 'Épreuve 2'], ['c', 'Épreuve 3']].map(([k, l]) => (
            <label key={k} className="text-sm">{l} (/20)
              <input className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" inputMode="decimal" value={notes[k]} onChange={(e) => setNotes((n) => ({ ...n, [k]: e.target.value }))} />
            </label>
          ))}
        </div>
        {moyenne != null && <p role="status" aria-live="polite" className="text-sm">Moyenne EPS ≈ <strong>{moyenne}/20</strong>.</p>}
      </fieldset>
    </section>
  )
}

function Entrainement() {
  const [famille, setFamille] = useState('demi-fond')
  const [semaines, setSemaines] = useState(6)
  const [parSemaine, setParSemaine] = useState(2)
  const [sexe, setSexe] = useState('g')
  const [ligneId, setLigneId] = useState('d800')
  const [saisie, setSaisie] = useState('')
  const info = familleDe(famille)
  const ligne = ligneId && lignesSeuil('demi-fond').find((l) => l.id === ligneId)
  const valeur = ligne ? lireValeur(ligne, saisie) : null
  const vitesse = famille === 'demi-fond' && ligne && valeur ? vitesseDemiFond(ligne, valeur) : null
  const resultat = useMemo(() => planEntrainement({ famille, semaines, seancesParSemaine: parSemaine, vitesseKmh: vitesse }), [famille, semaines, parSemaine, vitesse])
  return (
    <section lang="fr" data-no-translate className="card space-y-3 p-4" aria-labelledby="sb-plan">
      <h2 id="sb-plan" className="font-display text-xl font-semibold">Mon plan d’entraînement</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">{ENTRAINEMENTS.avertissement}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <label className="text-sm sm:col-span-3">Activité
          <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={famille} onChange={(e) => setFamille(e.target.value)}>
            {CHAMPS.map((c) => (
              <optgroup key={c.id} label={`Champ ${c.numero}`}>
                {c.familles.filter((f) => FAMILLES_ENTRAINEMENT.includes(f.id)).map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="text-sm">Durée du plan
          <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={semaines} onChange={(e) => setSemaines(Number(e.target.value))}>
            {[2, 4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} semaines</option>)}
          </select>
        </label>
        <label className="text-sm">Séances par semaine
          <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={parSemaine} onChange={(e) => setParSemaine(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        {famille === 'demi-fond' && (
          <>
            <label className="text-sm">Épreuve de référence
              <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={ligneId} onChange={(e) => { setLigneId(e.target.value); setSaisie('') }}>
                {lignesSeuil('demi-fond').map((l) => <option key={l.id} value={l.id}>{l.nom}</option>)}
              </select>
            </label>
            <label className="text-sm">Ma dernière performance ({ligne?.type === 'temps' ? 'ex. 3’30 ou 210 secondes' : 'distance en mètres'})
              <input className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" inputMode="decimal" value={saisie} onChange={(e) => setSaisie(e.target.value)} />
            </label>
            <label className="text-sm">Je suis
              <select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800" value={sexe} onChange={(e) => setSexe(e.target.value)}>
                <option value="g">un garçon</option><option value="f">une fille</option>
              </select>
            </label>
          </>
        )}
      </div>
      {famille === 'demi-fond' && (
        <p role="status" aria-live="polite" className="text-sm">
          {vitesse ? <>Ta vitesse d’épreuve : <strong>{vitesse} km/h</strong>. Les allures du plan sont calculées à partir d’elle.{(() => { const p = valeur ? positionSeuil(ligne, sexe, valeur) : null; return p ? ` Tu es ${NIVEAUX[p.niveau]}.` : '' })()}</> : 'Renseigne ta dernière performance pour obtenir des allures personnalisées.'}
        </p>
      )}
      <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
        <p><strong>{resultat.nom}</strong> · {info ? `Champ ${info.champ.numero}` : ''}</p>
        <p className="mt-1"><strong>Sécurité :</strong> {resultat.securite}</p>
        <p className="mt-1"><strong>Ton carnet (AFL2) :</strong> {resultat.carnet}</p>
        <p className="mt-1"><strong>Rôles possibles (AFL3) :</strong> {resultat.roles.join(' · ')}</p>
      </div>
      <ol className="space-y-3">
        {resultat.plan.map((w) => (
          <li key={w.semaine} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <h3 className="font-semibold">Semaine {w.semaine} · {w.nomPhase}</h3>
            <ul className="mt-2 space-y-2">
              {w.seances.map((s, i) => (
                <li key={i} className="text-sm">
                  <p><strong>Séance {i + 1} : {s.titre}</strong> <span className="text-slate-500">· {s.duree} min · {AFL_LABEL[s.afl]}</span></p>
                  <ul className="list-disc space-y-0.5 ps-5">{s.contenu.map((l, k) => <li key={k}>{l}</li>)}</ul>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
