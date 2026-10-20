// Dates civiles (audit F01) : le jour du calendrier de l'élève, quel que soit
// son fuseau, et des calculs que l'heure d'été ou d'hiver ne décale pas.
import { afterAll, describe, expect, it } from 'vitest'
import { addDays, dayKey, daysBetween, daysUntil, srsUpdate } from '../src/data/srs.js'
import { isoWeekKey } from '../src/store.jsx'

const fuseauDeDepart = process.env.TZ
afterAll(() => { process.env.TZ = fuseauDeDepart })

// Paris, la Guyane (UTC-3) et la Nouvelle-Calédonie (UTC+11), plus UTC.
for (const fuseau of ['Europe/Paris', 'America/Cayenne', 'Pacific/Noumea', 'UTC']) {
  describe(`dates civiles (${fuseau})`, () => {
    it('le lendemain est bien le jour suivant', () => {
      process.env.TZ = fuseau
      expect(addDays('2026-10-18', 1)).toBe('2026-10-19')
      expect(addDays('2026-10-18', -1)).toBe('2026-10-17')
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
      expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    })
    it('les passages à l’heure d’été et d’hiver ne décalent aucun jour', () => {
      process.env.TZ = fuseau
      expect(addDays('2026-03-28', 1)).toBe('2026-03-29')
      expect(addDays('2026-03-29', 1)).toBe('2026-03-30')
      expect(addDays('2026-10-24', 1)).toBe('2026-10-25')
      expect(addDays('2026-10-25', 1)).toBe('2026-10-26')
      expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2)
      expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2)
      expect(daysUntil('2027-06-14', '2026-10-19')).toBe(238)
    })
    it('« aujourd’hui » est le jour du calendrier de l’appareil, même juste après minuit', () => {
      process.env.TZ = fuseau
      expect(dayKey(new Date(2026, 9, 19, 0, 30))).toBe('2026-10-19')
      expect(dayKey(new Date(2026, 9, 18, 23, 59))).toBe('2026-10-18')
      expect(isoWeekKey(new Date(2026, 9, 19, 0, 30))).toBe('2026-W43')
    })
    it('une séance ratée revient le lendemain', () => {
      process.env.TZ = fuseau
      expect(srsUpdate(null, 30, '2026-10-18').due).toBe('2026-10-19')
      expect(srsUpdate(null, 90, '2026-10-24').due).toBe('2026-10-26')
    })
  })
}

it('à 0 h 30 à Paris, on est déjà le lendemain (le jour UTC est encore la veille)', () => {
  process.env.TZ = 'Europe/Paris'
  expect(dayKey(new Date('2026-10-18T22:30:00Z'))).toBe('2026-10-19')
  expect(dayKey(new Date('2026-01-18T23:30:00Z'))).toBe('2026-01-19')
})
