// Rapport quotidien de RévizSTMG envoyé par mail (routine de vérification du
// matin) : la vérification du site, un tableau analytique (valeur, écart sur 7 et
// 30 jours) et des graphiques d'évolution.
//
// Le HTML est écrit pour les messageries : styles en ligne, mise en page en
// tableaux, aucun script ni image à charger. Les graphiques sont des colonnes
// dessinées avec des cellules de tableau, lisibles dans Gmail sur téléphone.
// Fonctions pures : scripts/rapport-mail.mjs rassemble les données et écrit les
// fichiers ; tests/rapport.test.js vérifie le rendu.

// Couleurs : deux teintes de données validées (bleu, orange), le reste en encres
// neutres. Le texte ne prend jamais la couleur d'une série.
const COULEURS = {
  fond: '#f4f2ec', carte: '#ffffff', encre: '#1f1d1a', encre2: '#52514e', discret: '#6b6862',
  trait: '#e4e0d6', vide: '#d9d5cc', serie1: '#2a78d6', serie2: '#eb6834',
  hausse: '#1a7f37', baisse: '#b42318', accent: '#8a6d1e',
}
const POLICE = "Arial, Helvetica, sans-serif"
const NIVEAUX = { 'terminale-stmg': 'Terminale', 'premiere-stmg': 'Première' }

export const echapper = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
export const nombre = (n) => (n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('fr-FR').replace(/ /g, ' '))
const dateCourte = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const dateLongue = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const heureParis = (iso) => (iso ? new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : '—')
const decaler = (iso, jours) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + jours)
  return d.toISOString().slice(0, 10)
}

// Valeur d'un indicateur à une date passée : la dernière ligne de l'historique
// au plus tard à cette date.
export function valeurAu(historique, cle, date) {
  let v = null
  for (const h of historique) if (h.date <= date && h[cle] != null) v = h[cle]
  return v
}
export function ecart(historique, cle, valeur, dateRef, jours) {
  if (valeur == null) return null
  const avant = valeurAu(historique, cle, decaler(dateRef, -jours))
  return avant == null ? null : valeur - avant
}

function variation(d) {
  if (d == null) return `<span style="color:${COULEURS.discret}">—</span>`
  if (d === 0) return `<span style="color:${COULEURS.discret}">= 0</span>`
  const haut = d > 0
  return `<span style="color:${haut ? COULEURS.hausse : COULEURS.baisse};font-weight:bold">${haut ? '▲ +' : '▼ −'}${nombre(Math.abs(d))}</span>`
}

// ---- Briques HTML ----------------------------------------------------------------
const titre = (t) => `<h2 style="margin:28px 0 10px;font:bold 17px ${POLICE};color:${COULEURS.encre}">${t}</h2>`
const note = (t) => `<p style="margin:6px 0 0;font:12px/1.5 ${POLICE};color:${COULEURS.discret}">${t}</p>`

function tuiles(liste) {
  // Deux tuiles par ligne : lisible sur téléphone.
  const lignes = []
  for (let k = 0; k < liste.length; k += 2) lignes.push(liste.slice(k, k + 2))
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:8px">${lignes.map((l) => `<tr>${l.map((t) => `
    <td width="50%" valign="top" style="background:${COULEURS.fond};border-radius:10px;padding:12px 14px">
      <div style="font:12px ${POLICE};color:${COULEURS.encre2}">${t.label}</div>
      <div style="font:bold 26px ${POLICE};color:${COULEURS.encre};margin-top:2px">${nombre(t.valeur)}</div>
      <div style="font:12px ${POLICE};color:${COULEURS.discret};margin-top:2px">${variation(t.ecart)} <span>en 7 jours</span></div>
    </td>`).join('')}</tr>`).join('')}</table>`
}

function tableau(groupes) {
  const th = (t, align = 'right') => `<th style="text-align:${align};padding:8px 6px;font:bold 12px ${POLICE};color:${COULEURS.encre2};border-bottom:2px solid ${COULEURS.trait};white-space:nowrap">${t}</th>`
  const td = (t, align = 'right', gras = false, retrait = 6) => `<td style="text-align:${align};padding:7px 6px 7px ${retrait}px;font:${gras ? 'bold ' : ''}13px ${POLICE};color:${COULEURS.encre};border-bottom:1px solid ${COULEURS.trait}${align === 'right' ? ';white-space:nowrap' : ''}">${t}</td>`
  const corps = groupes.map((g) => `
    <tr><td colspan="4" style="padding:14px 6px 4px;font:bold 12px ${POLICE};color:${COULEURS.accent};text-transform:uppercase;letter-spacing:.04em">${g.titre}</td></tr>
    ${g.lignes.map((l) => `<tr>${td(l.label, 'left', false, l.label.startsWith('dont ') ? 20 : 6)}${td(nombre(l.valeur), 'right', true)}${td(variation(l.e7))}${td(variation(l.e30))}</tr>`).join('')}`).join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    <tr>${th('Indicateur', 'left')}${th('Valeur')}${th('7 jours')}${th('30 jours')}</tr>${corps}</table>`
}

