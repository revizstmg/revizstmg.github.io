import { describe, it, expect, beforeAll } from 'vitest'
import * as C from '../src/data/index.js'

// Exercices de dates (histoire-géographie) : une période qui contient la date
// d'un événement ne peut pas servir de mauvaise réponse ni d'affirmation fausse.
beforeAll(async () => { await C.chargerTout() })

const jeu = (themeId, idx, suffixe) => C.getThemeChapter(themeId, idx).games.find((g) => g.id.endsWith(suffixe))

describe('plages de dates', () => {
  it('lit une date, une période et rien', () => {
    expect(C.plageAnnees('5 mars 1953')).toEqual([1953, 1953])
    expect(C.plageAnnees('1950-1953')).toEqual([1950, 1953])
    expect(C.plageAnnees('1944–1945')).toEqual([1944, 1945])
    expect(C.plageAnnees('Moyen Âge')).toBe(null)
  })
  it('deux plages qui se recouvrent sont compatibles', () => {
    expect(C.datesCompatibles('5 mars 1953', '1950-1953')).toBe(true)
    expect(C.datesCompatibles('1949', '1948-1949')).toBe(true)
    expect(C.datesCompatibles('2 sept. 1945', '1944-1945')).toBe(true)
    expect(C.datesCompatibles('1952', '1949')).toBe(false)
    expect(C.datesCompatibles('1789', '1799')).toBe(false)
  })
})

describe('QCM de dates', () => {
  it('« Que se passe-t-il en 5 mars 1953 ? » ne propose pas la guerre de Corée (1950-1953)', () => {
    for (let k = 0; k < 60; k++) {
      const g = jeu('hg-h2', 7, '::qdate')
      const q = g?.questions.find((x) => /5 mars 1953/.test(x.q))
      if (!q) continue
      expect(q.choices.some((c) => /Guerre de Cor/.test(c)), q.choices.join(' | ')).toBe(false)
    }
  })
  it('aucune mauvaise réponse dont la période contient la date demandée (chapitres signalés)', () => {
    let controles = 0
    for (const [t, i] of [['hg-h1', 4], ['hg-h2', 0], ['hg-h2', 7], ['hg-h3', 0], ['p1-hg-h1', 1], ['p1-hg-h3', 0], ['p1-hg-h3', 2]]) {
      const ch = C.getThemeChapter(t, i)
      const paires = []
      for (const b of ch.section.blocks || []) {
        if (b.t === 'frise') for (const e of b.events || []) paires.push([String(e.date), String(e.label)])
        if (b.t === 'table') for (const r of b.rows || []) if (r[0] && r[1] && /\d{3,4}/.test(String(r[0]))) paires.push([String(r[0]), String(r[1])])
      }
      const nettoie = (x) => x.replace(/\*+/g, '').trim()
      const dateDe = (choix) => paires.find(([, e]) => nettoie(e) === choix)?.[0]
      for (let k = 0; k < 20; k++) {
        const g = C.getThemeChapter(t, i).games.find((x) => x.id.endsWith('::qdate'))
        for (const q of g?.questions || []) {
          const d = q.q.match(/^Que se passe-t-il en (.+) \?$/)?.[1]
          q.choices.forEach((c, n) => {
            if (n === q.answer) return
            const dc = dateDe(c)
            if (d && dc) controles++
            if (d && dc) expect(C.datesCompatibles(d, dc), `${t}::${i} « ${q.q} » : ${c} (${dc})`).toBe(false)
          })
        }
      }
    }
    expect(controles).toBeGreaterThan(100) // le test contrôle bien des mauvaises réponses
  })
})

describe('Vrai ou faux de dates', () => {
  it('« 1950-1953 : Mort de Staline » n’est jamais corrigé faux (1953 est dans la période)', () => {
    for (let k = 0; k < 80; k++) {
      const g = jeu('hg-h2', 7, '::vfdate')
      for (const q of g?.questions || []) {
        if (/Mort de Staline/.test(q.statement) && /1950-1953|1953/.test(q.statement)) expect(q.answer, q.statement).toBe(true)
        if (/Guerre de Cor/.test(q.statement) && /1953/.test(q.statement)) expect(q.answer, q.statement).toBe(true)
      }
    }
  })
  it('une affirmation fausse n’associe jamais un événement à une date compatible avec la sienne', () => {
    const faux = []
    for (const id of Object.keys(C.ALL_CHAPTERS)) {
      if (!/^(p1-)?hg-/.test(id)) continue
      for (const ch of C.themeChapters(C.ALL_CHAPTERS[id])) {
        const g = ch.games.find((x) => x.id.endsWith('::vfdate'))
        for (const q of g?.questions || []) {
          if (q.answer) continue
          const [, vraie] = q.explain.match(/^Faux\. .*? : (.+)\.$/) || []
          const dit = q.statement.match(/^(.+?) : /)?.[1]
          if (vraie && dit && C.datesCompatibles(dit, vraie)) faux.push(`${ch.id} : ${q.statement} / ${q.explain}`)
        }
      }
    }
    expect(faux).toEqual([])
  })
})
