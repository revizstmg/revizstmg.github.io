import activities from '../../content/eps/activites.json'
import scales from '../../content/eps/baremes.json'
import training from '../../content/eps/entrainements.json'
export { activities, scales }
export const fields = ['Performance', 'Déplacement adapté', 'Expression', 'Affrontement', 'Entretien de soi']
export const punctualIds = ['courses', 'danse', 'tennis-table']
// Les catégories nationales (courses, sauts, lancers) ne sont pas des épreuves
// locales uniques. Aucun seuil national CCF n'est converti en note sur 20.
export function makeTraining({ activityId, level = 'reprise', duration = 30, access = 'home' }) {
  const activity = activities.find(a => a.id === activityId)
  if (!activity || !['reprise', 'regulier', 'a-laise'].includes(level) || ![20, 30, 45].includes(duration) || !['home', 'supervised'].includes(access)) throw new Error('Choix de séance invalide')
  const warm = {20:6,30:8,45:10}[duration], cool = duration === 45 ? 5 : 4
  const block = (duration - warm - cool) / 2
  const effort = {reprise:4,regulier:5,'a-laise':6}[level]
  return { activity, duration, access, weeks: Array.from({length:4}, (_, week) => ({
    number: week + 1,
    goal: [activity.skill1, activity.skill2, 'Observer un seul critère et ajuster', 'Consolider sans chercher un record'][week],
    sessions: Array.from({length:2}, (_, session) => ({
      number: week * 2 + session + 1,
      effort: week === 3 ? Math.max(3, effort - 1) : effort,
      blocks: [
        { minutes:warm, title:'Échauffement', text:training.warmup },
        { minutes:block, title:'Technique', text:access === 'home' ? activity.home : activity.practice },
        { minutes:block, title:session === 0 ? 'Observer et reprendre' : 'Ajuster', text:access === 'home' ? `${training.progression[week]}. ${training.homeReview}` : session === 0 ? `${training.progression[week]}. ${activity.skill1}. ${training.observe}` : `${activity.skill2}. ${training.adjust}` },
        { minutes:cool, title:'Retour au calme', text:training.cooldown },
      ],
    })),
  })) }
}
export function performance800(seconds, category) {
  if (!Number.isFinite(seconds) || seconds <= 0 || !['girls','boys'].includes(category)) return null
  // Palier atteint, sans interpolation et sans évaluer les autres critères.
  return scales.performance800.filter(row => seconds <= row[category]).at(-1)?.points ?? null
}
export function formatSeconds(n) { return `${Math.floor(n / 60)}:${String(n % 60).padStart(2,'0')}` }
