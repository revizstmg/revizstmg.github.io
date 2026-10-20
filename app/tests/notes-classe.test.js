// « Mes notes de classe » : lecture de la note saisie, ce qu'il faut améliorer,
// et fusion des notes entre deux appareils du même élève.
import { describe, expect, it } from 'vitest'
import { lireNote, formaterNote, ajouterNote, nouvelleNote, notesParMatiere, aAmeliorer, NOTES_MAX, TOUTE_LA_MATIERE } from '../src/notesClasse.js'
import { mergeProgress, noter, chargeUtile, PROGRESS_KEYS } from '../src/progression.js'

const n = (note, matiere, chapitre, date = '2026-10-01', id = `${matiere}-${chapitre}-${note}-${date}`) => ({ id, note, matiere, chapitre, date, ajouteLe: 1 })

describe('saisie de la note', () => {
  it('lit une note sur 20 avec une virgule ou un point', () => {
    expect(lireNote('15,50')).toBe(15.5)
    expect(lireNote(' 15.5 ')).toBe(15.5)
    expect(lireNote('8')).toBe(8)
    expect(lireNote('0')).toBe(0)
    expect(lireNote('20')).toBe(20)
    expect(lireNote('12,75')).toBe(12.75)
  })
  it('refuse ce qui n’est pas une note sur 20', () => {
    for (const x of ['', '21', '20,5', '-3', '15,555', 'quinze', '15/20', '1e1', '15,', ',5', null, undefined]) expect(lireNote(x), String(x)).toBe(null)
  })
  it('affiche la note avec le séparateur de la langue', () => {
    expect(formaterNote(15.5)).toBe('15,50')
    expect(formaterNote(8.5, 'fr')).toBe('8,50')
    expect(formaterNote(15)).toBe('15')
    expect(formaterNote(12.75, 'en')).toBe('12.75')
    expect(formaterNote(9.5, 'ar')).toMatch(/^9.50$/)
  })
  it('garde au plus NOTES_MAX notes, les plus récentes en tête', () => {
    let liste = []
    for (let i = 0; i < NOTES_MAX + 5; i++) liste = ajouterNote(liste, { id: `n${i}` })
    expect(liste).toHaveLength(NOTES_MAX)
    expect(liste[0].id).toBe(`n${NOTES_MAX + 4}`)
    const a = nouvelleNote({ note: 12, matiere: 'maths', chapitre: 'math-c3', date: '2026-10-19' }, 42)
    const b = nouvelleNote({ note: 12, matiere: 'maths', chapitre: 'math-c3', date: '2026-10-19' }, 42)
    expect(a).toMatchObject({ note: 12, matiere: 'maths', chapitre: 'math-c3', date: '2026-10-19', ajouteLe: 42 })
    expect(a.id).not.toBe(b.id)
  })
})

describe('ce qu’il faut améliorer', () => {
  it('aucune note : rien à dire', () => {
    expect(aAmeliorer([])).toEqual([])
    expect(aAmeliorer(undefined)).toEqual([])
  })
  it('un chapitre sous la moyenne est à retravailler, même seul dans sa matière', () => {
    expect(aAmeliorer([n(8.5, 'maths', 'math-c3')])).toEqual([
      { matiere: 'maths', chapitre: 'math-c3', moyenne: 8.5, nombre: 1, derniere: '2026-10-01', raison: 'sous-la-moyenne' },
    ])
  })
  it('une seule bonne note : rien à comparer', () => {
    expect(aAmeliorer([n(14, 'maths', 'math-c3')])).toEqual([])
  })
  it('la moyenne la plus basse de chaque matière, du plus faible au moins faible', () => {
    const r = aAmeliorer([
      n(15.5, 'maths', 'math-c3'), n(12, 'maths', 'math-c2'), n(16, 'maths', 'math-c2', '2026-10-05'),
      n(11, 'droit', 'droit-t5'), n(17, 'droit', 'droit-t6'),
      n(9, 'economie', 'eco-t6'),
    ])
    expect(r.map((x) => [x.chapitre, x.moyenne, x.raison])).toEqual([
      ['eco-t6', 9, 'sous-la-moyenne'],
      ['droit-t5', 11, 'plus-basse'],
      ['math-c2', 14, 'plus-basse'],
    ])
    expect(r.find((x) => x.chapitre === 'math-c2')).toMatchObject({ nombre: 2, derniere: '2026-10-05' })
  })
  it('des chapitres à égalité ne désignent pas de point faible', () => {
    expect(aAmeliorer([n(14, 'maths', 'math-c1'), n(14, 'maths', 'math-c2')])).toEqual([])
  })
  it('chaque chapitre sous la moyenne compte, pas seulement le plus bas', () => {
    const r = aAmeliorer([n(6, 'maths', 'math-c1'), n(8, 'maths', 'math-c2'), n(13, 'maths', 'math-c3')])
    expect(r.map((x) => [x.chapitre, x.raison])).toEqual([['math-c1', 'sous-la-moyenne'], ['math-c2', 'sous-la-moyenne']])
  })
  it('les notes « toute la matière » n’entrent pas dans le classement des chapitres', () => {
    expect(aAmeliorer([n(5, 'maths', TOUTE_LA_MATIERE)])).toEqual([])
  })
})

