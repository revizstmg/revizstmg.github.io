import './Admin.css'
import { useEffect, useMemo, useState } from 'react'
import Introuvable from './Introuvable.jsx'
import { appelAdmin, duree, dateFr, estAdminProbable } from '../admin.js'

// Tableau de bord administrateur pour les deux comptes autorisés (lecture, et changement d'offre d'un compte).
// Tout vient de fonctions de la base qui vérifient l'e-mail du compte : si l'appel est refusé, la page se comporte
// comme une adresse inconnue. Présentation : fond blanc, texte noir, tout ce qui est chiffré est cliquable et ouvre
// la liste des comptes concernés.
const ONGLETS = [['apercu', 'Aperçu'], ['comptes', 'Comptes'], ['abos', 'Abonnements et IA'], ['signalements', 'Signalements'], ['classes', 'Classes et vie sociale']]
const OFFRES = [['gratuit', 'Gratuit'], ['premium', 'Premium'], ['ultimate', 'Ultimate']]
const DUREES = [['30', '30 jours'], ['90', '3 mois'], ['365', '1 an'], ['', 'Sans date de fin']]
const nomOffre = (o) => (OFFRES.find(([k]) => k === o) || [0, o || 'Gratuit'])[1]
const NIVEAUX = { 'terminale-stmg': 'Terminale', 'premiere-stmg': 'Première' }
const JOUR = 86400000
const PERIODES = [['', 'Toutes les dates'], ['cree1', 'Inscrits depuis 24 h'], ['cree7', 'Inscrits depuis 7 jours'], ['maj1', 'Actifs depuis 24 h'], ['maj7', 'Actifs depuis 7 jours']]

// Carte de chiffre : un bouton qui ouvre la liste correspondante.
const Kpi = ({ titre, valeur, sous, onClick }) => (
  <button type="button" className="adm-kpi" onClick={onClick}>
    <span className="adm-nombre">{valeur ?? '—'}</span>
    <span className="adm-titre">{titre}</span>
    {sous && <span className="adm-sous">{sous}</span>}
  </button>
)

function Barres({ lignes, cle, valeur, libelle, onChoisir }) {
  const max = Math.max(1, ...lignes.map((l) => Number(l[valeur]) || 0))
  return (
    <div lang="fr" data-no-translate>
      {lignes.map((l) => {
        const Ligne = onChoisir ? 'button' : 'div'
        return (
          <Ligne key={l[cle]} className="adm-barre-ligne" {...(onChoisir ? { type: 'button', onClick: () => onChoisir(l) } : {})}>
            <span className="adm-lib">{libelle ? libelle(l) : l[cle]}</span>
            <span className="adm-barre-fond" aria-hidden><span style={{ width: `${Math.max(2, (100 * (Number(l[valeur]) || 0)) / max)}%` }} /></span>
            <span className="adm-val">{l[valeur]}</span>
          </Ligne>
        )
      })}
    </div>
  )
}

