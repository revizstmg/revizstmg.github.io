import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { ADMINS, estAdminProbable, duree } from '../src/admin.js'

describe('menu administrateur', () => {
  it('ne reconnaît que les deux adresses (sans tenir compte de la casse), et seulement connecté', () => {
    expect(ADMINS).toEqual(['donatmatys972@gmail.com', 'gabriel.merlin2872@icloud.com'])
    const session = (email, token = 'jeton') => ({ token, user: { email } })
    expect(estAdminProbable(session('gabriel.merlin2872@icloud.com'))).toBe(true)
    expect(estAdminProbable(session(' Donatmatys972@Gmail.com '))).toBe(true)
    expect(estAdminProbable(session('autre@gmail.com'))).toBe(false)
    expect(estAdminProbable(session('gabriel.merlin2872@icloud.com', ''))).toBe(false)
    expect(estAdminProbable(null)).toBe(false)
  })
  it('la migration réserve les fonctions à ces deux e-mails confirmés et les retire à anon', () => {
    const sql = readFileSync(new URL('../../supabase/migrations/20261123110000_revizstmg_admin_lecture.sql', import.meta.url), 'utf8')
    for (const e of ADMINS) expect(sql).toContain(`'${e}'`)
    expect(sql).toContain('email_confirmed_at is not null')
    expect(sql).toMatch(/revoke all on function public\.revizstmg_admin_comptes\(\) from public, anon, authenticated/)
    expect(sql).not.toMatch(/grant execute[^;]*to anon/)
    // les textes personnels ne sortent jamais
    for (const cle of ['notesClasse', 'grandOral', 'etudeGestion', 'fiches']) expect(sql).toContain(`'${cle}'`)
  })
  it('affiche les durées lisiblement', () => {
    expect(duree(201.4)).toBe('3 min 21 s')
    expect(duree(70)).toBe('1 min 10 s')
    expect(duree(9)).toBe('9 s')
  })
})