// Barres horizontales (répartitions) : une seule teinte, valeur au bout.
function barres(entrees, total) {
  if (!entrees.length) return note('Pas encore de données.')
  const max = Math.max(...entrees.map((e) => e[1]), 1)
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${entrees.map(([nom, n]) => `
    <tr>
      <td width="38%" style="padding:4px 8px 4px 0;font:13px ${POLICE};color:${COULEURS.encre}">${echapper(nom)}</td>
      <td style="padding:4px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="${Math.max(2, Math.round((n / max) * 82))}%" style="height:14px;background:${COULEURS.serie1};border-radius:0 4px 4px 0;font-size:1px;line-height:1px">&nbsp;</td>
          <td style="padding-left:6px;font:13px ${POLICE};color:${COULEURS.encre2};white-space:nowrap">${nombre(n)}${total ? ` <span style="color:${COULEURS.discret}">(${Math.round((n / total) * 100)} %)</span>` : ''}</td>
        </tr></table>
      </td>
    </tr>`).join('')}</table>`
}

// Graphique en colonnes : une colonne par jour, empilée si plusieurs séries.
// Valeur écrite au sommet de la dernière colonne et de la plus haute ; dates de
// début et de fin sous l'axe ; un jour sans relevé reste une colonne vide.
export function colonnes({ points, series, hauteur = 110 }) {
  const totaux = points.map((p) => (p.valeurs.every((v) => v == null) ? null : p.valeurs.reduce((a, v) => a + (v || 0), 0)))
  const max = Math.max(1, ...totaux.filter((v) => v != null))
  const iMax = totaux.indexOf(Math.max(...totaux.filter((v) => v != null)))
  const dernier = totaux.length - 1 - [...totaux].reverse().findIndex((v) => v != null)
  const cellules = points.map((p, k) => {
    const total = totaux[k]
    const bulle = `${dateCourte(p.date)} : ${total == null ? 'pas de relevé' : series.map((s, j) => `${s.nom} ${nombre(p.valeurs[j] ?? 0)}`).join(', ')}`
    let contenu
    if (total == null || total === 0) {
      contenu = `<div style="height:2px;background:${COULEURS.vide};font-size:1px;line-height:1px">&nbsp;</div>`
    } else {
      // De haut en bas : la dernière série en premier, séparées par 2 px de vide.
      const segments = series.map((s, j) => ({ s, v: p.valeurs[j] || 0 })).filter((x) => x.v > 0).reverse()
      contenu = segments.map((x, j) => {
        const h = Math.max(2, Math.round((x.v / max) * hauteur))
        const rayon = j === 0 ? '4px 4px 0 0' : '0'
        return `${j > 0 ? '<div style="height:2px;font-size:1px;line-height:1px">&nbsp;</div>' : ''}<div style="height:${h}px;background:${x.s.couleur};border-radius:${rayon};font-size:1px;line-height:1px">&nbsp;</div>`
      }).join('')
    }
    const etiquette = (k === dernier || (k === iMax && iMax !== dernier && totaux[iMax] > 0)) && total != null
      ? `<div style="font:bold 11px ${POLICE};color:${COULEURS.encre};text-align:center;white-space:nowrap;padding-bottom:2px">${nombre(total)}</div>`
      : ''
    return `<td valign="bottom" title="${echapper(bulle)}" style="vertical-align:bottom;padding:0 1px;height:${hauteur + 18}px">
      <div style="max-width:24px;margin:0 auto">${etiquette}${contenu}</div></td>`
  }).join('')
  const legende = series.length > 1
    ? `<div style="margin:0 0 6px;font:12px ${POLICE};color:${COULEURS.encre2}">${series.map((s) => `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.couleur};vertical-align:middle"></span>&nbsp;${s.nom}`).join('&nbsp;&nbsp;&nbsp;')}</div>`
    : ''
  return `${legende}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="table-layout:fixed;border-collapse:collapse;border-bottom:1px solid ${COULEURS.vide}"><tr>${cellules}</tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font:11px ${POLICE};color:${COULEURS.discret};padding-top:4px">${dateCourte(points[0].date)}</td>
      <td style="font:11px ${POLICE};color:${COULEURS.discret};padding-top:4px;text-align:right">${dateCourte(points[points.length - 1].date)}</td>
    </tr></table>`
}

// Jours consécutifs jusqu'à `fin`, avec les valeurs de l'historique (null si absent).
export function serieJours(historique, cles, fin, nbJours) {
  const parDate = new Map(historique.map((h) => [h.date, h]))
  const points = []
  for (let k = nbJours - 1; k >= 0; k--) {
    const date = decaler(fin, -k)
    const h = parDate.get(date)
    points.push({ date, valeurs: cles.map((c) => (h && h[c] != null ? h[c] : null)) })
  }
  return points
}

// Tant qu'aucun relevé n'existe, une ligne suffit à la place du graphique.
const vide = (points) => points.every((p) => p.valeurs.every((v) => v == null))
const enAttente = `<div style="padding:10px 12px;background:${COULEURS.fond};border-radius:8px;font:12px ${POLICE};color:${COULEURS.encre2}">Premier relevé au prochain passage du workflow « Statistiques » : le graphique se remplira jour après jour.</div>`

function graphique({ titre: t, sous, corps, pied }) {
  return `<div style="margin:18px 0 6px;font:bold 14px ${POLICE};color:${COULEURS.encre}">${t}</div>
    ${sous ? `<div style="margin:0 0 8px;font:12px ${POLICE};color:${COULEURS.encre2}">${sous}</div>` : ''}${corps}${pied ? note(pied) : ''}`
}

// ---- Rapport -----------------------------------------------------------------------
// donnees : { jour, verif, releve, contenu, publication, historique, nomMatiere }
//   verif       : { construction, tests, parcours: { ok, detail }, themes: [], problemes: [{ gravite, titre, ou, correction }] } ou null
//   releve      : { date, heure, utilisation } (statistiques/dernier.json) ou null
//   contenu     : comptages du contenu (scripts/stats-sources.mjs)
//   publication : { ci, miseEnLigne, modifications7j }
//   historique  : statistiques/historique.json
export function construireRapport({ jour, verif = null, releve = null, contenu = {}, publication = {}, historique = [], nomMatiere = (id) => id, site = 'https://revizstmg.github.io' }) {
  const u = releve?.utilisation && !releve.utilisation.erreur ? releve.utilisation : null
  const dateU = releve?.date || jour
  // L'historique, complété du contenu mesuré ce matin.
  const histo = [...historique.filter((h) => h.date !== jour), { ...(historique.find((h) => h.date === jour) || {}), date: jour, ...pick(contenu, ['themes', 'chapitres', 'questions', 'flashcards']) }]
    .sort((a, b) => a.date.localeCompare(b.date))

  // ---- Vérification ----
  const problemes = verif?.problemes || []
  const ok = (x) => (x == null ? null : !!x.ok)
  const controles = [
    ['Construction du site', ok(verif?.construction), verif?.construction?.detail],
    ['Tests unitaires', ok(verif?.tests), verif?.tests?.detail],
    ['Parcours dans le navigateur', ok(verif?.parcours), verif?.parcours?.detail],
    ['CI sur main', publication.ci ? publication.ci.etat === 'success' : null, publication.ci ? heureParis(publication.ci.date) : ''],
    ['Mise en ligne (GitHub Pages)', publication.miseEnLigne ? publication.miseEnLigne.etat === 'success' : null, publication.miseEnLigne ? heureParis(publication.miseEnLigne.date) : ''],
  ]
  const echecs = controles.filter((c) => c[1] === false).length
  const graves = problemes.filter((p) => p.gravite === 'grave').length
  const verdict = !verif
    ? { icone: 'ℹ️', texte: 'Vérification non fournie' }
    : echecs || graves
      ? { icone: '❌', texte: `${echecs ? `${echecs} contrôle${echecs > 1 ? 's' : ''} en échec` : ''}${echecs && graves ? ', ' : ''}${graves ? `${graves} problème${graves > 1 ? 's' : ''} grave${graves > 1 ? 's' : ''}` : ''}` }
      : problemes.length
        ? { icone: '⚠️', texte: `${problemes.length} problème${problemes.length > 1 ? 's' : ''} à corriger` }
        : { icone: '✅', texte: 'Rien à signaler' }
  const etat = (v) => (v == null ? '—' : v ? '✅' : '❌')

  const blocVerif = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${controles.map(([nom, v, detail]) => `
      <tr>
        <td width="28" style="padding:6px 0;font:15px ${POLICE}">${etat(v)}</td>
        <td style="padding:6px 0;font:13px ${POLICE};color:${COULEURS.encre}">${nom}</td>
        <td style="padding:6px 0;font:12px ${POLICE};color:${COULEURS.discret};text-align:right">${echapper(detail || '')}</td>
      </tr>`).join('')}</table>
    ${problemes.length
    ? `<div style="margin-top:12px">${problemes.map((p, k) => `
      <div style="margin:0 0 10px;padding:10px 12px;border-left:4px solid ${p.gravite === 'grave' ? COULEURS.baisse : p.gravite === 'moyen' ? COULEURS.serie2 : COULEURS.vide};background:${COULEURS.fond};border-radius:0 8px 8px 0">
        <div style="font:bold 13px ${POLICE};color:${COULEURS.encre}">${k + 1}. ${echapper(p.titre)} <span style="font-weight:normal;color:${COULEURS.discret}">· ${echapper(p.gravite || '')}</span></div>
        ${p.ou ? `<div style="font:12px ${POLICE};color:${COULEURS.encre2};margin-top:3px">Où : ${echapper(p.ou)}</div>` : ''}
        ${p.correction ? `<div style="font:12px ${POLICE};color:${COULEURS.encre2};margin-top:3px">Correction proposée : ${echapper(p.correction)}</div>` : ''}
      </div>`).join('')}</div>`
    : verif ? `<p style="margin:10px 0 0;font:bold 14px ${POLICE};color:${COULEURS.hausse}">Rien à signaler.</p>` : note('La routine n’a pas transmis le résultat de sa vérification.')}
    ${verif?.themes?.length ? note(`Thèmes relus aujourd’hui : ${verif.themes.map(echapper).join(' · ')}.`) : ''}`

  // ---- Chiffres clés et tableau analytique ----
  const e = (cle, valeur, date, jours) => ecart(histo, cle, valeur, date, jours)
  const ligneU = (label, cle, valeur) => ({ label, valeur, e7: cle ? e(cle, valeur, dateU, 7) : null, e30: cle ? e(cle, valeur, dateU, 30) : null })
  const ligneC = (label, cle) => ({ label, valeur: contenu[cle], e7: e(cle, contenu[cle], jour, 7), e30: e(cle, contenu[cle], jour, 30) })
  const comptes = u?.comptes ?? null

  const tuilesHtml = tuiles([
    { label: 'Comptes inscrits', valeur: comptes, ecart: e('comptes', comptes, dateU, 7) },
    { label: 'Comptes actifs (7 jours)', valeur: u?.actifs_7j ?? null, ecart: e('actifs_7j', u?.actifs_7j ?? null, dateU, 7) },
    { label: 'Visites la veille', valeur: u?.visites_hier ?? null, ecart: e('visites', u?.visites_hier ?? null, dateU, 7) },
    { label: 'Questions d’exercices', valeur: contenu.questions ?? null, ecart: e('questions', contenu.questions ?? null, jour, 7) },
  ])

  const groupes = []
  if (u) {
    groupes.push({ titre: 'Inscriptions', lignes: [
      ligneU('Comptes inscrits', 'comptes', u.comptes),
      ligneU('dont élèves', 'eleves', u.eleves),
      ligneU('dont professeurs', 'profs', u.profs),
      ligneU('Nouveaux comptes (7 jours)', null, u.nouveaux_7j),
      ligneU('Nouveaux comptes (30 jours)', null, u.nouveaux_30j),
    ] })
    groupes.push({ titre: 'Activité', lignes: [
      ligneU('Comptes actifs (24 h)', 'actifs_1j', u.actifs_1j),
      ligneU('Comptes actifs (7 jours)', 'actifs_7j', u.actifs_7j),
      ligneU('Comptes actifs (30 jours)', 'actifs_30j', u.actifs_30j),
      ligneU('Visites la veille', 'visites', u.visites_hier),
      ligneU('Pages vues la veille', 'vues', u.vues_hier),
      ligneU('Visites sur 7 jours', null, u.visites_7j),
    ] })
    groupes.push({ titre: 'Classes et entraide', lignes: [
      ligneU('Classes de professeurs', 'classes', u.classes),
      ligneU('Élèves inscrits dans une classe', null, u.eleves_en_classe),
      ligneU('Défis entre amis', 'defis_amis', u.defis_amis),
      ligneU('Élèves suivis par leurs parents', 'suivis_parents', u.suivis_parents),
    ] })
  }
  groupes.push({ titre: 'Contenu', lignes: [
    ligneC('Thèmes', 'themes'), ligneC('Chapitres de cours', 'chapitres'),
    { label: 'Séries d’exercices', valeur: contenu.series, e7: null, e30: null },
    ligneC('Questions d’exercices', 'questions'), ligneC('Flashcards', 'flashcards'),
  ] })

  // ---- Répartitions ----
  const tri = (obj, nommer) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).map(([k, n]) => [nommer(k), n])
  const repartitions = u ? `
    ${titre('🎯 Qui utilise RévizSTMG')}
    <div style="font:bold 13px ${POLICE};color:${COULEURS.encre2};margin:4px 0 6px">Élèves par niveau</div>
    ${barres(tri(u.niveaux, (k) => NIVEAUX[k] || k), u.eleves)}
    <div style="font:bold 13px ${POLICE};color:${COULEURS.encre2};margin:14px 0 6px">Élèves de Terminale par spécialité</div>
    ${barres(tri(u.specialites, nomMatiere), Object.values(u.specialites || {}).reduce((a, n) => a + n, 0))}
    ${Object.keys(u.ecrans_7j || {}).length ? `<div style="font:bold 13px ${POLICE};color:${COULEURS.encre2};margin:14px 0 6px">Écrans les plus vus (7 jours)</div>${barres(tri(u.ecrans_7j, (k) => k).slice(0, 8), u.vues_7j)}` : ''}` : ''

  // ---- Évolution ----
  const debutComptes = histo.find((h) => h.comptes != null)?.date
  const nbJoursComptes = debutComptes ? Math.min(60, Math.round((new Date(`${dateU}T12:00:00Z`) - new Date(`${debutComptes}T12:00:00Z`)) / 864e5) + 1) : 0
  const reconstitue = histo.some((h) => h.reconstitue)
  const debutActifs = histo.find((h) => h.actifs_7j != null)?.date
  const debutVisites = histo.find((h) => h.visites != null)?.date
  const depuis = (d) => `Relevés quotidiens depuis le ${dateCourte(d)}.`
  const evolution = `
    ${titre('📈 Évolution')}
    ${nbJoursComptes > 1 ? graphique({
    titre: 'Comptes inscrits',
    sous: `${nombre(comptes)} comptes · ${variation(e('comptes', comptes, dateU, 7))} en 7 jours · ${variation(e('comptes', comptes, dateU, 30))} en 30 jours`,
    corps: colonnes({ points: serieJours(histo, ['eleves', 'profs'], dateU, nbJoursComptes), series: [{ nom: 'Élèves', couleur: COULEURS.serie1 }, { nom: 'Professeurs', couleur: COULEURS.serie2 }] }),
    pied: reconstitue ? 'Jusqu’au 12 octobre 2026 : reconstitué d’après la date de création des comptes existants (un compte supprimé n’y figure pas).' : '',
  }) : ''}
    ${graphique({
    titre: 'Comptes actifs sur 7 jours',
    sous: 'Comptes dont la progression a été synchronisée dans les 7 jours.',
    corps: vide(serieJours(histo, ['actifs_7j'], dateU, 30)) ? enAttente : colonnes({ points: serieJours(histo, ['actifs_7j'], dateU, 30), series: [{ nom: 'Actifs', couleur: COULEURS.serie1 }] }),
    pied: debutActifs ? depuis(debutActifs) : '',
  })}
    ${graphique({
    titre: 'Visites par jour',
    sous: 'Un onglet ouvert sur le site = une visite. Sans cookie ni identifiant.',
    corps: vide(serieJours(histo, ['visites'], dateU, 30)) ? enAttente : colonnes({ points: serieJours(histo, ['visites'], dateU, 30), series: [{ nom: 'Visites', couleur: COULEURS.serie1 }] }),
    pied: debutVisites ? depuis(debutVisites) : '',
  })}`

  // ---- Assemblage ----
  const releveTexte = u ? `Chiffres d’utilisation relevés le ${heureParis(releve.heure)}.` : `Chiffres d’utilisation indisponibles${releve?.utilisation?.erreur ? ` (${echapper(releve.utilisation.erreur)})` : ''}.`
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rapport RévizSTMG</title></head>
<body style="margin:0;padding:0;background:${COULEURS.fond}">
<div style="background:${COULEURS.fond};padding:16px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:${COULEURS.carte};border-radius:14px">
<tr><td style="padding:22px 20px 26px">
  <div style="font:12px ${POLICE};color:${COULEURS.accent};text-transform:uppercase;letter-spacing:.06em">RévizSTMG · rapport du matin</div>
  <h1 style="margin:4px 0 6px;font:bold 22px ${POLICE};color:${COULEURS.encre}">${dateLongue(jour).replace(/^./, (c) => c.toUpperCase())}</h1>
  <div style="font:15px ${POLICE};color:${COULEURS.encre}">${verdict.icone} <b>${verdict.texte}</b>${comptes != null ? ` · ${nombre(comptes)} inscrits` : ''}</div>

  ${titre('🔎 Vérification du site')}
  ${blocVerif}

  ${titre('📊 Chiffres clés')}
  ${tuilesHtml}
  ${note(releveTexte)}

  ${titre('🧮 Tableau analytique')}
  ${tableau(groupes)}
  ${note('Écarts calculés par rapport au relevé d’il y a 7 et 30 jours ; « — » quand il n’y en a pas encore.')}

  ${repartitions}
  ${evolution}

  <p style="margin:28px 0 0;padding-top:14px;border-top:1px solid ${COULEURS.trait};font:12px/1.6 ${POLICE};color:${COULEURS.discret}">
    Mail envoyé chaque matin par la routine de vérification de RévizSTMG.<br>
    <a href="${site}" style="color:${COULEURS.accent}">Ouvrir le site</a> ·
    <a href="https://github.com/revizstmg/revizstmg.github.io/blob/main/statistiques/STATISTIQUES.md" style="color:${COULEURS.accent}">Statistiques détaillées</a> ·
    Modifications de l’app ces 7 derniers jours : ${nombre(publication.modifications7j)}
  </p>
