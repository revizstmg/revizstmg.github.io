import { useEffect, useState } from 'react'
import Introuvable from './Introuvable.jsx'
import { appelAdmin, duree, dateFr, estAdminProbable } from '../admin.js'

// Menu administrateur pour les deux comptes autorisés (lecture, et changement d'offre d'un compte). Tout vient de fonctions de la base qui
// vérifient l'e-mail du compte : si l'appel est refusé, la page se comporte comme une adresse inconnue.
const ONGLETS = [['apercu', 'Aperçu'], ['comptes', 'Comptes'], ['abos', 'Abonnements et IA'], ['signalements', 'Signalements'], ['classes', 'Classes et vie sociale']]
const OFFRES = [['gratuit', 'Gratuit'], ['premium', 'Premium'], ['ultimate', 'Ultimate']]
const DUREES = [['30', '30 jours'], ['90', '3 mois'], ['365', '1 an'], ['', 'Sans date de fin']]
const nomOffre = (o) => (OFFRES.find(([k]) => k === o) || [0, o || 'Gratuit'])[1]

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
        {c.nouveaux_24h !== undefined && <Carte titre="Nouveaux (24 h)" valeur={c.nouveaux_24h} />}
        {c.actifs_24h !== undefined && <Carte titre="Actifs (24 h)" valeur={c.actifs_24h} />}
        {donnees.offres && <Carte titre="Abonnés actifs" valeur={(donnees.offres.premium || 0) + (donnees.offres.ultimate || 0)} sous={`${donnees.offres.premium} Premium · ${donnees.offres.ultimate} Ultimate`} />}
        {donnees.offres && <Carte titre="Payants / offerts" valeur={`${donnees.offres.reels} / ${donnees.offres.offerts}`} sous="Stripe / par un admin" />}
        {donnees.signalements_ouverts !== undefined && <Carte titre="Signalements à traiter" valeur={donnees.signalements_ouverts} />}
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

