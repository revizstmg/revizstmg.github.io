// Onglets disponibles pour la barre de navigation du bas. L'élève choisit
// lesquels afficher (2 à 5) et dans quel ordre (personnalisation). `labelKey`
// pointe vers une clé i18n. `match` : préfixes d'URL qui allument l'onglet.
export const ALL_TABS = {
  accueil: { icon: '🏠', labelKey: 'home', to: '/accueil', match: ['/accueil'] },
  cours: { icon: '📖', labelKey: 'coursTab', to: '/cours', match: ['/cours', '/subject'] },
  revision: { icon: '🧠', labelKey: 'reviseTab', to: '/revision', match: ['/revision', '/seance', '/missions'] },
  coachia: { icon: '🤖', labelKey: 'coachAI', to: '/coach-ia', match: ['/coach-ia'] },
  defi: { icon: '⚡', labelKey: 'dailyChallenge', to: '/defi', match: ['/defi'] },
  formules: { icon: '📐', labelKey: 'formulaWorkshop', to: '/atelier-formules', match: ['/atelier-formules', '/formules', '/express'] },
  methodo: { icon: '🧭', labelKey: 'methodoTitle', to: '/methodo', match: ['/methodo'] },
  boutique: { icon: '🛍️', labelKey: 'shop', to: '/boutique', match: ['/boutique'] },
  amis: { icon: '🤝', labelKey: 'friends', to: '/amis', match: ['/amis'] },
  classement: { icon: '🏆', labelKey: 'leaderboard', to: '/classement', match: ['/classement'] },
  classe: { icon: '🧑‍🏫', labelKey: 'myClass', to: '/classe', match: ['/classe'] },
  bacblanc: { icon: '📝', labelKey: 'mockExam', to: '/bac-blanc', match: ['/bac-blanc', '/excellence-economique'] },
  parcours: { icon: '🗺️', labelKey: 'myPath', to: '/parcours', match: ['/parcours'] },
  programme: { icon: '📅', labelKey: 'studyPlan', to: '/programme', match: ['/programme'] },
  coach: { icon: '🎯', labelKey: 'coach', to: '/coach', match: ['/coach'] },
  badges: { icon: '🏅', labelKey: 'badges', to: '/badges', match: ['/badges'] },
  favoris: { icon: '⭐', labelKey: 'favorites', to: '/favoris', match: ['/favoris'] },
  grandoral: { icon: '🎓', labelKey: 'grandOral', to: '/grand-oral', match: ['/grand-oral'] },
  etudegestion: { icon: '🔎', labelKey: 'egTitle', to: '/etude-de-gestion', match: ['/etude-de-gestion'] },
  profil: { icon: '⚙️', labelKey: 'meTab', to: '/parametres', match: ['/parametres', '/moi', '/mes-notes'] },
}

// Ordre proposé dans l'éditeur.
export const TAB_ORDER = Object.keys(ALL_TABS)

// Sélection par défaut : le cours, la révision et le bac blanc, à un toucher.
// Boutique, amis et classement restent sur l'accueil et dans le menu.
export const DEFAULT_TABS = ['accueil', 'cours', 'revision', 'bacblanc', 'profil']

// Professeur : ses classes et les cours, sans les outils de révision d'un élève.
export const DEFAULT_TABS_PROF = ['accueil', 'classe', 'cours', 'profil']

// Nettoie la sélection : ids connus, uniques, 2 à 5 onglets.
export function resolveTabs(ids, role = 'eleve') {
  const defaut = role === 'prof' ? DEFAULT_TABS_PROF : DEFAULT_TABS
  const list = (Array.isArray(ids) && ids.length ? ids : defaut).map(id => id === 'express' ? 'formules' : id).filter((id) => ALL_TABS[id])
  const uniq = [...new Set(list)].slice(0, 5)
  return uniq.length >= 2 ? uniq : defaut
}