describe('notes rangées par matière', () => {
  it('suit l’ordre des matières de la filière, avec la moyenne de chacune', () => {
    const g = notesParMatiere([n(12, 'droit', 'droit-t5'), n(15.5, 'maths', 'math-c3', '2026-10-19'), n(8.5, 'maths', 'math-c3', '2026-10-02')], [{ id: 'maths' }, { id: 'droit' }])
    expect(g.map((x) => [x.matiere, x.moyenne, x.notes.map((y) => y.date)])).toEqual([
      ['maths', 12, ['2026-10-19', '2026-10-02']],
      ['droit', 12, ['2026-10-01']],
    ])
  })
  it('une matière hors de la filière vient à la fin', () => {
    const g = notesParMatiere([n(10, 'philosophie', 'philo-art'), n(12, 'maths', 'math-c1')], [{ id: 'maths' }])
    expect(g.map((x) => x.matiere)).toEqual(['maths', 'philosophie'])
  })
})

describe('sauvegarde et fusion entre appareils', () => {
  const vide = (extra = {}) => ({ xp: 0, coins: 0, freezes: 0, totalAnswers: 0, correctAnswers: 0, favorites: [], savedDecks: [], fiches: [], erreurs: [], notes: {}, notesClasse: [], ...extra })
  const sur = (appareil, t, etat, maj) => noter(etat, maj(etat), { appareil, maintenant: t })
  const recuperer = (etat, compte) => mergeProgress(etat, compte, 1000)

  it('les notes de classe partent sur le compte', () => {
    expect(PROGRESS_KEYS).toContain('notesClasse')
    const etat = sur('tel', 5, vide(), (s) => ({ ...s, notesClasse: [n(15.5, 'maths', 'math-c3')] }))
    expect(chargeUtile(etat).notesClasse).toEqual([n(15.5, 'maths', 'math-c3')])
  })
  it('deux notes ajoutées sur deux appareils sont gardées toutes les deux', () => {
    const tel0 = sur('tel', 1, vide(), (s) => s)
    let pc = recuperer(vide(), chargeUtile(tel0))
    const tel = sur('tel', 10, tel0, (s) => ({ ...s, notesClasse: ajouterNote(s.notesClasse, n(15.5, 'maths', 'math-c3')) }))
    pc = sur('pc', 20, pc, (s) => ({ ...s, notesClasse: ajouterNote(s.notesClasse, n(11, 'droit', 'droit-t5')) }))
    const fusion = recuperer(pc, chargeUtile(tel))
    expect(fusion.notesClasse.map((x) => x.matiere).sort()).toEqual(['droit', 'maths'])
  })
  it('une note supprimée sur un appareil ne réapparaît pas', () => {
    const tel0 = sur('tel', 1, vide(), (s) => ({ ...s, notesClasse: [n(8.5, 'maths', 'math-c3', '2026-10-01', 'a'), n(12, 'droit', 'droit-t5', '2026-10-01', 'b')] }))
    const pc = recuperer(vide(), chargeUtile(tel0))
    const tel = sur('tel', 10, tel0, (s) => ({ ...s, notesClasse: s.notesClasse.filter((x) => x.id !== 'a') }))
    expect(recuperer(pc, chargeUtile(tel)).notesClasse.map((x) => x.id)).toEqual(['b'])
    expect(recuperer(tel, chargeUtile(pc)).notesClasse.map((x) => x.id)).toEqual(['b'])
  })
})