function ChangerOffre({ id, nom, abonnement }) {
  const [offre, setOffre] = useState('premium')
  const [jours, setJours] = useState('30')
  const [etat, setEtat] = useState(null)
  const [courant, setCourant] = useState(abonnement)
  const actif = courant && courant.offre && ['active', 'trialing', 'past_due'].includes(courant.statut) && (!courant.periode_fin || new Date(courant.periode_fin) > Date.now() - 86400000)
  const appliquer = async () => {
    const msg = offre === 'gratuit' ? `Remettre ${nom || 'ce compte'} en offre gratuite ?` : `Donner l’offre ${nomOffre(offre)} à ${nom || 'ce compte'}${jours ? ` pour ${DUREES.find(([k]) => k === jours)[1]}` : ' sans date de fin'} ?`
    if (!window.confirm(msg)) return
    setEtat({ attente: true })
    const r = await appelAdmin('revizstmg_admin_abonnement', { p_id: id, p_offre: offre, p_jours: offre === 'gratuit' || !jours ? null : Number(jours) })
    if (r.ok) { setCourant(r.data); setEtat({ ok: `Offre ${nomOffre(offre)} enregistrée.` }) }
    else setEtat({ erreur: /abonnement_stripe_actif/.test(r.erreur || '') ? 'Ce compte a un vrai abonnement Stripe actif : résilie-le d’abord dans Stripe.' : r.refuse ? 'Accès refusé.' : `Échec : ${r.erreur || 'erreur inconnue'}` })
  }
  return (
    <section className="card p-4 space-y-2 text-sm" lang="fr" data-no-translate>
      <h3 className="font-semibold">Abonnement</h3>
      <p>Actuellement : <b>{actif ? nomOffre(courant.offre) : 'Gratuit'}</b>{actif && courant.periode_fin ? ` jusqu’au ${dateFr(courant.periode_fin)}` : ''}{actif && !courant.periode_fin ? ' (sans fin)' : ''}</p>
      <div className="flex flex-wrap items-end gap-2">
        <label className="block">Passer à
          <select value={offre} onChange={(e) => setOffre(e.target.value)} className="ml-1 rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
            {OFFRES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </label>
        {offre !== 'gratuit' && (
          <label className="block">Durée
            <select value={jours} onChange={(e) => setJours(e.target.value)} className="ml-1 rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-800">
              {DUREES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
          </label>
        )}
        <button type="button" onClick={appliquer} disabled={etat?.attente} className="rounded-full bg-slate-900 px-4 py-1.5 font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">Appliquer</button>
      </div>
      {etat?.ok && <p role="status">{etat.ok}</p>}
      {etat?.erreur && <p role="alert">{etat.erreur}</p>}
      <p className="text-xs">Un abonnement donné ici ne passe pas par Stripe : aucun paiement n’est demandé ni prélevé.</p>
    </section>
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
      <ChangerOffre id={d.id} nom={d.nom} abonnement={d.abonnement} />
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

function Comptes({ offreInitiale = '' }) {
  const [etat, setEtat] = useState({ charge: false })
  const [voir, setVoir] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [role, setRole] = useState('')
  const [niveau, setNiveau] = useState('')
  const [offre, setOffre] = useState(offreInitiale)
  const [tri, setTri] = useState('recent')
  useEffect(() => {
    let vivant = true
    appelAdmin('revizstmg_admin_comptes').then((r) => { if (vivant) setEtat({ charge: true, ...r }) })
    return () => { vivant = false }
  }, [])
  if (voir) return <Detail id={voir} onRetour={() => setVoir(null)} />
  if (!etat.charge) return <p className="text-sm" role="status" lang="fr" data-no-translate>Chargement…</p>
  if (!etat.ok) return <p className="text-sm" role="alert" lang="fr" data-no-translate>Erreur : {etat.erreur}</p>
  const q = recherche.trim().toLowerCase()
  const offreDe = (c) => c.offre || 'gratuit'
  const tris = { recent: (a, b) => (a.cree < b.cree ? 1 : -1), actif: (a, b) => ((a.maj || '') < (b.maj || '') ? 1 : -1), xp: (a, b) => (b.xp || 0) - (a.xp || 0), temps: (a, b) => (b.temps_s || 0) - (a.temps_s || 0) }
  const lignes = (etat.data || [])
    .filter((c) => (!q || `${c.nom} ${c.email} ${c.specialite} ${c.niveau}`.toLowerCase().includes(q)) && (!role || c.role === role) && (!niveau || c.niveau === niveau)
      && (!offre || (offre === 'payant' ? offreDe(c) !== 'gratuit' : offreDe(c) === offre)))
    .sort(tris[tri])
  const sel = 'rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800'
  return (
    <div className="space-y-3" lang="fr" data-no-translate>
      <label className="block text-sm font-semibold" htmlFor="admin-recherche">Chercher un compte</label>
      <input id="admin-recherche" value={recherche} onChange={(e) => setRecherche(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
      <div className="flex flex-wrap gap-2">
        <label className="text-xs font-semibold">Rôle <select value={role} onChange={(e) => setRole(e.target.value)} className={sel}><option value="">Tous</option><option value="eleve">Élèves</option><option value="prof">Profs</option></select></label>
        <label className="text-xs font-semibold">Niveau <select value={niveau} onChange={(e) => setNiveau(e.target.value)} className={sel}><option value="">Tous</option><option value="terminale-stmg">Terminale</option><option value="premiere-stmg">Première</option></select></label>
        <label className="text-xs font-semibold">Offre <select value={offre} onChange={(e) => setOffre(e.target.value)} className={sel}><option value="">Toutes</option><option value="payant">Abonnés (tous)</option><option value="premium">Premium</option><option value="ultimate">Ultimate</option><option value="gratuit">Gratuit</option></select></label>
        <label className="text-xs font-semibold">Trier par <select value={tri} onChange={(e) => setTri(e.target.value)} className={sel}><option value="recent">Inscription récente</option><option value="actif">Dernière activité</option><option value="xp">XP</option><option value="temps">Temps passé</option></select></label>
      </div>
      <p className="text-xs">{lignes.length} compte(s) sur {(etat.data || []).length}.</p>
      <ul className="space-y-2">
        {lignes.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => setVoir(c.id)} className="card w-full p-3 text-left text-sm">
              <span className="block font-semibold">{c.nom || '(sans nom)'} {c.offre && c.offre !== 'gratuit' && <span className="rounded-full bg-amber-200 px-2 text-xs text-amber-950">{nomOffre(c.offre)}{c.offre_offerte ? ' · offert' : ''}</span>} <span className="font-normal">· {c.role === 'prof' ? 'prof' : 'élève'} · {c.niveau === 'premiere-stmg' ? 'Première' : 'Terminale'}{c.specialite ? ` · ${c.specialite}` : ''}</span></span>
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
  if (section === 'classes') {
    return (
      <div className="space-y-3" lang="fr" data-no-translate>
        <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Classes</h2>
          {d.classes.length ? <ul>{d.classes.map((c) => <li key={c.code}>{c.nom || c.code} ({c.code}) · {c.matiere || '—'} · prof {c.prof || '—'} · {c.membres} membre(s) · créée {dateFr(c.cree)}</li>)}</ul> : <p>Aucune classe.</p>}
        </section>
        <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Vie sociale</h2>
          <p>{d.social.amis} profils d’amis · {d.social.demandes} demandes · {d.social.classement} lignes de classement · {d.social.membres_classe} membres de classe</p>
        </section>
      </div>
    )
  }
  return (
    <div className="space-y-3" lang="fr" data-no-translate>
      <section className="card p-4 text-sm"><h2 className="font-display text-lg font-semibold">Signalements d’erreurs</h2>
        {d.signalements.length ? <ul className="space-y-2">{d.signalements.map((s) => <li key={s.id}><b>{dateFr(s.cree)}</b> · {s.auteur || '—'} · {s.page} {s.theme || ''} {s.exercice || ''} · {s.categorie}{s.traite ? ' · traité' : ''}<br />{s.message}</li>)}</ul> : <p>Aucun signalement.</p>}
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
        <p className="mt-1 text-sm">Les e-mails sont masqués et les notes, le Grand Oral et les fiches ne sont jamais affichés. Seul le changement d’offre d’un compte modifie des données.</p>
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
          {onglet === 'abos' && <><Comptes offreInitiale="payant" /><Divers section="abos" /></>}
          {(onglet === 'signalements' || onglet === 'classes') && <Divers section={onglet} />}
        </>
      )}
    </div>
  )
}