</td></tr></table></div></body></html>`

  // ---- Version texte ----
  const t = []
  t.push(`RévizSTMG — rapport du ${dateLongue(jour)}`, `${verdict.icone} ${verdict.texte}${comptes != null ? ` · ${nombre(comptes)} inscrits` : ''}`, '', 'VÉRIFICATION DU SITE')
  for (const [nom, v, detail] of controles) t.push(`${etat(v)} ${nom}${detail ? ` (${detail})` : ''}`)
  problemes.forEach((p, k) => t.push(`${k + 1}. [${p.gravite || '?'}] ${p.titre}${p.ou ? ` — Où : ${p.ou}` : ''}${p.correction ? ` — Correction : ${p.correction}` : ''}`))
  if (verif && !problemes.length) t.push('Rien à signaler.')
  if (verif?.themes?.length) t.push(`Thèmes relus : ${verif.themes.join(' · ')}`)
  t.push('', 'TABLEAU ANALYTIQUE (valeur · 7 jours · 30 jours)')
  const signe = (d) => (d == null ? '—' : d === 0 ? '= 0' : `${d > 0 ? '+' : '−'}${nombre(Math.abs(d))}`)
  for (const g of groupes) {
    t.push(`${g.titre} :`)
    for (const l of g.lignes) t.push(`  ${l.label} : ${nombre(l.valeur)} · ${signe(l.e7)} · ${signe(l.e30)}`)
  }
  t.push('', releveTexte, '', `Site : ${site}`)
  const texte = t.join('\n') + '\n'

  const sujet = `RévizSTMG · ${dateCourte(jour)} · ${verdict.icone} ${verdict.texte}${comptes != null ? ` · ${nombre(comptes)} inscrits` : ''}`
  return { sujet, html, texte }
}

function pick(obj, cles) {
  const o = {}
  for (const c of cles) if (obj?.[c] != null) o[c] = obj[c]
  return o
}
