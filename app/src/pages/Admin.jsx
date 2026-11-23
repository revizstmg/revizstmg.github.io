import { useEffect, useState } from 'react'
import Introuvable from './Introuvable.jsx'
import { appelAdmin, duree, dateFr, estAdminProbable } from '../admin.js'

// Menu administrateur (lecture seule) pour les deux comptes autorisés. Tout vient de fonctions de la base qui
// vérifient l'e-mail du compte : si l'appel est refusé, la page se comporte comme une adresse inconnue.
const ONGLETS = [['apercu', 'Aperçu'], ['comptes', 'Comptes'], ['abos', 'Abonnements et IA'], ['divers', 'Signalements et classes']]

const Carte = ({ titre, valeur, sous }) => (
  <div className="card p-3 text-center" lang="fr" data-no-translate>
    <p className="font-display text-2xl font-semibold">{valeur ?? '—'}</p>
    <p className="text-xs font-semibold">{titre}</p>
    {sous && <p className="text-xs text-slate-600 dark:text-slate-300">{sous}</p>}
  </div>
)

function Barres({ lignes, cle, valeur, libelle, max }) {
  const m = max || Math.max(1, ...lignes.map((l) => Number(l[valeur]) || 0))
  return (
    <ul className="space-y-1" lang="fr" data-no-translate>
      {lignes.map((l) => (
        <li key={l[cle]} className="flex items-center gap-2 text-xs">
          <span className="w-24 shrink-0 truncate">{libelle ? libelle(l) : l[cle]}</span>
          <span className="h-3 rounded" style={{ width: `${Math.max(2, (100 * (Number(l[valeur]) || 0)) / m)}%`, background: 'var(--c-accent)' }} aria-hidden />
          <span className="font-semibold">{l[valeur]}</span>
        </li>
      ))}
    </ul>
  )
}

function Apercu({ donnees }) {
  const c = donnees.comptes || {}
  return (
    <div className="space-y-4" lang="fr" data-no-translate>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Carte titre="Comptes" valeur={c.total} sous={`${c.eleves} élèves, ${c.profs} profs`} />
        <Carte titre="Nouveaux (7 jours)" valeur={c.nouveaux_7j} />
        <Carte titre="Actifs (7 jours)" valeur={c.actifs_7j} />
        <Carte titre="Niveaux" valeur={`${c.terminale} / ${c.premiere}`} sous="Terminale / Première" />
      </div>
      <section className="card p-4">
        <h2 className="font-display text-lg font-semibold">Visites par jour (30 jours)</h2>
        {donnees.visites_par_jour?.length ? <Barres lignes={donnees.visites_par_jour} cle="jour" valeur="visites" libelle={(l) => `${l.jour.slice(8, 10)}/${l.jour.slice(5, 7)}  · ${l.vues} vues`} /> : <p className="text-sm">Aucune visite.</p>}
      </section>
      <section className="card p-4">
        <h2 className="font-display text-lg font-semibold">Inscriptions par jour (30 jours)</h2>
        {donnees.inscriptions_par_jour?.length ? <Barres lignes={donnees.inscriptions_par_jour} cle="jour" valeur="n" libelle={(l) => `${l.jour.slice(8, 10)}/${l.jour.slice(5, 7)}`} /> : <p className="text-sm">Aucune inscription.</p>}
      </section>
      <section className="card p-4">
        <h2 className="font-display text-lg font-semibold">Pages les plus vues (30 jours)</h2>
        <Barres lignes={donnees.pages_30j || []} cle="page" valeur="vues" libelle={(l) => `${l.page} · ${l.visites} visites`} />
      </section>
      <section className="card p-4">
        <h2 className="font-display text-lg font-semibold">Spécialités</h2>
        <Barres lignes={donnees.specialites || []} cle="specialite" valeur="n" />
      </section>
    </div>
  )
}

