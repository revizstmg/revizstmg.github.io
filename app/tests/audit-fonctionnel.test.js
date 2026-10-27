import { beforeEach, describe, expect, it, vi } from 'vitest'
const net = vi.hoisted(() => ({ getJSON: vi.fn(), send: vi.fn(), rpc: vi.fn(), player: 'A' }))
vi.mock('../src/reseau.js', () => ({ rest: p => p, enc: encodeURIComponent, ...net }))
vi.mock('../src/leaderboard.js', () => ({ deviceId: () => net.player, normalizeCode: s => s.toLowerCase(), isoWeekKey: () => '2026-W44' }))
vi.mock('../src/supabase.js', () => ({ SUPA_READY: true }))
import { banStudent, submitLiveAnswer } from '../src/classroom.js'
import { sendRequest } from '../src/friends.js'
const response = rows => ({ json: async () => rows })
beforeEach(() => {
  vi.clearAllMocks(); net.player = 'A'
  vi.stubGlobal('localStorage', { getItem: () => 'ABCDEF', setItem: vi.fn() })
})
describe('exclusion vérifiée', () => {
  it('interrompt et signale une interdiction refusée, sans retirer le membre', async () => {
    net.send.mockRejectedValueOnce(new Error('offline'))
    await expect(banStudent({ classCode: 'STMG-X', deviceId: 'B' })).rejects.toThrow('offline')
    expect(net.send).toHaveBeenCalledTimes(1)
  })
  it('refuse un succès HTTP sans ligne interdite, puis signale un retrait échoué', async () => {
    net.send.mockResolvedValueOnce(response([]))
    await expect(banStudent({ classCode: 'STMG-X', deviceId: 'B' })).rejects.toThrow('class_ban_not_saved')
    net.send.mockResolvedValueOnce(response([{ class_code: 'stmg-x', device_id: 'B' }])).mockRejectedValueOnce(new Error('delete failed'))
    await expect(banStudent({ classCode: 'STMG-X', deviceId: 'B' })).rejects.toThrow('delete failed')
  })
  it('retire le membre seulement après confirmation de l’interdiction', async () => {
    net.send.mockResolvedValueOnce(response([{ class_code: 'stmg-x', device_id: 'B' }])).mockResolvedValueOnce(response([]))
    await banStudent({ classCode: 'STMG-X', deviceId: 'B' })
    expect(net.send.mock.calls[1][0]).toBe('DELETE')
  })
})
describe('invitations refusées', () => {
  beforeEach(() => net.rpc.mockResolvedValue([{ device_id: 'B', name: 'B' }]))
  it('supprime uniquement le refus puis crée une nouvelle demande pending', async () => {
    net.getJSON.mockResolvedValueOnce([{ id: 'old', status: 'declined' }]); net.send.mockResolvedValue(response([]))
    expect(await sendRequest('BCDEFG', 'A')).toBe('sent')
    expect(net.send.mock.calls[0].slice(0, 2)).toEqual(['DELETE', 'friend_request?id=eq.old&status=eq.declined'])
    expect(net.send.mock.calls[1][2][0]).toMatchObject({ from_device: 'A', to_device: 'B', status: 'pending' })
  })
  it.each(['pending', 'accepted'])('ne touche pas une relation %s, même après un ancien refus', async status => {
    net.getJSON.mockResolvedValueOnce([{ status: 'declined' }, { status }])
    expect(await sendRequest('BCDEFG', 'A')).toBe(status === 'pending' ? 'exists' : 'accepted')
    expect(net.send).not.toHaveBeenCalled()
  })
})
describe('reprise des réponses Mode Direct', () => {
  const answer = { sessionId: 's', index: 0, choice: 2, correct: true, addScore: 450 }
  it('reconnaît une réponse enregistrée après accusé réseau perdu, sans doubler les points', async () => {
    net.getJSON.mockResolvedValueOnce([{ score: 0, answers: {} }])
    let saved
    net.send.mockImplementationOnce(async (_m, _p, row) => { saved = row; throw new Error('ack lost') })
    await expect(submitLiveAnswer(answer)).rejects.toThrow('ack lost')
    net.getJSON.mockResolvedValueOnce([saved])
    expect(await submitLiveAnswer(answer)).toMatchObject({ score: 450, answers: { 0: { choice: 2 } } })
    expect(net.send).toHaveBeenCalledTimes(1)
  })
  it('ne valide pas un PATCH sans ligne modifiée', async () => {
    net.getJSON.mockResolvedValueOnce([{ score: 0, answers: {} }]); net.send.mockResolvedValueOnce(response([]))
    await expect(submitLiveAnswer(answer)).rejects.toThrow('live_answer_not_saved')
  })
  it('refuse un joueur absent ou un changement de compte pendant la lecture', async () => {
    net.getJSON.mockResolvedValueOnce([])
    await expect(submitLiveAnswer(answer)).rejects.toThrow('live_player_missing')
    net.getJSON.mockImplementationOnce(async () => { net.player = 'B'; return [{ score: 0, answers: {} }] })
    await expect(submitLiveAnswer(answer)).rejects.toThrow('live_player_missing')
    expect(net.send).not.toHaveBeenCalled()
  })
})
