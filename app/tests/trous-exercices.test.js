import { describe, it, expect, beforeAll } from 'vitest'
import * as C from '../src/data/index.js'

// Textes à trous : le blanc ne coupe pas un mot, et la phrase ne donne pas la réponse.
beforeAll(async () => { await C.chargerTout() })

describe('masquerMot', () => {
  it('ne masque jamais au milieu d’un mot ou d’un nombre', () => {
    expect(C.masquerMot('Fin de la cinquième : cumul 22 000, VNC 0 €.', '0 €')).toBe('Fin de la cinquième : cumul 22 000, VNC ____.')
    expect(C.masquerMot('un bilan fonctionnel regroupe les postes par fonction', 'fonction')).toBe(null) // « fonctionnel » : même radical
    expect(C.masquerMot('la IVe République puis la Ve', 'Ve')).toBe('la IVe République puis la ____')
    expect(C.masquerMot('des totaux annuels : le taux de MCV', 'taux')).toBe('des totaux annuels : le ____ de MCV')
  })
  it('masque toutes les occurrences, refuse les trous douteux', () => {
    expect(C.masquerMot('Le mineur agit seul. Le mineur est protégé.', 'mineur')).toBe('Le ____ agit seul. Le ____ est protégé.')
    expect(C.masquerMot('a b a b a b', 'a')).toBe(null) // trois occurrences
    expect(C.masquerMot('Net = 900 − 18 = 882. TVA = 882 × 0,20', '882')).toBe('Net = 900 − 18 = ____. TVA = ____ × 0,20') // les deux occurrences
    expect(C.masquerMot('① Net = 1 000 − 100 = 900 €. ② Escompte = 900 × 2 % = 18 €', '900 €')).toBe(null) // 900 reste visible à l’étape suivante
    expect(C.masquerMot('Net = 900 − 18 = 882. Puis 1 000', '882 €')).toBe(null) // le mot n’est pas dans la phrase
    expect(C.masquerMot('Net financier = 900 − 18 = 882 €. Puis TVA', '882 €')).toBe('Net financier = 900 − 18 = ____. Puis TVA')
  })
})

describe('exercices à trous du contenu', () => {
  it('aucun blanc collé à une lettre ou à un chiffre, aucune réponse chiffrée visible', () => {
    const colles = [], visibles = []
    let total = 0
    for (const t of Object.values(C.ALL_CHAPTERS)) for (const ch of C.themeChapters(t)) for (const g of ch.games || []) {
      const qs = g.type === 'trou' ? (g.questions || g.items || []) : []
      for (const q of qs) {
        const txt = q.text || ''
        total++
        if (/[\p{L}\d]____|____[\p{L}\d]/u.test(txt)) colles.push(`${g.id} : ${txt.slice(0, 90)}`)
        const nb = (String(q.answer).match(/\d[\d  ]*(?:,\d+)?/g) || []).map((x) => x.replace(/[\s ]/g, ''))
        const reste = txt.replace(/____/g, ' ')
        for (const n of nb) if (n.length >= 2 && (reste.match(/\d[\d  ]*(?:,\d+)?/g) || []).some((x) => x.replace(/[\s ]/g, '') === n)) visibles.push(`${g.id} : ${txt.slice(0, 90)}`)
      }
    }
    expect(total).toBeGreaterThan(500)
    expect(colles).toEqual([])
    expect(visibles).toEqual([])
  })
})
