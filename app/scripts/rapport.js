// Rapport quotidien de RévizSTMG envoyé par mail (routine de vérification du
// matin) : la vérification du site, un tableau analytique (valeur, écart sur 7 et
// 30 jours) et des graphiques d'évolution.
//
// Le HTML est écrit pour les messageries : mise en page en tableaux, aucun script
// ni image à charger. Les graphiques sont des colonnes dessinées avec des cellules
// de tableau. Les styles communs sont dans un bloc <style> (Gmail le lit) pour que
// le mail reste léger : la routine le transmet en entier à l'outil d'envoi, et
// Gmail coupe les messages de plus de 102 Ko. Les couleurs et hauteurs des barres
// restent écrites sur chaque barre : les graphiques tiennent même sans le bloc.
// Fonctions pures : scripts/rapport-mail.mjs rassemble les données et écrit les
// fichiers ; tests/rapport.test.js vérifie le rendu.

// Deux teintes de données validées (bleu, orange) ; le texte reste en encres
// neutres, jamais dans la couleur d'une série.
const SERIE1 = '#2a78d6'
const SERIE2 = '#eb6834'
const NIVEAUX = { 'terminale-stmg': 'Terminale', 'premiere-stmg': 'Première' }

const CSS = `body{margin:0;padding:0;background:#f4f2ec}
.f{background:#f4f2ec;padding:16px 8px}
.r{max-width:640px;margin:0 auto;background:#fff;border-radius:14px}
.r td,.r th,.r div,.r p,.r h1,.r h2,.r span{font-family:Arial,Helvetica,sans-serif;color:#1f1d1a}
.in{padding:22px 20px 26px}
.k{font-size:12px;color:#8a6d1e;text-transform:uppercase;letter-spacing:.06em}
h1{margin:4px 0 6px;font-size:22px}
h2{margin:28px 0 10px;font-size:17px}
.v{font-size:15px}
.n{margin:6px 0 0;font-size:12px;line-height:1.5;color:#6b6862}
.x{width:100%;border-collapse:collapse}
.ck td{padding:6px 0;font-size:13px}
.ck .i{width:28px;font-size:15px}
.ck .dt{font-size:12px;color:#6b6862;text-align:right}
.ok{margin:10px 0 0;font-size:14px;font-weight:bold;color:#1a7f37}
.pb{margin:0 0 10px;padding:10px 12px;background:#f4f2ec;border-radius:0 8px 8px 0;font-size:12px;color:#52514e}
.pb b{font-size:13px}
.tu{border-collapse:separate;border-spacing:8px;width:100%}
.tu td{width:50%;vertical-align:top;background:#f4f2ec;border-radius:10px;padding:12px 14px}
.tl{font-size:12px;color:#52514e}
.tv{font-size:26px;font-weight:bold;margin-top:2px}
.te{font-size:12px;color:#6b6862;margin-top:2px}
.a th{text-align:right;padding:8px 6px;font-size:12px;color:#52514e;border-bottom:2px solid #e4e0d6;white-space:nowrap}
.a th.l{text-align:left}
.a td{text-align:right;padding:7px 6px;font-size:13px;border-bottom:1px solid #e4e0d6;white-space:nowrap}
.a td.l{text-align:left;white-space:normal}
.a td.d{padding-left:20px}
.a td.b{font-weight:bold}
.a td.g{text-align:left;padding:14px 6px 4px;font-size:12px;font-weight:bold;color:#8a6d1e;text-transform:uppercase;border:0}
.up{color:#1a7f37;font-weight:bold}
.dn{color:#b42318;font-weight:bold}
.z{color:#6b6862}
.st{font-size:13px;font-weight:bold;color:#52514e;margin:14px 0 6px}
.br td{padding:4px 0;font-size:13px}
.br .nm{width:38%;padding-right:8px}
.br .vl{padding-left:6px;color:#52514e;white-space:nowrap}
.gt{margin:18px 0 6px;font-size:14px;font-weight:bold}
.gs{margin:0 0 8px;font-size:12px;color:#52514e}
.lg{margin:0 0 6px;font-size:12px;color:#52514e}
.ch{table-layout:fixed;width:100%;border-collapse:collapse;border-bottom:1px solid #d9d5cc}
.ch td{vertical-align:bottom;padding:0 1px}
.w{max-width:24px;margin:0 auto}
.lb{font-size:11px;font-weight:bold;text-align:center;white-space:nowrap;padding-bottom:2px}
.ax td{font-size:11px;color:#6b6862;padding-top:4px}
.at{padding:10px 12px;background:#f4f2ec;border-radius:8px;font-size:12px;color:#52514e}
.pd{margin:28px 0 0;padding-top:14px;border-top:1px solid #e4e0d6;font-size:12px;line-height:1.6;color:#6b6862}
.pd a{color:#8a6d1e}`

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
  if (d == null) return '<span class="z">—</span>'
  if (d === 0) return '<span class="z">= 0</span>'
  return d > 0 ? `<span class="up">▲ +${nombre(d)}</span>` : `<span class="dn">▼ −${nombre(-d)}</span>`
}

