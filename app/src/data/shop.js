// Les pièces restent virtuelles. Les futures offres ne sont jamais activées côté client.
import { commun } from '../content/contenu.js'
export const SHOP_ITEMS = commun('boutique')
export const shopById = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]))
// Les douze seuils historiques restent identiques ; niveau 20 à 20 000 XP.
export const SHOP_LEVELS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000, 5000, 6500, 8200, 10100, 12200, 14500, 17000, 18500, 20000, 23500, 27000, 31000, 35500, 40500, 46000, 52000, 58500, 65500, 73500, 82000]
export const SHOP_REWARDS = [
  { id: 'kit-semaine', name: 'Une semaine organisée', icon: '📒', minXp: 250, score: 70, tests: 2, kit: 'semaine', gift: 'Ton planning PDF personnalisé sur 7 jours' },
  { id: 'kit-maitrise', name: 'Ton dossier de progrès', icon: '🎒', minXp: 1900, score: 80, tests: 5, kit: 'maitrise', freezes: 3, gift: 'Ton bilan, ton carnet de révision PDF et 3 gels de série' },
  { id: 'kit-bac', name: 'Ton pack objectif bac', icon: '🏅', minXp: 6500, score: 85, tests: 10, kit: 'bac', freezes: 5, gift: 'Un programme de 14 jours, tes questions à retravailler, tes cartes de rappel et 5 gels' },
  { id: 'collection-complete', name: 'Toute la collection', icon: '🎁', minXp: 12200, score: 90, tests: 15, collection: true, gift: 'Toutes les personnalisations actuelles de la boutique, offertes' },
  { id: 'regulier', name: 'Le rythme est pris', icon: '🧊', minXp: 700, gift: '2 gels de série', freezes: 2 },
  { id: 'confirme', name: 'Un style bien à toi', icon: '🎓', minXp: 3200, gift: 'Titre « Réviseur confirmé »', title: 'Réviseur confirmé', itemId: 'title-confirme' },
  { id: 'ambassadeur', name: 'Dans la cour des grands', icon: '🌅', minXp: 8200, gift: 'Bannière Ambre exclusive', banner: '#a26827', itemId: 'banner-ambre' },
  { id: 'premium-month', name: 'Un mois Premium offert', icon: '✦', minXp: 20000, score: 90, tests: 20, offer: 'Premium', gift: '1 mois Premium offert, après vérification' },
  { id: 'ultimate-month', name: 'Un mois Ultimate offert', icon: '♛', minXp: 73500, score: 95, tests: 30, offer: 'Ultimate', gift: '1 mois Ultimate offert, après vérification' },
]
export function rewardProgress(state, reward) {
  const xp = Math.max(0, Number(state.xp) || 0)
  const tests = Object.values(state.chapters || {}).filter((c) => Number.isFinite(c.quiz) && c.quiz <= 100 && c.quiz >= (reward.score || 100)).length
  const xpPct = Math.min(1, xp / reward.minXp)
  const pct = Math.round(Math.min(xpPct, reward.tests ? tests / reward.tests : 1) * 100)
  return { xp, tests, pct, eligible: xp >= reward.minXp && (!reward.tests || tests >= reward.tests), claimed: !!state.shopRewards?.[reward.id] }
}
export const walletRevision = (state) => Math.max(Date.now(), (state.shopWalletUpdatedAt || 0) + 1)
export function purchaseItem(state, id) {
  const item = shopById[id]
  if (!item || item.rewardOnly || !Number.isFinite(state.coins) || state.coins < item.price || (state.xp || 0) < (item.minXp || 0)) return state
  if (item.type !== 'consumable' && (state.owned || []).includes(id)) return state
  const next = { ...state, coins: state.coins - item.price, shopWalletUpdatedAt: walletRevision(state) }
  if (item.type === 'consumable') next.freezes = (state.freezes || 0) + (item.quantity || 1)
  else next.owned = [...(state.owned || []), id]
  return next
}
export function equipItem(state, id) {
  const item = shopById[id]
  if (!item || !(state.owned || []).includes(id)) return state
  const patch = item.type === 'palette' ? item.theme : item.type === 'avatar' ? { avatar: item.avatar } : item.type === 'banner' ? { banner: item.color } : item.type === 'title' ? { title: item.title } : null
  return patch ? { ...state, ...(item.type === 'palette' ? { theme: item.mode || 'light' } : {}), customTheme: { ...state.customTheme, ...patch } } : state
}
export function collectReward(state, id, now = new Date().toISOString()) {
  const reward = SHOP_REWARDS.find((r) => r.id === id)
  if (!reward) return state
  const progress = rewardProgress(state, reward)
  if (!progress.eligible || progress.claimed || (reward.offer && !state.account?.id)) return state
  const next = { ...state, shopRewards: { ...state.shopRewards, [id]: { claimedAt: now, status: reward.offer ? 'reserved' : 'collected' } } }
  if(reward.collection)next.owned=[...new Set([...(state.owned||[]),...SHOP_ITEMS.filter(item=>item.type!=='consumable').map(item=>item.id)])]
  if (reward.itemId) next.owned = [...new Set([...(state.owned || []), reward.itemId])]
  if (reward.freezes) { next.freezes = (state.freezes || 0) + reward.freezes; next.shopWalletUpdatedAt = walletRevision(state) }
  if (reward.title) next.customTheme = { ...state.customTheme, title: reward.title }
  if (reward.banner) next.customTheme = { ...state.customTheme, banner: reward.banner }
  return next
}