function Apercu({ donnees, aller }) {
  const c = donnees.comptes || {}
  const o = donnees.offres
  return (
    <div lang="fr" data-no-translate>
      <p className="adm-doux">Touche un chiffre pour voir les comptes concernés.</p>
      <div className="adm-grille" style={{ marginTop: 10 }}>
        <Kpi titre="Comptes" valeur={c.total} sous={`${c.eleves} élèves, ${c.profs} profs`} onClick={() => aller('comptes', {})} />
        <Kpi titre="Élèves" valeur={c.eleves} onClick={() => aller('comptes', { role: 'eleve' })} />
        <Kpi titre="Professeurs" valeur={c.profs} onClick={() => aller('comptes', { role: 'prof' })} />
        <Kpi titre="Terminale" valeur={c.terminale} onClick={() => aller('comptes', { niveau: 'terminale-stmg' })} />
        <Kpi titre="Première" valeur={c.premiere} onClick={() => aller('comptes', { niveau: 'premiere-stmg' })} />
        <Kpi titre="Nouveaux (7 jours)" valeur={c.nouveaux_7j} onClick={() => aller('comptes', { periode: 'cree7' })} />
        {c.nouveaux_24h !== undefined && <Kpi titre="Nouveaux (24 h)" valeur={c.nouveaux_24h} onClick={() => aller('comptes', { periode: 'cree1' })} />}
        <Kpi titre="Actifs (7 jours)" valeur={c.actifs_7j} onClick={() => aller('comptes', { periode: 'maj7' })} />
        {c.actifs_24h !== undefined && <Kpi titre="Actifs (24 h)" valeur={c.actifs_24h} onClick={() => aller('comptes', { periode: 'maj1' })} />}
        {o && <Kpi titre="Abonnés actifs" valeur={(o.premium || 0) + (o.ultimate || 0)} sous={`${o.premium} Premium · ${o.ultimate} Ultimate`} onClick={() => aller('abos', { offre: 'payant' })} />}
        {o && <Kpi titre="Abonnés Stripe" valeur={o.reels} sous="Ils paient" onClick={() => aller('abos', { offre: 'payant', origine: 'stripe' })} />}
        {o && <Kpi titre="Abonnés offerts" valeur={o.offerts} sous="Donnés par un admin" onClick={() => aller('abos', { offre: 'payant', origine: 'offert' })} />}
        {donnees.signalements_ouverts !== undefined && <Kpi titre="Signalements à traiter" valeur={donnees.signalements_ouverts} onClick={() => aller('signalements', { ouverts: true })} />}
      </div>
      <section className="adm-bloc">
        <h2>Visites par jour (30 jours)</h2>
        <p className="adm-doux" style={{ marginBottom: 8 }}>La barre montre les visites ; le nombre de pages vues est indiqué à gauche.</p>
        {donnees.visites_par_jour?.length ? <Barres lignes={donnees.visites_par_jour} cle="jour" valeur="visites" libelle={(l) => `${l.jour.slice(8, 10)}/${l.jour.slice(5, 7)} · ${l.vues} vues`} /> : <p>Aucune visite.</p>}
      </section>
      <section className="adm-bloc">
        <h2>Inscriptions par jour (30 jours)</h2>
        {donnees.inscriptions_par_jour?.length ? <Barres lignes={donnees.inscriptions_par_jour} cle="jour" valeur="n" libelle={(l) => `${l.jour.slice(8, 10)}/${l.jour.slice(5, 7)}`} /> : <p>Aucune inscription.</p>}
      </section>
      <section className="adm-bloc">
        <h2>Spécialités <span className="adm-doux">(touche pour voir les comptes)</span></h2>
        <Barres lignes={donnees.specialites || []} cle="specialite" valeur="n" onChoisir={(l) => aller('comptes', { specialite: l.specialite })} />
      </section>
      <section className="adm-bloc">
        <h2>Pages les plus vues (30 jours)</h2>
        <Barres lignes={donnees.pages_30j || []} cle="page" valeur="vues" libelle={(l) => `${l.page} · ${l.visites} visites`} />
      </section>
    </div>
  )
}

