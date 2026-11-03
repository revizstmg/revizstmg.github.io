import { test, expect } from 'vitest'
import { CALC } from '../src/calc.js'
import { QCM_GEN } from '../src/qcmgen.js'
import { parseNombre } from '../src/games/common.jsx'

const tirer = (id, n = 300) => Array.from({ length: n }, () => CALC[id]())

test('aucun générateur ne produit « -0 », « 1x² », « + -4 » ni point décimal dans l’énoncé ou la correction', () => {
  for (const id of Object.keys(CALC)) {
    for (const q of tirer(id, 60)) {
      expect(Object.is(q.answer, -0), id).toBe(false)
      const texte = `${q.prompt}\n${q.explain}`
      expect(texte, id).not.toMatch(/\d\.\d/)
      expect(texte, id).not.toMatch(/\b1x²|\+ -\d|× ?-\d|\d{6,}\d*\.|0,\d{8,}/)
    }
  }
})

test('suite géométrique : la raison est arrondie', () => {
  for (const q of tirer('suite_geo')) expect(q.explain).toMatch(/^q = 1 − \d+\/100 = 0,\d{1,2}\./)
})

test('discriminant : pas de double signe', () => {
  for (const q of tirer('discriminant')) expect(q.explain).not.toMatch(/− -/)
})

test('indice base 100 : jamais de baisse de 100 % ou plus comme proposition', () => {
  for (let k = 0; k < 500; k++) {
    const q = QCM_GEN.indice_base100(Math.random)
    for (const c of q.choices) {
      const m = c.match(/^Baissé de (\d+)/)
      if (m) expect(Number(m[1])).toBeLessThan(100)
    }
  }
})

test('saisie chiffrée stricte', () => {
  expect(parseNombre('7 000')).toBe(7000)
  expect(parseNombre('7 000')).toBe(7000)
  expect(parseNombre('7.000')).toBe(7000)
  expect(parseNombre('8,45')).toBe(8.45)
  expect(parseNombre('−5')).toBe(-5)
  expect(parseNombre('12 €')).toBe(12)
  expect(parseNombre('12 euros')).toBe(12)
  expect(parseNombre('33,3 %')).toBe(33.3)
  expect(parseNombre('3/4')).toBeNull()
  expect(parseNombre('12 abc')).toBeNull()
  expect(parseNombre('')).toBeNull()
  expect(parseNombre('0.125')).toBe(0.125)
})
