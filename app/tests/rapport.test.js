// Rapport du matin envoyé par mail : verdict, tableau analytique, graphiques en
// colonnes, et texte échappé (le mail reprend des textes écrits par la routine).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { construireRapport, colonnes, serieJours, ecart, valeurAu, echapper } from '../scripts/rapport.js'

const historique = [
  { date: '2026-09-10', comptes: 8, eleves: 5, profs: 3, questions: 30000 },
  { date: '2026-10-05', comptes: 9, eleves: 6, profs: 3, questions: 36000 },
  { date: '2026-10-11', comptes: 10, eleves: 7, profs: 3, actifs_7j: 2, visites: 4, questions: 39000 },
]
const releve = { date: '2026-10-12', heure: '2026-10-12T11:00:00Z', utilisation: { comptes: 12, eleves: 9, profs: 3, actifs_7j: 3, visites_hier: 5, niveaux: { 'terminale-stmg': 8, 'premiere-stmg': 1 }, specialites: { 'gestion-finance': 8 }, ecrans_7j: { accueil: 20, chapitre: 12 }, vues_7j: 32 } }
const contenu = { themes: 94, chapitres: 807, series: 6290, questions: 39034, flashcards: 2625 }
const publication = { ci: { etat: 'success', date: '2026-10-12T10:00:00Z' }, miseEnLigne: { etat: 'success', date: '2026-10-12T10:05:00Z' }, modifications7j: 4 }
const verif = { construction: { ok: true }, tests: { ok: true, detail: '121 tests' }, parcours: { ok: true, detail: '72 tests' }, themes: ['Droit — Thème 5'], problemes: [] }
const base = { jour: '2026-10-12', verif, releve, contenu, publication, historique }

describe('rapport par mail', () => {
  it('écarts : la valeur d’il y a 7 ou 30 jours, sinon rien', () => {
    expect(valeurAu(historique, 'comptes', '2026-10-05')).toBe(9)
    expect(ecart(historique, 'comptes', 12, '2026-10-12', 7)).toBe(3)
    expect(ecart(historique, 'comptes', 12, '2026-10-12', 30)).toBe(4)
    expect(ecart(historique, 'actifs_7j', 3, '2026-10-12', 7)).toBeNull()
    expect(ecart(historique, 'comptes', null, '2026-10-12', 7)).toBeNull()
  })
  it('tout va bien : verdict, sujet, tableau analytique et graphiques', () => {
    const r = construireRapport(base)
    expect(r.sujet).toBe('RévizSTMG · 12 oct. · ✅ Rien à signaler · 12 inscrits')
    expect(r.html).toContain('Rien à signaler.')
    expect(r.html).toContain('Tableau analytique')
    expect(r.html).toContain('▲ +3') // comptes sur 7 jours
    expect(r.html).toContain('Élèves de Terminale par spécialité')
    expect(r.html).toContain('Comptes inscrits</div>') // titre du graphique
    expect(r.html).not.toMatch(/<script|<img/i)
    expect(r.texte).toContain('Comptes inscrits : 12 · +3 · +4')
    expect(r.texte).toContain('✅ CI sur main')
  })
  it('un contrôle en échec ou un problème grave change le verdict', () => {
    const r = construireRapport({ ...base, verif: { ...verif, parcours: { ok: false, detail: '3 échecs' }, problemes: [{ gravite: 'grave', titre: 'Page vide', ou: '/bac-blanc' }] } })
    expect(r.sujet).toContain('❌ 1 contrôle en échec, 1 problème grave')
    expect(r.texte).toContain('❌ Parcours dans le navigateur (3 échecs)')
    expect(r.texte).toContain('1. [grave] Page vide — Où : /bac-blanc')
  })
  it('les textes de la routine sont échappés', () => {
    const r = construireRapport({ ...base, verif: { ...verif, problemes: [{ gravite: 'moyen', titre: '<img src=x onerror=alert(1)>' }] } })
    expect(r.html).not.toContain('<img src=x')
    expect(r.html).toContain(echapper('<img src=x onerror=alert(1)>'))
  })
  it('sans relevé d’utilisation ni vérification, le rapport reste lisible', () => {
    const r = construireRapport({ ...base, verif: null, releve: { utilisation: { erreur: 'Supabase injoignable' } } })
    expect(r.sujet).toBe('RévizSTMG · 12 oct. · ℹ️ Vérification non fournie')
    expect(r.html).toContain('Chiffres d’utilisation indisponibles (Supabase injoignable)')
    expect(r.html).toContain('Questions d’exercices')
  })
  it('colonnes : une par jour, empilées, un jour sans relevé reste vide', () => {
    const points = serieJours(historique, ['eleves', 'profs'], '2026-10-12', 3)
    expect(points.map((p) => p.date)).toEqual(['2026-10-10', '2026-10-11', '2026-10-12'])
    expect(points[0].valeurs).toEqual([null, null])
    const html = colonnes({ points, series: [{ nom: 'Élèves', couleur: '#2a78d6' }, { nom: 'Professeurs', couleur: '#eb6834' }] })
    expect(html.match(/<td valign="bottom"/g)).toHaveLength(3)
    expect(html).toContain('pas de relevé')
    expect(html).toContain('Élèves 7, Professeurs 3')
    expect(html).toContain('background:#2a78d6')
    expect(html).toContain('background:#eb6834')
  })
  it('l’historique du dépôt est trié, sans doublon de date', () => {
    const h = JSON.parse(readFileSync(new URL('../../statistiques/historique.json', import.meta.url), 'utf8'))
    const dates = h.map((x) => x.date)
    expect([...dates].sort()).toEqual(dates)
    expect(new Set(dates).size).toBe(dates.length)
  })
})
