import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const lire = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const livre = (l) => JSON.parse(lire(`src/localisation/public.${l}.json`))
const LANGUES = ['en', 'es', 'it', 'de', 'ar']

// Phrases de la FAQ (questions et réponses) et du guide (texte riche), lues dans le code.
function phrasesFaq() {
  const src = lire('src/pages/Faq.jsx')
  const bloc = src.slice(src.indexOf('const items = ['), src.indexOf('return (', src.indexOf('const items = [')))
  return [...bloc.matchAll(/'((?:[^'\\]|\\.)+)'|"((?:[^"\\]|\\.)+)"/g)].map((m) => (m[1] ?? m[2]).replace(/\\'/g, "'")).filter((s) => s.length > 12)
}
function phrasesGuide() {
  const src = lire('src/pages/Guide.jsx')
  const riches = [...src.matchAll(/texte="([^"]+)"/g)].map((m) => m[1])
  return [...riches, 'Ouvre **revizstmg.github.io** dans ton navigateur. Rien à télécharger pour l’instant.']
}

describe('FAQ et guide : traduits d’un bloc, hors ligne, dans les cinq langues', () => {
  for (const l of LANGUES) {
    it(`${l} : chaque phrase de la FAQ et du guide a sa traduction, avec la même mise en forme`, () => {
      const d = livre(l)
      for (const p of [...phrasesFaq(), ...phrasesGuide()]) {
        expect(d[p], p).toBeTruthy()
        expect((d[p].match(/\*\*/g) || []).length, p).toBe((p.match(/\*\*/g) || []).length)
        expect((d[p].match(/\[\[/g) || []).length, p).toBe((p.match(/\[\[/g) || []).length)
        expect([...(d[p].matchAll(/\|([^\]]+)\]\]/g))].map((m) => m[1]), p).toEqual([...(p.matchAll(/\|([^\]]+)\]\]/g))].map((m) => m[1]))
      }
    })
  }
  it('le badge « Sommet » correspond au niveau maximal réel', () => {
    const niveaux = (lire('src/data/shop.js').match(/SHOP_LEVELS = \[([^\]]+)\]/)[1].split(',')).length
    expect(lire('src/badges.js')).toContain(`niveau maximum (${niveaux})`)
  })
  it('les dates ne passent plus par le calendrier hégirien', () => {
    for (const f of ['Home', 'Programme', 'Parcours', 'MesNotes', 'CoachAI']) expect(lire(`src/pages/${f}.jsx`), f).toContain("calendar: 'gregory'")
  })
  it('la page de photos annonce l’envoi à un service d’IA', () => {
    const photo = lire('src/pages/PhotoFiche.jsx')
    expect(photo).not.toContain('ne sont envoyées nulle part')
    expect(photo).toContain('envoie la photo à un service d’IA externe')
  })
  it('la confidentialité et les CGU citent les aides générées par IA des chapitres', () => {
    expect(lire('src/pages/Privacy.jsx')).toContain('Aides et exercices générés par IA dans les chapitres')
    expect(lire('src/pages/Cgu.jsx')).toContain('Aides générées par IA dans les chapitres')
  })
})

describe('mineurs restants des deux vérifications', () => {
  it('l’XP s’écrit avec le même format partout', async () => {
    const { nombre } = await import('../src/format.js')
    expect(nombre(12345, 'fr').replace(/\s/g, ' ')).toBe('12 345')
    for (const f of ['pages/Profile.jsx', 'pages/Badges.jsx', 'components/Layout.jsx', 'pages/Friends.jsx', 'pages/Parent.jsx', 'components/RewardVault.jsx']) {
      expect(lire(`src/${f}`), f).toContain('nombre(')
    }
    expect(lire('src/components/RewardVault.jsx')).not.toContain('toLocaleString()')
  })
  it('les pluriels de l’espace parent sont réels et les heures du parcours sont lisibles', () => {
    const parent = lire('src/pages/Parent.jsx')
    expect(parent).not.toMatch(/jour\(s\)|thème\(s\)/)
    const parcours = lire('src/pages/Parcours.jsx')
    expect(parcours).not.toMatch(/\$\{plan\.heuresConseillees\} h/)
    expect(parcours).toContain('heuresRondes(plan.heuresConseillees)')
  })
  it('le libellé actif de la barre du bas a sa propre couleur en thème sombre', () => {
    expect(lire('src/components/Layout.jsx')).toContain("'var(--nav-actif)'")
    expect(lire('src/editorial.css')).toMatch(/\.dark\s*\{\s*--nav-actif:\s*var\(--c-accent-texte\)/)
  })
  it('les mauvaises réponses ne disent plus « Presque… » et les badges ont des noms distincts', () => {
    expect(lire('src/i18n/fr.js')).not.toContain("feedbackBad: 'Presque…'")
    const noms = [...lire('src/badges.js').matchAll(/^\s+name: '([^']+)'/gm)].map((m) => m[1])
    expect(new Set(noms).size).toBe(noms.length)
  })
})
