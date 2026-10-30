import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { FONCTIONS_IA, LIMITE_IA_PAR_JOUR, reserverIA, utilisationsIA, MESSAGE_IA_INDISPONIBLE } from '../src/data/ia.js'

const SRC = new URL('../src/', import.meta.url).pathname
const lire = (p) => readFileSync(join(SRC, p), 'utf8')
function fichiers(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? fichiers(p) : /\.(jsx?|mjs)$/.test(n) ? [p] : []
  })
}

describe('cadre commun des fonctions d’IA', () => {
  it('tout fichier qui appelle une fonction d’IA est dans la liste et passe par la limite locale', () => {
    const appelants = fichiers(SRC).filter((f) => /functions\/v1\/(examen-blanc|fiche-vision)/.test(readFileSync(f, 'utf8')) && !f.endsWith('data/ia.js'))
    const relatifs = appelants.map((f) => f.slice(SRC.length))
    for (const f of relatifs) expect(FONCTIONS_IA.map((x) => x.fichier), `${f} n’est pas listé dans FONCTIONS_IA`).toContain(f)
    for (const f of FONCTIONS_IA) {
      expect(lire(f.fichier), f.fichier).toContain('reserverIA')
      expect(f.nom && f.envoie, f.id).toBeTruthy()
    }
  })
  it('les pages légales citent chaque fonction qui envoie des données à une IA', () => {
    const legal = (lire('pages/Privacy.jsx') + lire('pages/Cgu.jsx')).toLowerCase()
    const termes = { serie: 'créer ma série', controle: 'questions type de contrôle', tuteur: 'tuteur', examen: 'examens blancs', photo: 'fiche par photo', excellence: 'excellence', etude: 'demande de révision' }
    for (const f of FONCTIONS_IA) expect(legal, `${f.nom} absent des pages légales`).toContain(termes[f.id])
  })
  it('la limite journalière s’applique et repart le lendemain', () => {
    const mem = {}
    globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v) }, removeItem: (k) => { delete mem[k] } }
    // Compte Ultimate : pas de quota mensuel, seulement le garde-fou journalier.
    mem.stmg_session = JSON.stringify({ token: 'jeton-fictif-long-pour-le-test', user: { id: 'u1' }, expires_at: 9999999999 })
    mem.stmg_acces = JSON.stringify({ uid: 'u1', ligne: { statut: 'active', offre: 'ultimate', periode_fin: '2999-01-01T00:00:00Z' }, verifieLe: Date.now() })
    for (let i = 0; i < LIMITE_IA_PAR_JOUR; i++) reserverIA('serie')
    expect(utilisationsIA()).toBe(LIMITE_IA_PAR_JOUR)
    expect(() => reserverIA('serie')).toThrow('rate_limit')
    mem.stmg_ia_usage = JSON.stringify({ jour: '2000-01-01', n: 999 })
    expect(() => reserverIA('serie')).not.toThrow()
    expect(utilisationsIA()).toBe(1)
    delete globalThis.localStorage
  })
  it('un seul message pour une IA indisponible, repris par le Bac blanc', () => {
    expect(lire('i18n/examens.js')).toContain(MESSAGE_IA_INDISPONIBLE)
    expect(lire('pages/PhotoFiche.jsx')).not.toContain('voir la doc')
  })
})
