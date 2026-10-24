import { ALL_CHAPTERS, themeChapters, jeuxDuChapitre, exercicesParChapitre } from './index.js'
import { subjectsForTrack } from './tracks.js'
import { missionStatus } from './missionProgress.js'

const RECOGNISE = ['qcm', 'vraifaux', 'association', 'tri', 'memory']
const APPLY = ['calcul', 'caspratique', 'trou', 'saisie', 'sql', 'ordre', 'verbs', 'grammar']
const playable = g => [...RECOGNISE, ...APPLY].includes(g.type) && (g.gen || g.gens?.length || g.questions?.length || g.pairs?.length || g.items?.length)
export const missionSubjects = track => subjectsForTrack(track).filter(s => !s.comingSoon && !s.resourceOnly && s.chapters?.length)
export const missionUrl = target => '/missions/' + target.subjectId + '/' + target.themeId + '/' + target.index

// L'accueil ne charge pas les cours : les effectifs légers suffisent.
export function nextMissionTarget(state, position = null) {
  const candidates = missionSubjects(state.track).flatMap(subject => subject.chapters.flatMap(theme =>
    exercicesParChapitre(theme.id).flatMap((count, index) => count ? [{subjectId: subject.id, subjectName: subject.short || subject.name, themeId: theme.id, themeName: theme.short || theme.name, index}] : [])))
  if (!candidates.length) return null
  const recent = candidates.find(t => t.themeId === position?.themeId && t.index === position?.chapterIndex)
    || candidates.find(t => t.themeId === state.lastChapter?.chapterId)
  const active = candidates.filter(t => missionStatus(state.missions, t.themeId, t.index).practiced && missionStatus(state.missions, t.themeId, t.index).completed < 3)
    .sort((a,b) => Math.max(...missionStatus(state.missions,b.themeId,b.index).stages.map(s=>s.updatedAt)) - Math.max(...missionStatus(state.missions,a.themeId,a.index).stages.map(s=>s.updatedAt)))[0]
  if (active) return active
  const start = Math.max(0, candidates.indexOf(recent))
  const ordered = [...candidates.slice(start), ...candidates.slice(0,start)]
  return ordered.find(t => missionStatus(state.missions,t.themeId,t.index).completed < 3) || recent || candidates[0]
}

function shortGame(game, count) {
  const limited = {...game, count}
  // Le tirage existant évite les répétitions et garde les questions sources.
  if (['qcm','trou','saisie','verbs','grammar'].includes(game.type) && game.questions?.length)
    limited.questionCount = Math.min(count, game.questions.length)
  else if (game.questions?.length) limited.questions = game.questions.slice(0,count)
  return limited
}
export function chapterMission(themeId, index) {
  const theme = ALL_CHAPTERS[themeId]
  const chapter = theme?.cours && themeChapters(theme)[index]
  if (!chapter) return null
  const games = jeuxDuChapitre(chapter, theme).filter(playable)
  if (!games.length) return {chapter, games, rounds: []}
  const understand = games.find(g=>RECOGNISE.includes(g.type)) || games[0]
  const apply = games.find(g=>g.id!==understand.id && APPLY.includes(g.type)) || games.find(g=>g.id!==understand.id) || understand
  return { chapter, games,
    practice: {understand:shortGame(understand,5), apply:shortGame(apply,5)},
    rounds: [shortGame(understand,3), shortGame(apply,3)],
    hint: (chapter.section.blocks || []).filter(b=>typeof b.c==='string' && ['p','paragraph','text'].includes(b.t)).map(b=>b.c).find(Boolean)
      || chapter.section.intro || (chapter.section.points || [])[0] || '',
  }
}
export function bossResult(results) {
  if (results.length !== 2 || results.some(r=>!r || r.total<=0)) return null
  const total = results.reduce((n,r)=>n+r.total,0)
  const correct = results.reduce((n,r)=>n+r.correct,0)
  const pct = Math.round(100*correct/total)
  // Une manche entièrement ratée ne peut pas être compensée par l'autre.
  return {pct:results.every(r=>r.pct>=60) ? pct : Math.min(79,pct), assisted:results.some(r=>r.assisted), correct,total}
}