// ---- Briques HTML ----------------------------------------------------------------
const titre = (t) => `<h2>${t}</h2>`
const note = (t) => `<p class="n">${t}</p>`

function tuiles(liste) {
  // Deux tuiles par ligne : lisible sur téléphone.
  const lignes = []
  for (let k = 0; k < liste.length; k += 2) lignes.push(liste.slice(k, k + 2))
  return `<table role="presentation" class="tu">${lignes.map((l) => `<tr>${l.map((t) => `<td><div class="tl">${t.label}</div><div class="tv">${nombre(t.valeur)}</div><div class="te">${variation(t.ecart)} en 7 jours</div></td>`).join('')}</tr>`).join('')}</table>`
}

function tableau(groupes) {
  const corps = groupes.map((g) => `<tr><td colspan="4" class="g">${g.titre}</td></tr>${g.lignes.map((l) => `<tr><td class="l${l.label.startsWith('dont ') ? ' d' : ''}">${l.label}</td><td class="b">${nombre(l.valeur)}</td><td>${variation(l.e7)}</td><td>${variation(l.e30)}</td></tr>`).join('')}`).join('')
  return `<table role="presentation" class="x a"><tr><th class="l">Indicateur</th><th>Valeur</th><th>7 jours</th><th>30 jours</th></tr>${corps}</table>`
}

// Barres horizontales (répartitions) : une seule teinte, valeur au bout.
function barres(entrees, total) {
  if (!entrees.length) return note('Pas encore de données.')
  const max = Math.max(...entrees.map((e) => e[1]), 1)
  return `<table role="presentation" class="x br">${entrees.map(([nom, n]) => `<tr><td class="nm">${echapper(nom)}</td><td><table role="presentation" class="x"><tr><td width="${Math.max(2, Math.round((n / max) * 82))}%" style="height:14px;background:${SERIE1};border-radius:0 4px 4px 0"></td><td class="vl">${nombre(n)}${total ? ` <span class="z">(${Math.round((n / total) * 100)} %)</span>` : ''}</td></tr></table></td></tr>`).join('')}</table>`
}

// Graphique en colonnes : une colonne par jour, empilée si plusieurs séries.
// Valeur écrite au sommet de la dernière colonne et de la plus haute ; dates de
// début et de fin sous l'axe ; un jour sans relevé reste une colonne vide.
export function colonnes({ points, series, hauteur = 110 }) {
  const totaux = points.map((p) => (p.valeurs.every((v) => v == null) ? null : p.valeurs.reduce((a, v) => a + (v || 0), 0)))
  const connus = totaux.filter((v) => v != null)
  const max = Math.max(1, ...connus)
  const iMax = connus.length ? totaux.indexOf(Math.max(...connus)) : -1
  const dernier = totaux.length - 1 - [...totaux].reverse().findIndex((v) => v != null)
  const cellules = points.map((p, k) => {
    const total = totaux[k]
    const bulle = `${dateCourte(p.date)} : ${total == null ? 'pas de relevé' : series.map((s, j) => `${s.nom} ${nombre(p.valeurs[j] ?? 0)}`).join(', ')}`
    let barre
    if (!total) {
      barre = '<div style="height:2px;background:#d9d5cc"></div>'
    } else {
      // De haut en bas : la dernière série en premier, séparées par 2 px de vide.
      const segments = series.map((s, j) => ({ s, v: p.valeurs[j] || 0 })).filter((x) => x.v > 0).reverse()
      barre = segments.map((x, j) => `${j ? '<div style="height:2px"></div>' : ''}<div style="height:${Math.max(2, Math.round((x.v / max) * hauteur))}px;background:${x.s.couleur}${j ? '' : ';border-radius:4px 4px 0 0'}"></div>`).join('')
    }
    const etiquette = total != null && (k === dernier || (k === iMax && totaux[iMax] > 0)) ? `<div class="lb">${nombre(total)}</div>` : ''
    return `<td valign="bottom" title="${echapper(bulle)}" style="height:${hauteur + 18}px"><div class="w">${etiquette}${barre}</div></td>`
  }).join('')
  const legende = series.length > 1
    ? `<div class="lg">${series.map((s) => `<span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s.couleur};vertical-align:middle"></span>&nbsp;${s.nom}`).join('&nbsp;&nbsp;&nbsp;')}</div>`
    : ''
  return `${legende}<table role="presentation" class="ch"><tr>${cellules}</tr></table><table role="presentation" class="x ax"><tr><td>${dateCourte(points[0].date)}</td><td style="text-align:right">${dateCourte(points[points.length - 1].date)}</td></tr></table>`
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
const EN_ATTENTE = '<div class="at">Premier relevé au prochain passage du workflow « Statistiques » : le graphique se remplira jour après jour.</div>'

