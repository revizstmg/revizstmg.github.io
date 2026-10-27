import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { STUDY_LANGUAGES } from '../src/data/studyLanguages.js'

const lire = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

describe('audit B : constats moyens et mineurs restants', () => {
  it('les langues sont proposées par ordre alphabétique français', () => {
    expect(STUDY_LANGUAGES.map((l) => l.id)).toEqual(['de', 'en', 'ar', 'es', 'it'])
  })
  it('la date du jour s’écrit en minuscules et la casse de Mon espace n’est plus forcée', () => {
    expect(lire('src/pages/Home.css')).not.toMatch(/\.home-date\s*\{[^}]*capitalize/)
    expect(lire('src/pages/Profile.jsx')).not.toMatch(/text-xs capitalize tracking-wide/)
  })
  it('la FAQ ne promet plus une gratuité définitive ni un e-mail conservé', () => {
    const faq = lire('src/pages/Faq.jsx')
    expect(faq).not.toContain('entièrement gratuit')
    expect(faq).not.toContain('Pour supprimer aussi ton adresse e-mail')
  })
  it('un outil d’un autre niveau est masqué derrière un message explicite', () => {
    const notice = lire('src/components/LevelToolNotice.jsx')
    expect(notice).toContain('Afficher quand même cet outil')
    expect(notice).toContain('ne correspond pas à ton niveau')
  })
  it('les pluriels de l’atelier de formules ne contiennent plus de « (s) »', () => {
    expect(lire('src/pages/FormulaWorkshop.jsx')).not.toMatch(/formule\(s\)|exercice\(s\)/)
  })
  it('la matière Langues cite l’allemand', () => {
    expect(lire('content/langues/matiere.json')).toContain('Allemand')
    expect(lire('content/p1-langues/matiere.json')).toContain('Allemand')
  })
})
