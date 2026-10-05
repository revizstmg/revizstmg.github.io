// Validation des formulaires et garde-fous anti-spam (src/formulaires.js).
import { describe, it, expect } from 'vitest'
import {
  emailValide, motDePasseValide, nomValide, problemeMessage, noterMessage,
  inscriptionSuspecte, pauseConnexion, DUREE_PAUSE,
} from '../src/formulaires.js'
import { messageAuth } from '../src/auth.js'

describe('champs du compte', () => {
  it('adresse e-mail', () => {
    for (const ok of ['lea.martin@exemple.fr', 'a@b.co', ' prof@lycee-marceau.fr ', 'x+y@mail.education.gouv.fr']) expect(emailValide(ok), ok).toBe(true)
    for (const ko of ['', 'lea', 'lea@', 'lea@exemple', 'lea@exemple.f', 'lea @exemple.fr', 'lea@@exemple.fr', 'lea@.fr', `${'a'.repeat(80)}@x.fr`]) expect(emailValide(ko), ko).toBe(false)
  })
  it('mot de passe : 8 caractères, une lettre, un chiffre', () => {
    for (const ok of ['bacstmg26', 'Révise2026', 'abcdefg1']) expect(motDePasseValide(ok), ok).toBe(true)
    for (const ko of ['', 'abc123', 'abcdefgh', '12345678', 'a1'.repeat(40)]) expect(motDePasseValide(ko), ko).toBe(false)
  })
  it('prénom et nom affichés aux autres', () => {
    for (const ok of ['Léa', 'Jean-Baptiste', "N'Golo", 'Anne Marie', 'Zoë', 'O’Neill', 'J.-B. Durand']) expect(nomValide(ok), ok).toBe(true)
    for (const ko of ['', '   ', 'Léa2', 'www.spam.fr', 'Jean@', 'Aaaaaa', 'x'.repeat(41), '-Léa']) expect(nomValide(ko), ko).toBe(false)
    expect(nomValide('', { obligatoire: false })).toBe(true)
  })
})

describe('messages des espaces partagés', () => {
  const t0 = 1_000_000_000_000
  it('refuse les messages vides, trop longs, répétitifs ou bourrés de liens', () => {
    expect(problemeMessage('test:a', '   ', { maintenant: t0 })).toBe('msgEmpty')
    expect(problemeMessage('test:a', 'x'.repeat(1001), { maintenant: t0 })).toBe('msgTooLong')
    expect(problemeMessage('test:a', 'https://a.fr https://b.fr www.c.fr', { maintenant: t0 })).toBe('msgTooManyLinks')
    expect(problemeMessage('test:a', 'aaaaaaaaaaaaaaaaaaaa', { maintenant: t0 })).toBe('msgRepeated')
    expect(problemeMessage('test:a', 'Qui a compris la TVA ? https://exemple.fr', { maintenant: t0 })).toBe(null)
  })
  it('impose une pause entre deux messages et bloque les doublons', () => {
    noterMessage('test:b', 'Bonjour à tous', t0)
    expect(problemeMessage('test:b', 'Autre chose', { maintenant: t0 + 5000 })).toBe('msgTooFast')
    expect(problemeMessage('test:b', 'bonjour  à TOUS', { maintenant: t0 + 30000 })).toBe('msgDuplicate')
    expect(problemeMessage('test:b', 'Autre chose', { maintenant: t0 + 30000 })).toBe(null)
    expect(problemeMessage('test:b', 'Bonjour à tous', { maintenant: t0 + 11 * 60000 })).toBe(null)
    expect(problemeMessage('test:c', 'Bonjour à tous', { maintenant: t0 + 1000 }), 'autre espace').toBe(null)
  })
})

describe('anti-robots', () => {
  it('inscription : champ piège rempli ou formulaire rempli trop vite', () => {
    expect(inscriptionSuspecte({ piege: '', debut: 0, maintenant: 60000 })).toBe(false)
    expect(inscriptionSuspecte({ piege: 'http://spam', debut: 0, maintenant: 60000 })).toBe(true)
    expect(inscriptionSuspecte({ piege: '', debut: 0, maintenant: 1500 })).toBe(true)
  })
  it('connexion : pause après 5 échecs', () => {
    expect(pauseConnexion(4, 1000, 2000)).toBe(0)
    expect(pauseConnexion(5, 1000, 2000)).toBe(DUREE_PAUSE - 1000)
    expect(pauseConnexion(6, 1000, 1000 + DUREE_PAUSE + 1)).toBe(0)
  })
  it('les erreurs de Supabase sont traduites', () => {
    expect(messageAuth(400, 'Invalid login credentials')).toBe('E-mail ou mot de passe incorrect.')
    expect(messageAuth(422, 'User already registered')).toMatch(/existe déjà/)
    expect(messageAuth(429, 'Email rate limit exceeded')).toMatch(/Trop de tentatives/)
    expect(messageAuth(429, '')).toMatch(/Trop de tentatives/)
    expect(messageAuth(422, 'Password should be at least 6 characters.')).toMatch(/trop faible/)
    expect(messageAuth(500, 'Erreur inconnue')).toBe('Erreur inconnue')
  })
})