function graphique({ titre: t, sous, corps, pied }) {
  return `<div class="gt">${t}</div>${sous ? `<div class="gs">${sous}</div>` : ''}${corps}${pied ? note(pied) : ''}`
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
  const duJour = historique.find((h) => h.date === jour) || {}
  const histo = [...historique.filter((h) => h.date !== jour), { ...duJour, date: jour, ...garder(contenu, ['themes', 'chapitres', 'questions', 'flashcards']) }]
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
  const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`
  const verdict = !verif
    ? { icone: 'ℹ️', texte: 'Vérification non fournie' }
    : echecs || graves
      ? { icone: '❌', texte: [echecs && `${pluriel(echecs, 'contrôle')} en échec`, graves && `${pluriel(graves, 'problème')} grave${graves > 1 ? 's' : ''}`].filter(Boolean).join(', ') }
      : problemes.length
        ? { icone: '⚠️', texte: `${pluriel(problemes.length, 'problème')} à corriger` }
        : { icone: '✅', texte: 'Rien à signaler' }
  const etat = (v) => (v == null ? '—' : v ? '✅' : '❌')
  const bord = { grave: '#b42318', moyen: SERIE2 }

  const blocVerif = `<table role="presentation" class="x ck">${controles.map(([nom, v, detail]) => `<tr><td class="i">${etat(v)}</td><td>${nom}</td><td class="dt">${echapper(detail || '')}</td></tr>`).join('')}</table>${problemes.length
    ? `<div style="margin-top:12px">${problemes.map((p, k) => `<div class="pb" style="border-left:4px solid ${bord[p.gravite] || '#d9d5cc'}"><b>${k + 1}. ${echapper(p.titre)}</b> <span class="z">· ${echapper(p.gravite || '')}</span>${p.ou ? `<br>Où : ${echapper(p.ou)}` : ''}${p.correction ? `<br>Correction proposée : ${echapper(p.correction)}` : ''}</div>`).join('')}</div>`
    : verif ? '<p class="ok">Rien à signaler.</p>' : note('La routine n’a pas transmis le résultat de sa vérification.')}${verif?.themes?.length ? note(`Thèmes relus aujourd’hui : ${verif.themes.map(echapper).join(' · ')}.`) : ''}`

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
  const repartitions = u ? `${titre('🎯 Qui utilise RévizSTMG')}<div class="st">Élèves par niveau</div>${barres(tri(u.niveaux, (k) => NIVEAUX[k] || k), u.eleves)}<div class="st">Élèves de Terminale par spécialité</div>${barres(tri(u.specialites, nomMatiere), Object.values(u.specialites || {}).reduce((a, n) => a + n, 0))}${Object.keys(u.ecrans_7j || {}).length ? `<div class="st">Écrans les plus vus (7 jours)</div>${barres(tri(u.ecrans_7j, (k) => k).slice(0, 8), u.vues_7j)}` : ''}` : ''

  // ---- Évolution ----
  const debutComptes = histo.find((h) => h.comptes != null)?.date
  const nbJoursComptes = debutComptes ? Math.min(60, Math.round((new Date(`${dateU}T12:00:00Z`) - new Date(`${debutComptes}T12:00:00Z`)) / 864e5) + 1) : 0
  const reconstitue = histo.some((h) => h.reconstitue)
  const courbe = (cle, nom) => {
    const points = serieJours(histo, [cle], dateU, 30)
    const debut = histo.find((h) => h[cle] != null)?.date
    return { corps: vide(points) ? EN_ATTENTE : colonnes({ points, series: [{ nom, couleur: SERIE1 }] }), pied: debut ? `Relevés quotidiens depuis le ${new Date(`${debut}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' })}.` : '' }
  }
  const evolution = `${titre('📈 Évolution')}${nbJoursComptes > 1 ? graphique({
    titre: 'Comptes inscrits',
    sous: `${nombre(comptes)} comptes · ${variation(e('comptes', comptes, dateU, 7))} en 7 jours · ${variation(e('comptes', comptes, dateU, 30))} en 30 jours`,
    corps: colonnes({ points: serieJours(histo, ['eleves', 'profs'], dateU, nbJoursComptes), series: [{ nom: 'Élèves', couleur: SERIE1 }, { nom: 'Professeurs', couleur: SERIE2 }] }),
    pied: reconstitue ? 'Jusqu’au 11 octobre 2026 : reconstitué d’après la date de création des comptes existants (un compte supprimé n’y figure pas).' : '',
  }) : ''}${graphique({ titre: 'Comptes actifs sur 7 jours', sous: 'Comptes dont la progression a été synchronisée dans les 7 jours.', ...courbe('actifs_7j', 'Actifs') })}${graphique({ titre: 'Visites par jour', sous: 'Un onglet ouvert sur le site = une visite. Sans cookie ni identifiant.', ...courbe('visites', 'Visites') })}`

  // ---- Assemblage ----
  const releveTexte = u ? `Chiffres d’utilisation relevés le ${heureParis(releve.heure)}.` : `Chiffres d’utilisation indisponibles${releve?.utilisation?.erreur ? ` (${echapper(releve.utilisation.erreur)})` : ''}.`
  const inscrits = comptes != null ? ` · ${nombre(comptes)} inscrits` : ''
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rapport RévizSTMG</title><style>${CSS.replace(/\n/g, '')}</style></head><body><div class="f"><table role="presentation" width="100%" class="r"><tr><td class="in">`
    + `<div class="k">RévizSTMG · rapport du matin</div><h1>${dateLongue(jour).replace(/^./, (c) => c.toUpperCase())}</h1><div class="v">${verdict.icone} <b>${verdict.texte}</b>${inscrits}</div>`
    + `${titre('🔎 Vérification du site')}${blocVerif}`
    + `${titre('📊 Chiffres clés')}${tuilesHtml}${note(releveTexte)}`
    + `${titre('🧮 Tableau analytique')}${tableau(groupes)}${note('Écarts calculés par rapport au relevé d’il y a 7 et 30 jours ; « — » quand il n’y en a pas encore.')}`
    + `${repartitions}${evolution}`
    + `<p class="pd">Mail envoyé chaque matin par la routine de vérification de RévizSTMG.<br><a href="${site}">Ouvrir le site</a> · <a href="https://github.com/revizstmg/revizstmg.github.io/blob/main/statistiques/STATISTIQUES.md">Statistiques détaillées</a> · Modifications de l’app ces 7 derniers jours : ${nombre(publication.modifications7j)}</p>`
    + '</td></tr></table></div></body></html>'

  // ---- Version texte ----
  const t = [`RévizSTMG — rapport du ${dateLongue(jour)}`, `${verdict.icone} ${verdict.texte}${inscrits}`, '', 'VÉRIFICATION DU SITE']
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

  return {
    // « Rapport du 29/10/2026 » en tête : les rapports se rangent et se retrouvent par date.
    sujet: `Rapport du ${jour.split('-').reverse().join('/')} · RévizSTMG · ${verdict.icone} ${verdict.texte}${inscrits}`,
    html,
    texte: t.join('\n') + '\n',
  }
}

function garder(obj, cles) {
  const o = {}
  for (const c of cles) if (obj?.[c] != null) o[c] = obj[c]
  return o
}