function Detail({ id, onRetour }) {
  const [etat, setEtat] = useState({ charge: false })
  useEffect(() => {
    let vivant = true
    appelAdmin('revizstmg_admin_compte', { p_id: id }).then((r) => { if (vivant) setEtat({ charge: true, ...r }) })
    return () => { vivant = false }
  }, [id])
  if (!etat.charge) return <p className="text-sm" role="status" lang="fr" data-no-translate>Chargement…</p>
  if (!etat.ok || !etat.data) return <p className="text-sm" role="alert" lang="fr" data-no-translate>Compte introuvable ou erreur : {etat.erreur || 'aucune donnée'}.</p>
  const d = etat.data
  const p = d.progression || {}
  const temps = Object.entries(p.themeTime || {}).sort((a, b) => b[1] - a[1])
  const jours = Object.entries(p.history || {}).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  const chapitres = Object.entries(p.chapters || {})
  return (
    <div className="space-y-3" lang="fr" data-no-translate>
      <button type="button" className="lien-retour" onClick={onRetour}>← Retour à la liste</button>
      <section className="card p-4 space-y-1 text-sm">
        <h2 className="font-display text-xl font-semibold">{d.nom || '(sans nom)'}</h2>
        <p>{d.role === 'prof' ? 'Professeur' : 'Élève'} · {d.niveau}{d.specialite ? ` · ${d.specialite}` : ''} · {d.email}</p>
        <p>Inscrit le {dateFr(d.cree)} · dernière synchronisation {dateFr(d.maj)} · dernière connexion {dateFr(d.connexion)}</p>
        <p>{p.xp ?? 0} XP · {p.coins ?? 0} pièces · série {p.streak?.count ?? 0} jour(s) · {p.totalAnswers ?? 0} réponses ({p.correctAnswers ?? 0} justes)</p>
        <p>Dernier chapitre : {p.lastChapter?.chapterId || '—'} · langues : {(p.studyLanguages || []).join(', ') || '—'}</p>
        <p>Badges : {(p.badges || []).join(', ') || '—'}</p>
        <p>Favoris : {(p.favorites || []).join(', ') || '—'}</p>
        {d.abonnement && <p>Abonnement : {d.abonnement.offre} / {d.abonnement.periode} / {d.abonnement.statut}{d.abonnement.mode_test ? ' (test)' : ''}</p>}
      </section>
      <section className="card p-4">
        <h3 className="font-semibold">Temps passé par thème</h3>
        {temps.length ? <ul className="text-sm">{temps.map(([k, v]) => <li key={k}>{k} : {duree(v)}</li>)}</ul> : <p className="text-sm">Aucun.</p>}
      </section>
      <section className="card p-4">
        <h3 className="font-semibold">XP par jour</h3>
        {jours.length ? <ul className="text-sm">{jours.map(([k, v]) => <li key={k}>{k} : {v}</li>)}</ul> : <p className="text-sm">Aucun.</p>}
      </section>
      <section className="card p-4">
        <h3 className="font-semibold">Chapitres et exercices</h3>
        {chapitres.length ? <ul className="text-sm">{chapitres.map(([k, v]) => <li key={k}>{k} : {Object.keys(v?.games || {}).length} exercice(s), {v?.pct ?? '—'} %</li>)}</ul> : <p className="text-sm">Aucun exercice enregistré.</p>}
      </section>
      {d.ia?.length > 0 && <section className="card p-4"><h3 className="font-semibold">Usage de l’IA</h3><ul className="text-sm">{d.ia.map((i, k) => <li key={k}>{i.fonction} · {i.periode} : {i.n}</li>)}</ul></section>}
    </div>
  )
}