function ChangerOffre({ id, nom, abonnement }) {
  const [offre, setOffre] = useState('premium')
  const [jours, setJours] = useState('30')
  const [etat, setEtat] = useState(null)
  const [courant, setCourant] = useState(abonnement)
  const actif = courant && courant.offre && ['active', 'trialing', 'past_due'].includes(courant.statut) && (!courant.periode_fin || new Date(courant.periode_fin) > Date.now() - JOUR)
  const appliquer = async () => {
    const fin = jours ? ` (jusqu’au ${new Date(Date.now() + Number(jours) * JOUR).toLocaleDateString('fr-FR')})` : ''
    const msg = offre === 'gratuit' ? `Remettre ${nom || 'ce compte'} en offre gratuite ?` : `Donner l’offre ${nomOffre(offre)} à ${nom || 'ce compte'}${jours ? ` pour ${DUREES.find(([k]) => k === jours)[1]}${fin}` : ' sans date de fin'} ?`
    if (!window.confirm(msg)) return
    setEtat({ attente: true })
    const r = await appelAdmin('revizstmg_admin_abonnement', { p_id: id, p_offre: offre, p_jours: offre === 'gratuit' || !jours ? null : Number(jours) })
    if (r.ok) { setCourant(r.data); setEtat({ ok: `Offre ${nomOffre(offre)} enregistrée.` }) }
    else setEtat({ erreur: /abonnement_stripe_actif/.test(r.erreur || '') ? 'Ce compte a un vrai abonnement Stripe actif : résilie-le d’abord dans Stripe.' : r.refuse ? 'Accès refusé.' : `Échec : ${r.erreur || 'erreur inconnue'}` })
  }
  return (
    <section className="adm-bloc" lang="fr" data-no-translate>
      <h2>Abonnement</h2>
      <p>Actuellement : <b>{actif ? nomOffre(courant.offre) : 'Gratuit'}</b>{actif && courant.periode_fin ? ` jusqu’au ${dateFr(courant.periode_fin)}` : ''}{actif && !courant.periode_fin ? ' (sans fin)' : ''}</p>
      <div className="adm-offre-form">
        <label>Passer à
          <select value={offre} onChange={(e) => setOffre(e.target.value)}>{OFFRES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
        </label>
        {offre !== 'gratuit' && (
          <label>Durée
            <select value={jours} onChange={(e) => setJours(e.target.value)}>{DUREES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
          </label>
        )}
        <button type="button" onClick={appliquer} disabled={etat?.attente} className="adm-bouton">Appliquer</button>
      </div>
      {etat?.ok && <p role="status" className="adm-ok">{etat.ok}</p>}
      {etat?.erreur && <p role="alert" className="adm-erreur">{etat.erreur}</p>}
      <p className="adm-doux" style={{ marginTop: 8 }}>Un abonnement donné ici ne passe pas par Stripe : aucun paiement n’est demandé ni prélevé.</p>
    </section>
  )
}

const Ligne = ({ nom, valeur }) => <div><dt>{nom}</dt><dd>{valeur}</dd></div>

function Detail({ id, onRetour }) {
  const [etat, setEtat] = useState({ charge: false })
  useEffect(() => {
    let vivant = true
    appelAdmin('revizstmg_admin_compte', { p_id: id }).then((r) => { if (vivant) setEtat({ charge: true, ...r }) })
    return () => { vivant = false }
  }, [id])
  if (!etat.charge) return <p role="status" lang="fr" data-no-translate>Chargement…</p>
  if (!etat.ok || !etat.data) return <p role="alert" className="adm-erreur" lang="fr" data-no-translate>Compte introuvable ou erreur : {etat.erreur || 'aucune donnée'}.</p>
  const d = etat.data
  const p = d.progression || {}
  const temps = Object.entries(p.themeTime || {}).sort((a, b) => b[1] - a[1])
  const jours = Object.entries(p.history || {}).sort((a, b) => (a[0] < b[0] ? 1 : -1))
  const chapitres = Object.entries(p.chapters || {})
  return (
    <div lang="fr" data-no-translate>
      <button type="button" className="lien-retour adm-retour" onClick={onRetour}>← Retour à la liste</button>
      <section className="adm-bloc" style={{ marginTop: 0 }}>
        <h2>{d.nom || '(sans nom)'}</h2>
        <dl className="adm-fiche">
          <Ligne nom="Rôle" valeur={d.role === 'prof' ? 'Professeur' : 'Élève'} />
          <Ligne nom="Niveau" valeur={`${NIVEAUX[d.niveau] || d.niveau || '—'}${d.specialite ? ` · ${d.specialite}` : ''}`} />
          <Ligne nom="E-mail" valeur={d.email || '—'} />
          <Ligne nom="Inscrit le" valeur={dateFr(d.cree)} />
          <Ligne nom="Dernière synchronisation" valeur={dateFr(d.maj)} />
          <Ligne nom="Dernière connexion" valeur={dateFr(d.connexion)} />
          <Ligne nom="XP et pièces" valeur={`${p.xp ?? 0} XP · ${p.coins ?? 0} pièces`} />
          <Ligne nom="Série" valeur={`${p.streak?.count ?? 0} jour(s)`} />
          <Ligne nom="Réponses" valeur={`${p.totalAnswers ?? 0} (${p.correctAnswers ?? 0} justes)`} />
          <Ligne nom="Dernier chapitre" valeur={p.lastChapter?.chapterId || '—'} />
          <Ligne nom="Langues étudiées" valeur={(p.studyLanguages || []).join(', ') || '—'} />
          <Ligne nom="Badges" valeur={(p.badges || []).join(', ') || '—'} />
          <Ligne nom="Favoris" valeur={(p.favorites || []).join(', ') || '—'} />
          {d.abonnement && <Ligne nom="Abonnement" valeur={`${d.abonnement.offre || '—'} / ${d.abonnement.periode || '—'} / ${d.abonnement.statut}${d.abonnement.mode_test ? ' (test)' : ''}`} />}
        </dl>
      </section>
      <ChangerOffre id={d.id} nom={d.nom} abonnement={d.abonnement} />
      <section className="adm-bloc">
        <h3>Temps passé par thème</h3>
        {temps.length ? <table><tbody>{temps.map(([k, v]) => <tr key={k}><td>{k}</td><td><b>{duree(v)}</b></td></tr>)}</tbody></table> : <p>Aucun.</p>}
      </section>
      <section className="adm-bloc">
        <h3>XP par jour</h3>
        {jours.length ? <table><tbody>{jours.map(([k, v]) => <tr key={k}><td>{k}</td><td><b>{v}</b></td></tr>)}</tbody></table> : <p>Aucun.</p>}
      </section>
      <section className="adm-bloc">
        <h3>Chapitres et exercices</h3>
        {chapitres.length ? <table><tbody>{chapitres.map(([k, v]) => <tr key={k}><td>{k}</td><td>{Object.keys(v?.games || {}).length} exercice(s)</td><td><b>{v?.pct ?? '—'} %</b></td></tr>)}</tbody></table> : <p>Aucun exercice enregistré.</p>}
      </section>
      {d.ia?.length > 0 && <section className="adm-bloc"><h3>Usage de l’IA</h3><table><tbody>{d.ia.map((i, k) => <tr key={k}><td>{i.fonction}</td><td>{i.periode}</td><td><b>{i.n}</b></td></tr>)}</tbody></table></section>}
    </div>
  )
}

const dansLes = (iso, jours) => !!iso && Date.now() - new Date(iso).getTime() <= jours * JOUR

function Comptes({ filtreInitial = {}, onFiltre }) {
  const [etat, setEtat] = useState({ charge: false })
  const [voir, setVoir] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [f, setF] = useState({ role: '', niveau: '', offre: '', periode: '', specialite: '', origine: '', ...filtreInitial })
  const [tri, setTri] = useState('recent')
  const [filtresOuverts, setFiltresOuverts] = useState(Object.values(filtreInitial).some(Boolean))
  useEffect(() => {
    let vivant = true
    appelAdmin('revizstmg_admin_comptes').then((r) => { if (vivant) setEtat({ charge: true, ...r }) })
    return () => { vivant = false }
  }, [])
  const lignes = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    const offreDe = (c) => c.offre || 'gratuit'
    const tris = { recent: (a, b) => (a.cree < b.cree ? 1 : -1), actif: (a, b) => ((a.maj || '') < (b.maj || '') ? 1 : -1), xp: (a, b) => (b.xp || 0) - (a.xp || 0), temps: (a, b) => (b.temps_s || 0) - (a.temps_s || 0) }
    return (etat.data || [])
      .filter((c) => (!q || `${c.nom} ${c.email} ${c.specialite} ${c.niveau}`.toLowerCase().includes(q))
        && (!f.role || c.role === f.role) && (!f.niveau || c.niveau === f.niveau) && (!f.specialite || (c.specialite || c.niveau || 'inconnu') === f.specialite)
        && (!f.offre || (f.offre === 'payant' ? offreDe(c) !== 'gratuit' : offreDe(c) === f.offre))
        && (!f.origine || (offreDe(c) !== 'gratuit' && (f.origine === 'offert' ? !!c.offre_offerte : !c.offre_offerte)))
        && (!f.periode || (f.periode === 'cree1' ? dansLes(c.cree, 1) : f.periode === 'cree7' ? dansLes(c.cree, 7) : f.periode === 'maj1' ? dansLes(c.maj, 1) : dansLes(c.maj, 7))))
      .sort(tris[tri])
  }, [etat.data, recherche, f, tri])
  if (voir) return <Detail id={voir} onRetour={() => setVoir(null)} />
  if (!etat.charge) return <p role="status" lang="fr" data-no-translate>Chargement…</p>
  if (!etat.ok) return <p role="alert" className="adm-erreur" lang="fr" data-no-translate>Erreur : {etat.erreur}</p>
  const actifs = Object.entries(f).filter(([, v]) => v)
  const libelleFiltre = (k, v) => ({ role: v === 'prof' ? 'Professeurs' : 'Élèves', niveau: NIVEAUX[v] || v, offre: v === 'payant' ? 'Abonnés' : nomOffre(v), periode: (PERIODES.find(([x]) => x === v) || [0, v])[1], specialite: `Spécialité : ${v}`, origine: v === 'offert' ? 'Offerts par un admin' : 'Payés via Stripe' })[k]
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); onFiltre?.() }
  return (
    <div lang="fr" data-no-translate>
      <label className="adm-doux" htmlFor="admin-recherche" style={{ fontWeight: 700 }}>Chercher un compte</label>
      <input id="admin-recherche" value={recherche} onChange={(e) => setRecherche(e.target.value)} className="adm-champ" placeholder="Nom, e-mail, spécialité…" />
      <details className="adm-deplier" open={filtresOuverts} onToggle={(e) => setFiltresOuverts(e.currentTarget.open)}>
        <summary>Filtres et tri</summary>
      <div className="adm-filtres">
        <label>Rôle <select value={f.role} onChange={set('role')}><option value="">Tous</option><option value="eleve">Élèves</option><option value="prof">Profs</option></select></label>
        <label>Niveau <select value={f.niveau} onChange={set('niveau')}><option value="">Tous</option><option value="terminale-stmg">Terminale</option><option value="premiere-stmg">Première</option></select></label>
        <label>Offre <select value={f.offre} onChange={set('offre')}><option value="">Toutes</option><option value="payant">Abonnés (tous)</option><option value="premium">Premium</option><option value="ultimate">Ultimate</option><option value="gratuit">Gratuit</option></select></label>
        <label>Période <select value={f.periode} onChange={set('periode')}>{PERIODES.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
        <label>Trier par <select value={tri} onChange={(e) => setTri(e.target.value)}><option value="recent">Inscription récente</option><option value="actif">Dernière activité</option><option value="xp">XP</option><option value="temps">Temps passé</option></select></label>
      </div>
      </details>
      {actifs.length > 0 && (
        <div className="adm-puces" aria-label="Filtres actifs">
          {actifs.map(([k, v]) => <span key={k} className="adm-puce">{libelleFiltre(k, v)}</span>)}
          <button type="button" className="adm-lien" onClick={() => setF({ role: '', niveau: '', offre: '', periode: '', specialite: '', origine: '' })}>Tout effacer</button>
        </div>
      )}
      <p><b>{lignes.length}</b> compte(s) sur {(etat.data || []).length}</p>
      <ul className="adm-liste">
        {lignes.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => setVoir(c.id)} className="adm-ligne">
              <span className="adm-nom">{c.nom || '(sans nom)'}<span className="adm-badge" data-offre={c.offre || 'gratuit'}>{nomOffre(c.offre || 'gratuit')}{c.offre_offerte ? ' · offert' : ''}</span></span>
              <span className="adm-meta">{c.role === 'prof' ? 'Professeur' : 'Élève'} · {NIVEAUX[c.niveau] || c.niveau || '—'}{c.specialite ? ` · ${c.specialite}` : ''} · {c.email}</span>
              <span className="adm-meta">Inscrit {dateFr(c.cree)} · synchro {dateFr(c.maj)}</span>
              <span className="adm-chiffres"><span><b>{c.xp ?? 0}</b> XP</span><span>série <b>{c.serie ?? 0}</b></span><span><b>{c.reponses ?? 0}</b> réponses</span><span><b>{c.exercices}</b> exercices</span><span><b>{c.chapitres}</b> chapitres</span><span><b>{duree(c.temps_s)}</b></span></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Divers({ section, ouvertsInitial = false }) {
  const [etat, setEtat] = useState({ charge: false })
  const [seulementOuverts, setSeulementOuverts] = useState(ouvertsInitial)
  useEffect(() => {
    let vivant = true
    appelAdmin('revizstmg_admin_divers').then((r) => { if (vivant) setEtat({ charge: true, ...r }) })
    return () => { vivant = false }
  }, [])
  if (!etat.charge) return <p role="status" lang="fr" data-no-translate>Chargement…</p>
  if (!etat.ok) return <p role="alert" className="adm-erreur" lang="fr" data-no-translate>Erreur : {etat.erreur}</p>
  const d = etat.data
  if (section === 'abos') {
    return (
      <section className="adm-bloc" lang="fr" data-no-translate>
        <h2>Usage de l’IA</h2>
        {d.ia.length ? <div className="adm-defile"><table><thead><tr><th>Compte</th><th>Fonction</th><th>Période</th><th>Usages</th></tr></thead><tbody>{d.ia.map((a, i) => <tr key={i}><td>{a.nom || '—'}</td><td>{a.fonction}</td><td>{a.periode}</td><td><b>{a.n}</b></td></tr>)}</tbody></table></div> : <p>Aucun usage.</p>}
      </section>
    )
  }
  if (section === 'classes') {
    return (
      <div lang="fr" data-no-translate>
        <section className="adm-bloc" style={{ marginTop: 0 }}>
          <h2>Classes</h2>
          {d.classes.length ? <div className="adm-defile"><table><thead><tr><th>Classe</th><th>Matière</th><th>Prof</th><th>Membres</th><th>Créée</th></tr></thead><tbody>{d.classes.map((c) => <tr key={c.code}><td><b>{c.nom || c.code}</b> ({c.code})</td><td>{c.matiere || '—'}</td><td>{c.prof || '—'}</td><td><b>{c.membres}</b></td><td>{dateFr(c.cree)}</td></tr>)}</tbody></table></div> : <p>Aucune classe.</p>}
        </section>
        <section className="adm-bloc">
          <h2>Vie sociale</h2>
          <div className="adm-grille">
            <div className="adm-kpi adm-fixe"><span className="adm-nombre">{d.social.amis}</span><span className="adm-titre">Profils d’amis</span></div>
            <div className="adm-kpi adm-fixe"><span className="adm-nombre">{d.social.demandes}</span><span className="adm-titre">Demandes</span></div>
            <div className="adm-kpi adm-fixe"><span className="adm-nombre">{d.social.classement}</span><span className="adm-titre">Lignes de classement</span></div>
            <div className="adm-kpi adm-fixe"><span className="adm-nombre">{d.social.membres_classe}</span><span className="adm-titre">Membres de classe</span></div>
          </div>
        </section>
      </div>
    )
  }
  const liste = d.signalements.filter((s) => !seulementOuverts || !s.traite)
  return (
    <section className="adm-bloc" style={{ marginTop: 0 }} lang="fr" data-no-translate>
      <h2>Signalements d’erreurs</h2>
      <div className="adm-puces">
        <button type="button" className="adm-onglet" aria-pressed={seulementOuverts} onClick={() => setSeulementOuverts((v) => !v)}>{seulementOuverts ? 'Seulement à traiter' : 'Tous'}</button>
        <span><b>{liste.length}</b> signalement(s)</span>
      </div>
      {liste.length ? (
        <ul className="adm-liste">
          {liste.map((s) => (
            <li key={s.id} className="adm-sig" data-traite={s.traite ? 'oui' : 'non'}>
              <span className="adm-etat">{s.traite ? '✅ Traité' : '🟠 À traiter'} · {dateFr(s.cree)} · {s.auteur || 'anonyme'}</span>
              <span className="adm-meta">{s.page} {s.theme || ''} {s.exercice || ''} · {s.categorie}</span>
              <span className="adm-message">{s.message}</span>
            </li>
          ))}
        </ul>
      ) : <p>Aucun signalement.</p>}
    </section>
  )
}

export default function Admin() {
  // 'verif' : on demande à la base si ce compte est administrateur ; la réponse décide, pas l'adresse affichée.
  const [acces, setAcces] = useState('verif')
  const [nav, setNav] = useState({ onglet: 'apercu', filtre: {}, cle: 0 })
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
  const aller = (onglet, filtre = {}) => { setNav((n) => ({ onglet, filtre, cle: n.cle + 1 })); window.scrollTo?.(0, 0) }
  return (
    <div className="adm" lang="fr" data-no-translate>
      <header className="adm-entete">
        <p className="adm-doux" style={{ fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Administration</p>
        <h1>Tableau de bord</h1>
        <p className="adm-doux">E-mails masqués. Seul le changement d’offre modifie des données.</p>
      </header>
      {acces === 'verif' && <p role="status">Vérification de ton accès…</p>}
      {acces === 'erreur' && <p role="alert" className="adm-erreur">Impossible de charger les données (réseau ou base). Réessaie dans un instant.</p>}
      {acces === 'oui' && (
        <>
          <nav aria-label="Sections" className="adm-onglets">
            {ONGLETS.map(([id, nom]) => (
              <button key={id} type="button" className="adm-onglet" aria-pressed={nav.onglet === id} onClick={() => aller(id)}>{nom}</button>
            ))}
          </nav>
          {nav.onglet === 'apercu' && apercu && <Apercu donnees={apercu} aller={aller} />}
          {nav.onglet === 'comptes' && <Comptes key={nav.cle} filtreInitial={nav.filtre} />}
          {nav.onglet === 'abos' && <><h2>Comptes abonnés</h2><Comptes key={nav.cle} filtreInitial={{ offre: 'payant', ...nav.filtre }} /><div style={{ marginTop: 16 }}><Divers section="abos" /></div></>}
          {(nav.onglet === 'signalements' || nav.onglet === 'classes') && <Divers key={nav.cle} section={nav.onglet} ouvertsInitial={!!nav.filtre.ouverts} />}
        </>
      )}
    </div>
  )
}