function Comptes() {
  const [etat, setEtat] = useState({ charge: false })
  const [voir, setVoir] = useState(null)
  const [recherche, setRecherche] = useState('')
  useEffect(() => {
    let vivant = true
    appelAdmin('revizstmg_admin_comptes').then((r) => { if (vivant) setEtat({ charge: true, ...r }) })
    return () => { vivant = false }
  }, [])
  if (voir) return <Detail id={voir} onRetour={() => setVoir(null)} />
  if (!etat.charge) return <p className="text-sm" role="status" lang="fr" data-no-translate>Chargement…</p>
  if (!etat.ok) return <p className="text-sm" role="alert" lang="fr" data-no-translate>Erreur : {etat.erreur}</p>
  const q = recherche.trim().toLowerCase()
  const lignes = (etat.data || []).filter((c) => !q || `${c.nom} ${c.email} ${c.specialite} ${c.niveau}`.toLowerCase().includes(q))
  return (
    <div className="space-y-3" lang="fr" data-no-translate>
      <label className="block text-sm font-semibold" htmlFor="admin-recherche">Chercher un compte</label>
      <input id="admin-recherche" value={recherche} onChange={(e) => setRecherche(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
      <p className="text-xs">{lignes.length} compte(s), du plus récent au plus ancien.</p>
      <ul className="space-y-2">
        {lignes.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => setVoir(c.id)} className="card w-full p-3 text-left text-sm">
              <span className="block font-semibold">{c.nom || '(sans nom)'} <span className="font-normal">· {c.role === 'prof' ? 'prof' : 'élève'} · {c.niveau === 'premiere-stmg' ? 'Première' : 'Terminale'}{c.specialite ? ` · ${c.specialite}` : ''}</span></span>
              <span className="block">Inscrit {dateFr(c.cree)} · synchro {dateFr(c.maj)} · {c.email}</span>
              <span className="block">{c.xp ?? 0} XP · série {c.serie ?? 0} · {c.reponses ?? 0} réponses · {c.exercices} exercice(s) · {c.chapitres} chapitre(s) · {duree(c.temps_s)} · {c.jours_actifs} jour(s) actif(s)</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Divers({ section }) {
  const [etat, setEtat] = useState({ charge: false })
  useEffect(() => {
    let vivant = true
    appelAdmin('revizstmg_admin_divers').then((r) => { if (vivant) setEtat({ charge: true, ...r }) })
    return () => { vivant = false }
  }, [])
  if (!etat.charge) return <p className="text-sm" role="status" lang="fr" data-no-translate>Chargement…</p>
  if (!etat.ok) return <p className="text-sm" role="alert" lang="fr" data-no-translate>Erreur : {etat.erreur}</p>
  const d = etat.data
  if (section === 'abos') {
    return (
      <div className="space-y-3" lang="fr" data-no-translate>
        <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Abonnements</h2>
          {d.abonnements.length ? <ul>{d.abonnements.map((a, i) => <li key={i}>{a.nom || '—'} : {a.offre} / {a.periode} / {a.statut}{a.test ? ' (test)' : ''}{a.annulation_prevue ? ' · annulation prévue' : ''} · fin {dateFr(a.periode_fin)}</li>)}</ul> : <p>Aucun abonnement.</p>}
        </section>
        <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Usage de l’IA</h2>
          {d.ia.length ? <ul>{d.ia.map((a, i) => <li key={i}>{a.nom || '—'} : {a.fonction} · {a.periode} : {a.n}</li>)}</ul> : <p>Aucun usage.</p>}
        </section>
      </div>
    )
  }
  return (
    <div className="space-y-3" lang="fr" data-no-translate>
      <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Signalements d’erreurs</h2>
        {d.signalements.length ? <ul className="space-y-2">{d.signalements.map((s) => <li key={s.id}><b>{dateFr(s.cree)}</b> · {s.auteur || '—'} · {s.page} {s.theme || ''} {s.exercice || ''} · {s.categorie}{s.traite ? ' · traité' : ''}<br />{s.message}</li>)}</ul> : <p>Aucun signalement.</p>}
      </section>
      <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Classes</h2>
        {d.classes.length ? <ul>{d.classes.map((c) => <li key={c.code}>{c.nom || c.code} ({c.code}) · {c.matiere || '—'} · prof {c.prof || '—'} · {c.membres} membre(s) · créée {dateFr(c.cree)}</li>)}</ul> : <p>Aucune classe.</p>}
      </section>
      <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Vie sociale</h2>
        <p>{d.social.amis} profils d’amis · {d.social.demandes} demandes · {d.social.classement} lignes de classement · {d.social.membres_classe} membres de classe</p>
      </section>
    </div>
  )
}

export default function Admin() {
  // 'verif' : on demande à la base si ce compte est administrateur ; la réponse décide, pas l'adresse affichée.
  const [acces, setAcces] = useState('verif')
  const [onglet, setOnglet] = useState('apercu')
  const [apercu, setApercu] = useState(null)
  useEffect(() => {
    let vivant = true
    if (!estAdminProbable()) { setAcces('non'); return undefined }
    appelAdmin('revizstmg_admin_apercu').then((r) => {
      if (!vivant) return
      if (r.ok) { setApercu(r.data); setAcces('oui') } else setAcces(r.refuse ? 'non' : 'erreur')
    })
    return () => { vivant = false }
  }, [])
  if (acces === 'non') return <Introuvable />
  return (
    <div className="animate-lux mx-auto max-w-3xl space-y-4 py-2" lang="fr" data-no-translate>
      <header className="page-hero page-hero-compact">
        <p className="kicker">Administration</p>
        <h1 className="mt-1 font-display text-[1.7rem] font-medium leading-tight">Tableau de bord</h1>
        <p className="mt-1 text-sm">Lecture seule. Les e-mails sont masqués et les notes, le Grand Oral et les fiches ne sont jamais affichés.</p>
      </header>
      {acces === 'verif' && <p className="text-sm" role="status" lang="fr" data-no-translate>Vérification de ton accès…</p>}
      {acces === 'erreur' && <p className="text-sm" role="alert" lang="fr" data-no-translate>Impossible de charger les données (réseau ou base). Réessaie dans un instant.</p>}
      {acces === 'oui' && (
        <>
          <nav aria-label="Sections" className="flex flex-wrap gap-2">
            {ONGLETS.map(([id, nom]) => (
              <button key={id} type="button" aria-pressed={onglet === id} onClick={() => setOnglet(id)} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${onglet === id ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'border-slate-300'}`}>{nom}</button>
            ))}
          </nav>
          {onglet === 'apercu' && apercu && <Apercu donnees={apercu} />}
          {onglet === 'comptes' && <Comptes />}
          {(onglet === 'abos' || onglet === 'divers') && <Divers section={onglet} />}
        </>
      )}
    </div>
  )
}
