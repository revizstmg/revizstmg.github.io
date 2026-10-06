// Internationalisation de l'interface (FR, EN, ES, IT, AR) + traduction du contenu.
// - `useT()` renvoie une fonction t(clé) pour les libellés d'interface
//   (traduits à la main ci-dessous).
// - `useAutoTranslate(texte)` traduit un texte français à la volée via le
//   moteur du dictionnaire (glossaire + service en ligne), avec cache.
import { useEffect, useState } from 'react'
import { useStore } from './store.jsx'
import { translate } from './translate.js'

// --- Libellés d'interface -------------------------------------------------
const FR = {
  // en-tête / navigation
  search: 'Rechercher un chapitre', dictionary: 'Dictionnaire', language: 'Langue',
  mySpace: 'mon espace', light: 'Passer en mode clair', dark: 'Passer en mode sombre',
  home: 'Accueil', theme: 'Thème', chapter: 'Chapitre', level: 'Niveau', levelShort: 'Niv.',
  streakDays: 'j de suite', streakTitle: 'Jours de révision consécutifs', xpTitle: 'Niveau et points d’expérience',
  loginStreak: 'Série de connexion', dailyRewardTitle: 'Récompense de connexion', daysStreakS: 'jour d’affilée', daysStreakP: 'jours d’affilée',
  milestoneReached: 'Palier atteint', comeBackTomorrow: 'Reviens demain pour continuer ta série !', awesome: 'Génial !',
  rewardClaimedToday: 'Récompense du jour récupérée', rewardComeToday: 'Ouvre l’appli chaque jour pour gagner de l’XP', daysLeftS: 'jour restant', daysLeftP: 'jours restants', progression: 'de progression',
  shop: 'Boutique', shopSub: 'Dépense tes pièces pour personnaliser ton espace.', yourBalance: 'Ton solde', coinsUnit: 'pièces',
  howToEarnCoins: 'Tu gagnes des pièces 🪙 en révisant et en te connectant chaque jour.', buy: 'Acheter', notEnough: 'Pièces insuffisantes',
  equip: 'Équiper', equipped: 'Équipé', inStock: 'En stock', resetTheme: 'Thème par défaut',
  catBoost: 'Objets utiles', catTheme: 'Thèmes de couleur', catAvatar: 'Avatars', shopTile: 'Pièces à dépenser',
  // accueil / tableau de bord
  greetingNight: 'Belle nuit', greetingMorning: 'Bonjour', greetingAfternoon: 'Bon après-midi', greetingEvening: 'Bonsoir',
  change: 'Changer', resume: 'Reprendre', start: 'Commencer', randomChapter: 'Chapitre au hasard',
  mySubjects: 'Tes matières', badges: 'Badges', favorites: 'Favoris',
  earnedM: 'obtenu', earnedP: 'obtenus', chapToReviewM: 'chapitre à revoir', chapToReviewP: 'chapitres à revoir',
  chapters: 'chapitres', comingSoon: 'Bientôt disponible',
  savedOnDevice: 'Progression sauvegardée sur cet appareil.',
  courseBasedNote: 'Contenu basé sur ton cours « Terminale STMG — Cours complet ». Progression sauvegardée sur cet appareil.',
  // fiche d'accueil
  welcome: 'Bienvenue', enterHint: 'Touchez pour entrer', letsMeet: 'Faisons connaissance',
  fillCard: 'Renseigne ta fiche pour un espace de révision à ton nom.',
  firstName: 'Prénom', lastName: 'Nom', yourFirstName: 'Ton prénom', yourLastName: 'Ton nom',
  yourClass: 'Ta classe', yourSpecialty: 'Ta spécialité', enter: 'Entrer', soon: 'bientôt', toCome: 'à venir',
  chooseLevel: 'Choisis ton niveau pour commencer.', whatRevise: 'Qu’est-ce que tu veux réviser ?',
  // écran d'entrée (Landing)
  soonShort: 'Bientôt', complete: 'Complet', specialtyComing: 'Spécialité à venir',
  commonSubjectsNote: 'Les matières communes (Management, Droit, Éco, Maths, Philo, Histoire-Géo, Langues) sont disponibles pour toutes les spécialités.',
  landingNote: 'Tu pourras changer de niveau ou de spécialité à tout moment, depuis l’accueil.',
  // inscription — choix des matières & chapitres
  planTitle: 'Que veux-tu travailler ?', planSub: 'Choisis tes matières, puis touche le chapitre où tu en es.',
  whereAreYou: 'Où en es-tu ?', continueBtn: 'Continuer', skipStep: 'Passer cette étape',
  pickSubjectsHint: 'Touche une ou plusieurs matières.', chapterChosen: 'Chapitre choisi',
  // personnalisation des couleurs
  customize: 'Personnalisation', ambiances: 'Ambiances', colorBg: 'Fond', colorInk: 'Texte',
  colorAccent: 'Accent', colorCard: 'Rubriques', resetColors: 'Réinitialiser les couleurs',
  customizeHint: 'Change les couleurs du site : fond, texte, accent et rubriques.',
  themeDefault: 'Défaut', themeNight: 'Nuit dorée', themeOcean: 'Océan', themeEmerald: 'Émeraude',
  themeRose: 'Rose poudré', themeAmethyst: 'Améthyste', themeLicorice: 'Noir & Or', themeCoral: 'Corail',
  secColors: 'Couleurs', secTypo: 'Typographie', secAvatar: 'Avatar / icône', secStyle: 'Style',
  fontTitles: 'Titres', fontText: 'Texte', cornersLabel: 'Coins', sizeLabel: 'Taille du texte', initialsLabel: 'Initiales',
  cornerRound: 'Arrondi', cornerSoft: 'Doux', cornerSharp: 'Net', cornerXl: 'Très rond',
  sizeS: 'Compact', sizeM: 'Normal', sizeL: 'Grand', sizeXl: 'Très grand', resetAllAppearance: 'Tout réinitialiser',
  secTabs: 'Onglets du bas', tabsHint: 'Choisis 2 à 5 raccourcis et leur ordre.', tabsAdd: 'Ajouter un onglet', tabsReset: 'Rétablir les onglets par défaut',
  secBanner: "Bandeau d'accueil", bannerHint: 'La couleur du bandeau « Bonsoir… » et de la date.', bannerReset: 'Couleur par défaut (or)',
  progressCurve: 'Ma progression', timePerTheme: 'Temps par thème', curveSoon: 'Ta courbe apparaîtra dès demain, après quelques jours de révision.', timeSoon: 'Révise un peu pour voir ton temps par thème.', hourShort: 'h', reminderBodyStreak: 'Garde ta série de {n} jours 🔥 — quelques questions maintenant ?', revisionSheet: 'Fiche de révision',
  review: 'Réviser', myDecks: 'Mes flashcards', cardsCount: 'cartes', downloadDeck: 'Enregistrer', deckSaved: 'Enregistrée', downloadDeckTitle: 'Flashcards de ce chapitre', downloadDeckHint: 'à réviser dans « Réviser »', decksAppOnly: "Installe l'application pour télécharger des paquets de flashcards et les réviser hors-ligne.", noDeckYet: 'Aucun paquet pour l’instant. Enregistre-en un depuis un cours pour le retrouver ici.', deckSavedWhere: 'Retrouve-le dans « Réviser › Mes flashcards »', decksHowTo: 'Astuce : dans un cours, onglet Exercices, appuie sur 🃏 pour enregistrer un paquet ici.',
  pause: 'Pause', audioReview: 'Révision audio', audioUnsupported: "La lecture vocale n'est pas disponible sur cet appareil.", audioHint: 'Écoute mains-libres : terme puis définition, en boucle.', weeklyGoal: 'Objectif de la semaine', weeklyGoalHint: 'Travaille {n} chapitres cette semaine pour gagner un bonus.', weeklyClaim: 'Récupérer la récompense', weeklyClaimed: 'Récompense de la semaine obtenue', shareDeck: 'Partager', shareHint: 'Envoie ce code à un ami : il le colle dans « Importer un paquet ».', importDeck: 'Importer un paquet', importPlaceholder: 'Colle un code de paquet…', importBtn: 'Importer', importError: 'Code invalide. Vérifie le code copié.', downloadThemeDeck: 'Flashcards de tout le thème', downloadSubjectDeck: 'Flashcards de toute la matière', themeSchema: 'Schéma du thème',
  dailyChallenge: 'Défi du jour', challengeIntroTitle: 'Prêt pour le défi ?', challengeIntroSub: '{n} questions rapides tirées de ton programme. Une récompense à la clé, une fois par jour.', challengeStart: 'Commencer', challengeDoneToday: 'Défi du jour relevé !', challengeComeBack: 'Reviens demain pour un nouveau défi et allonger ta série.', challengeStreak: 'Série de défis', challengeSoon: 'Le défi arrive : travaille quelques chapitres pour débloquer des questions.', challengeCardCta: 'Relève le défi et gagne un bonus', best: 'Record', backHome: "Retour à l'accueil",
  formulasTitle: 'Formulaire', searchFormula: 'Rechercher une formule…', noResult: 'Aucun résultat.', formulasCardHint: 'Toutes les formules à connaître', formulasCount: '{n} formules tirées des cours', formulasAll: 'Toutes', formulasFilter: 'Filtrer par matière', commonMistakes: 'Erreurs fréquentes à éviter', themeExam: 'Bac blanc de ce thème', themeExamSub: 'Un entraînement chronométré, noté sur 20', focusFullscreen: 'Plein écran', focusFsHint: 'Reste concentré. Le minuteur continue même hors de cet écran.', voiceInput: 'Dicter la réponse', progressPath: 'Ta progression dans la matière', expressMode: 'Révision express', expressIntroTitle: '5 minutes chrono', expressIntroSub: 'Un maximum de bonnes réponses en 5 minutes, tous thèmes mélangés.', expressResult: '{c} bonnes réponses sur {n}', expressCardHint: '5 min, tous thèmes', finishNow: 'Terminer maintenant',
  myNotes: 'Mes notes', myNotesPlaceholder: 'Écris ici tes remarques, astuces, points à revoir…', myNotesHint: 'Enregistré automatiquement et synchronisé sur tes appareils.', methodoTitle: 'Méthodo par épreuve', methodoSub: 'La marche à suivre et un exemple pour chaque type d’épreuve.',
  importPhoto: 'Importer une photo', removePhoto: 'Retirer la photo',
  leaderboard: 'Classement', reviseTab: 'Réviser', weeklyRanking: 'Classement de la semaine', coursesThisWeek: 'cours cette semaine', resumeTitle: 'Reprends ta révision', startTitle: 'Prêt à commencer ?', startSub: 'Tu n’as encore rien commencé. Choisis une matière et lance ta première leçon.', startCourseBtn: 'Commencer un cours', toReviseSection: 'À réviser', themesCount: 'thèmes', continueChip: 'Continuer', startChip: 'Commencer',
  weeklyRankHint: 'Le classement se remet à zéro chaque lundi.',
  joinClass: 'Rejoindre une classe', classCodeField: 'Code de classe', joinBtn: 'Rejoindre', leaveClass: 'Changer de classe',
  classCodeHint: 'Entre le code partagé par ton prof / ton lycée (le même pour toute la classe).',
  rankOffline: 'Classement momentanément indisponible. Réessaie plus tard.', retry: 'Réessayer', youLabel: 'Toi',
  loadingContent: 'Chargement du cours…', loadingContentError: 'Impossible de charger le cours. Vérifie ta connexion.',
  noOneYet: 'Personne cette semaine — sois le premier !', classLabel: 'Classe',
  league: 'Ligue', leagueHint: 'Toutes les classes actives cette semaine, classées par total de cours révisés.',
  noClassesYet: 'Aucune classe active cette semaine — lance le mouvement !',
  avgPerStudent: 'moy./élève', totalCourses: 'total classe', membersS: 'élève actif', membersP: 'élèves actifs',
  leagueNote: 'La ligue n’affiche que des totaux par classe, jamais les noms des élèves.',
  friends: 'Amis', friendsSub: 'Ajoute tes amis par code et comparez votre progression.',
  secRevise: 'Réviser & réussir', secCommunity: 'Communauté & progression',
  myFriendCode: 'Ton code ami', copyCode: 'Copier le code', copied: 'Copié', friendCodeHint: 'Partage ce code : tes amis l’utilisent pour t’ajouter.',
  parentSpace: 'Espace parent', imParent: 'Je suis un parent',
  parentIntro: 'Suivez la progression de révision de votre enfant, en toute simplicité.',
  parentOffline: 'Le suivi en ligne n’est pas disponible pour le moment.',
  parentLinkTitle: 'Relier le compte de mon enfant', parentLinkHelp: 'Demandez à votre enfant son « code parent » (dans Mon espace) et saisissez-le ici.',
  parentCodePlaceholder: 'Code parent', parentLinkBtn: 'Relier', parentNotFound: 'Aucun élève trouvé pour ce code.',
  parentForStudents: 'Tu es élève ? Ton code parent est dans « Mon espace » — donne-le à tes parents.',
  parentLastActive: 'Dernière activité', parentRefresh: 'Actualiser', parentNoData: 'En attente des premières données de révision…',
  parentStreak: 'Série', parentDays: 'jours de suite', parentLevel: 'Niveau', parentTotalTime: 'Temps de révision', parentWeeklyGoal: 'Objectif semaine',
  parentBadges: 'Badges', parentSubjects: 'Progression par matière', parentBacIn: 'Bac dans', parentDaysShort: 'jours', parentUnlink: 'Délier ce compte',
  studentParentCard: 'Suivi parental', studentParentHelp: 'Donne ce code à tes parents : ils suivront ta progression (temps, série, matières) en lecture seule.',
  roleParent: 'Parent', parentSignupHint: 'Suivez la progression de votre enfant. Munissez-vous de son « code parent » (visible dans Mon espace, sur son compte élève).', parentContinue: 'Continuer vers l’espace parent',
  continueWithGoogle: 'Continuer avec Google', continueWithApple: 'Continuer avec Apple', orSeparator: 'ou', oauthFinish: 'Dernière étape : complétez votre profil.', finishSignup: 'Terminer',
  addFriend: 'Ajouter un ami', friendCodePlaceholder: 'CODE AMI', send: 'Envoyer',
  friendReqSent: 'Demande envoyée ✓', friendSelf: 'C’est ton propre code 🙂', friendNotFound: 'Aucun élève avec ce code.',
  friendReqPending: 'Demande déjà en attente.', friendAlready: 'Vous êtes déjà amis.',
  friendRequests: 'Demandes reçues', accept: 'Accepter',
  myFriends: 'Mes amis', friendReqWaiting: 'en attente', noFriendsYet: 'Aucun ami pour l’instant — partage ton code !',
  friendRemove: 'Retirer', friendRemoveConfirm: 'Retirer cet ami ?',
  friendsPrivacy: 'Tes amis voient ton prénom, ta photo et ta progression (XP, série, cours de la semaine).',
  duels: 'Duels', duel: 'Duel', duelVs: 'Contre', duelWith: 'Duel avec', newDuel: 'Nouveau duel', duelRandom: 'Thème au hasard',
  chooseTheme: 'Choisis le thème', duelsReceived: 'Défis reçus', duelChallengesYou: 'te défie', theirScore: 'son score',
  duelAccept: 'Relever', duelNeedFriend: 'Ajoute d’abord un ami pour le défier.', duelsWaiting: 'En attente de l’adversaire',
  duelHistory: 'Historique des duels', noDuelsYet: 'Aucun duel pour l’instant — lance un défi !',
  duelSent: 'Défi envoyé !', duelSentHint: '{opp} joue les mêmes questions, puis vos scores seront comparés.',
  yourScore: 'Ton score', duelWin: 'Victoire ! 🏆', duelLoss: 'Défaite', duelDraw: 'Égalité', you: 'Toi',
  duelTooFew: 'Pas assez de questions sur ce thème — choisis-en un autre.',
  duelWinShort: 'V', duelLossShort: 'D', duelDrawShort: '=',
  duelInviteBtn: 'Envoyer le défi', play: 'Jouer', duelPlayNow: 'À jouer maintenant', duelReadyPlay: 'Ton adversaire est prêt — à toi de jouer !',
  duelWaitAccept: 'En attente d’acceptation', duelWaitAcceptHint: 'On attend que {opp} accepte le défi pour lancer le duel en même temps.',
  duelWaitScore: 'En attente du score', duelWaitScoreHint: 'Ton adversaire n’a pas encore joué. Tu verras le résultat dès qu’il aura terminé.',
  duelCancel: 'Annuler', duelDeclinedByOther: 'Le défi a été annulé.',
  chaptersWord: 'chapitres', duelPickTheme: 'Choisis au moins un chapitre.', duelPickThemes: 'Chapitres à réviser (un ou plusieurs)',
  duelLaunch: 'Lancer', duelKahootHint: 'QCM chronométré · 10 questions · des points selon ta rapidité.',
  duelConfirmHint: 'Tu joues les mêmes questions, en chrono. Prêt ?', duelAcceptPlay: 'Accepter & jouer', duelDecline: 'Refuser', timeUp: 'Temps écoulé',
  rankPrivacy: 'Ton prénom et ta photo seront visibles par les autres élèves de la classe.',
  account: 'Compte', createAccount: 'Créer un compte', loginTab: 'Se connecter', createMyAccount: 'Créer mon compte',
  roleStudent: 'Élève', roleTeacher: 'Professeur', emailField: 'Adresse e-mail', passwordField: 'Mot de passe',
  classCodeOptional: 'Code de classe (optionnel)', continueNoAccount: 'Continuer sans compte', pleaseWait: 'Un instant…',
  confirmEmailMsg: 'Compte créé ! Vérifie ton e-mail pour le confirmer, puis connecte-toi.',
  signOut: 'Se déconnecter', loggedInAs: 'Connecté', teacherRole: 'Professeur', studentRole: 'Élève',
  accountRequired: 'Crée ton compte pour accéder à ton espace de révision.',
  loginSub: 'Connecte-toi pour retrouver ta progression.',
  noAccountYet: 'Pas encore de compte ? Créer un compte',
  haveAccountAlready: 'Déjà un compte ? Se connecter',
  // espace classe & QCM de classe
  classSpace: 'Espace classe', myClass: 'Ma classe', joinClassShort: 'Rejoindre avec un code',
  enterClassCode: 'Entre ton code de classe', shareCodeHint: 'partage ce code avec ta classe',
  classJoinPrivacy: 'Ton prénom (et ta photo) seront visibles par les membres de la classe.',
  tabRanking: 'Classement', tabQuizzes: 'QCM', tabMembers: 'Membres',
  createQuiz: 'Créer un QCM', noQuizProf: 'Aucun QCM pour l’instant. Crée le premier pour ta classe !',
  noQuizStudent: 'Aucun QCM pour l’instant. Ton prof en ajoutera bientôt.',
  quizUntitled: 'QCM sans titre', playQuiz: 'Jouer', quizRanking: 'Classement', delete: 'Supprimer',
  deleteQuizConfirm: 'Supprimer ce QCM et tous ses résultats ?',
  backToQuizzes: 'Retour aux QCM', noResultYet: 'Aucun résultat pour l’instant.', participants: 'participants',
  quizTitle: 'Titre du QCM', quizTitlePlaceholder: 'ex : Le contrat de travail',
  remove: 'Retirer', questionPlaceholder: 'Écris ta question…', choicesLabel: 'Réponses',
  markCorrect: 'Marquer comme bonne réponse', choice: 'Réponse', addChoice: 'Ajouter une réponse',
  explainOptional: 'Explication (facultatif)', explainPlaceholder: 'Pourquoi cette réponse est correcte…',
  correctChoiceHint: 'Touche la pastille pour désigner la bonne réponse.', addQuestion: 'Ajouter une question',
  cancel: 'Annuler', publishQuiz: 'Publier le QCM', quizNeedsOne: 'Ajoute un titre et au moins une question valide.',
  membersHint: 'Les élèves apparaissent ici dès qu’ils travaillent un cours dans la classe.',
  noMemberYet: 'Personne n’a encore rejoint cette classe.', membersCount: 'membres',
  // espace classe — onglets & sections
  tabGoal: 'Objectif', tabWall: 'Mur', tabTeacher: 'Prof', announcement: 'Annonce',
  segWeek: 'Semaine', segXp: 'XP', segSubjects: 'Matières', segGroups: 'Groupes', segLeague: 'Ligue',
  podiumHint: 'Le meilleur de la classe dans chaque matière.', podiumNobody: 'personne pour l’instant',
  groupsHint: 'Total de cours de la semaine par groupe.', noGroupYet: 'Aucun groupe pour l’instant. Le prof peut en créer.',
  groupUnnamed: 'Groupe', withoutGroup: 'sans groupe', leagueHint: 'Les classes du lycée s’affrontent cette semaine.',
  yourClassLabel: 'ta classe', leagueEmpty: 'Aucune autre classe du lycée cette semaine.',
  collectiveGoal: 'Objectif de la classe', goalReached: '🎉 Objectif atteint ! Récompense débloquée.',
  goalRemaining: 'Encore', unlockGoldTheme: 'Activer le thème doré (récompense)', noGoalYet: 'Le prof n’a pas encore fixé d’objectif.',
  collectiveStreak: 'Flamme de la classe', streakOn: 'La classe est en feu aujourd’hui !', streakOff: 'Révisez à plusieurs pour allumer la flamme.',
  activeToday: 'actifs aujourd’hui', weeklyChallenge: 'Défi de la semaine', goChallenge: 'Relever le défi',
  reviewBingo: 'Bingo de révision', bingoHint: 'Coche les missions en révisant cette semaine.',
  bingoCourse1: '1 cours travaillé', bingoCourse3: '3 cours', bingoCourse5: '5 cours', bingoStreak3: 'Série de 3 jours',
  bingoXp200: '200 XP', bingoBadge: '1 badge', bingoFav: '1 favori', bingoThreeSubjects: '3 matières', bingoMaster: '1 chapitre maîtrisé',
  segQuizzes: 'QCM', segDuels: 'Duels', proposeQuestion: 'Proposer un QCM', studentProposals: 'Propositions d’élèves',
  approve: 'Approuver', dueBy: 'à rendre pour le', assign: 'Devoir', removeDeadline: 'retirer l’échéance',
  proposeHint: 'Ta proposition sera visible après validation par le prof.', sendProposal: 'Envoyer la proposition',
  pickQuizForDuel: 'Choisis un QCM pour le duel', noQuizForDuel: 'Aucun QCM disponible. Demande au prof d’en créer.',
  startDuel: 'Lancer un duel', noDuelYet: 'Aucun duel pour l’instant.', duelsToAccept: 'Défis à relever',
  theirScore: 'Son score', acceptDuel: 'Relever le défi', quizGone: 'QCM supprimé', yourOpenDuels: 'Tes défis lancés',
  waitingOpponent: 'En attente d’un adversaire', finishedDuels: 'Duels terminés',
  kindAnnounce: 'Annonce', kindQuestion: 'Question', kindSos: 'SOS chapitre',
  sosChapterPlaceholder: 'Quel chapitre te bloque ?', announcePlaceholder: 'Un message pour toute la classe…',
  sosPlaceholder: 'Explique ce qui te bloque…', questionWallPlaceholder: 'Pose ta question à la classe…',
  postAnon: 'Anonyme', post: 'Publier', wallEmpty: 'Rien sur le mur pour l’instant.', anonymous: 'Anonyme',
  resolved: 'résolu', reply: 'Répondre', replyPlaceholder: 'Ta réponse…', sendReply: 'Envoyer', markResolved: 'Résolu',
  thisWeekShort: 'cette sem.',
  profBoard: 'Tableau', profGroups: 'Groupes', profSettings: 'Réglages',
  medianLabel: 'Médiane', participation: 'Participation', insightsTitle: 'Recommandations', distributionTitle: 'Répartition des niveaux', topStudents: 'Meilleurs élèves', searchStudent: 'Rechercher un élève…',
  insightRelaunch: 'Relance {n} élève(s) en décrochage — un petit message peut tout changer.',
  insightWeakSubject: 'Point faible de la classe : {subject} ({pct} %). Propose un QCM ou revois-le en cours.',
  insightLowPart: 'Seulement {a}/{b} élèves ont travaillé cette semaine — lance un défi pour motiver la classe.',
  insightGood: 'Belle dynamique ({pct} %) — propose un défi pour viser encore plus haut !',
  classDashboard: 'Tableau de bord', lacunaHint: 'Niveau moyen par matière (rouge = à retravailler).',
  classAvg: 'Moyenne classe', activeThisWeek: 'actifs cette semaine', atRisk: 'Décrocheurs', atRiskOnly: 'Décrocheurs uniquement', noAtRisk: 'Aucun décrocheur 🎉',
  perStudent: 'Suivi par élève', sortBy: 'Trier', sortActivity: 'Activité', sortAverage: 'Moyenne', sortWeek: 'Cours/sem.',
  inactiveTag: 'Inactif', strugglingTag: 'En difficulté', okTag: 'Actif',
  lastActiveShort: 'vu', neverActive: 'jamais', todayWord: 'aujourd’hui', yesterdayWord: 'hier', agoWord: 'il y a',
  exportCsv: 'Exporter CSV', printPdf: 'Imprimer / PDF', lacunaTitle: 'Carte des lacunes',
  nameCol: 'Nom', streakCol: 'Série', weekCol: 'Cours (sem.)', lastActiveCol: 'Dernière activité', avgCol: 'Moyenne',
  weakest: 'Point faible', createGroup: 'Créer un groupe', createGroupHint: 'Fais des équipes pour des compétitions internes.',
  groupNamePlaceholder: 'Nom du groupe (ex : Les Lions)', deleteGroupConfirm: 'Supprimer ce groupe ?',
  assignMembers: 'Répartir les élèves', noGroup: 'Sans groupe',
  classCrest: 'Blason de la classe', crestNamePlaceholder: 'Nom de la classe (ex : Les Aigles)', save: 'Enregistrer',
  weeklyGoalTarget: 'Objectif hebdomadaire', goalTargetHint: 'Nombre de cours à cumuler ensemble cette semaine.',
  classAnnouncement: 'Annonce à la classe', publishAnnouncement: 'Publier l’annonce', setChallenge: 'Défi de la semaine',
  chooseSubject: 'Choisir une matière', chooseChapterShort: 'Choisir un chapitre', saved: 'Enregistré',
  myMenu: 'Mon menu', menu: 'Menu', customizeProfile: 'Personnaliser mon profil',
  // mode direct
  segLive: 'Direct', liveNow: 'Session en direct !', tapToJoin: 'touche pour rejoindre',
  liveMode: 'Mode Direct', liveHostIntro: 'Anime un QCM projeté ; tes élèves répondent en direct sur leur téléphone.',
  pickQuizForLive: 'Choisis un QCM à animer', noQuizForLive: 'Crée d’abord un QCM dans l’onglet QCM.', launch: 'Lancer',
  noLiveYet: 'Aucune session en direct', noLiveHint: 'Attends que ton prof en lance une (la page se met à jour toute seule).',
  joinWithCode: 'Rejoignez avec le code', playersJoining: 'Élèves connectés', startLive: 'Démarrer', waitPlayers: 'En attente d’au moins un élève…', endLive: 'Terminer',
  answered: 'ont répondu', reveal: 'Révéler les réponses', seePodium: 'Voir le podium', finalPodium: 'Podium final', close: 'Fermer',
  youAreIn: 'Tu es dans la partie !', waitHost: 'En attente du prof…', answerRecorded: 'Réponse enregistrée', waitOthers: 'En attente des autres…',
  correctAnswer: 'Bonne réponse !', wrongAnswer: 'Raté…', noAnswerGiven: 'Pas de réponse', youWon: 'Tu as gagné !', gameOver: 'Partie terminée', yourRank: 'ta place',
  // mon espace
  myStats: 'Mes statistiques', mastered: 'Maîtrisés', accuracy: 'Précision', seeAll: 'Tout voir',
  noBadgeYet: 'Aucun badge pour l’instant. Gagne-en en jouant !', goToLessons: 'Aller aux cours', appearanceHint: 'Couleurs, police, avatar, photo…',
  // professeur : classes & codes
  teacherLevel: 'Niveau enseigné', whatDoYouTeach: 'Qu’enseignes-tu ?', howManyClasses: 'Combien de classes de STMG ?',
  codesWillBeGenerated: 'Un code unique sera généré pour chaque classe (tu pourras le voir et le partager ensuite).',
  classWord: 'Classe', yourClasses: 'Tes classes', removedFromClass: 'Tu as été retiré de cette classe par le professeur.',
  codeNotEditable: 'Code non modifiable — partage-le à tes élèves.', copied: 'Copié', copy: 'Copier', createNewClass: 'Créer une nouvelle classe',
  createFirstClass: 'Crée ta première classe', createFirstClassHint: 'Génère un code unique et partage-le à tes élèves pour qu’ils te rejoignent.',
  generateClassCode: 'Générer le code de ma classe',
  manageStudents: 'Gérer les élèves', manageStudentsHint: 'Assigne un groupe ou exclus un élève de la classe.',
  excludeConfirm: 'Exclure', exclude: 'Exclure de la classe', bannedFromClass: 'Tu as été exclu de cette classe et ne peux plus la rejoindre.',
  // connexion : rôle & mot de passe oublié
  iAm: 'Je suis', forgotPassword: 'Mot de passe oublié ?',
  resetIntro: 'Entre ton adresse e-mail : nous t’enverrons un code de récupération.',
  resetCodeIntro: 'Saisis le code reçu par e-mail, puis choisis un nouveau mot de passe.',
  recoveryCode: 'Code de récupération', newPassword: 'Nouveau mot de passe',
  sendResetCode: 'Envoyer le code', resetPassword: 'Réinitialiser le mot de passe', resendCode: 'Renvoyer le code', backToLogin: 'Retour à la connexion',
  resetSent: 'Un e-mail avec un code de récupération vient d’être envoyé (vérifie tes spams).',
  enterValidEmail: 'Entre une adresse e-mail valide.', resetNeedCode: 'Saisis le code reçu par e-mail.', resetNeedPass: 'Le mot de passe doit faire au moins 8 caractères, avec une lettre et un chiffre.',
  // RGPD / confidentialité
  privacyPolicy: 'Politique de confidentialité', termsOfUse: 'CGU et mentions légales', cookiesTitle: 'Cookies', cookiesInfo: 'Aucun cookie publicitaire ni de suivi.', cookiesMore: 'En savoir plus', cookiesOk: 'OK', dangerZone: 'Zone sensible',
  notFoundTitle: 'Page introuvable', notFoundText: 'Cette page n’existe pas : le lien est peut-être incomplet ou ancien.', notFoundMoved: 'Cette page n’existe plus : le contenu a peut-être été réorganisé.', notFoundBack: 'Revenir à', notFoundHome: 'Retour à l’accueil',
  emailHint: 'Adresse incomplète : elle doit ressembler à prenom.nom@exemple.fr.', passwordRule: '8 caractères minimum, avec au moins une lettre et un chiffre.', nameRule: 'Lettres uniquement (les tirets et apostrophes sont acceptés).', signupBlocked: 'Inscription refusée par le contrôle anti-robots. Attends quelques secondes et réessaie.', loginPaused: 'Plusieurs essais sans succès : patiente {s} s avant de réessayer.', msgEmpty: 'Écris ton message avant de l’envoyer.', msgTooLong: 'Message trop long.', msgTooManyLinks: 'Pas plus de deux liens par message.', msgRepeated: 'Ce message ressemble à du spam (caractères répétés).', msgTooFast: 'Patiente quelques secondes entre deux messages.', msgDuplicate: 'Tu viens déjà d’envoyer ce message.', postFailed: 'L’envoi a échoué : vérifie ta connexion et réessaie.',
  installApp: 'Installer l’application', installBtn: '📲 Installer',
  installAppHint: 'Ajoute RévizSTMG à ton écran d’accueil : accès en un tap, en plein écran, et ça marche même hors connexion.',
  installIosHint: 'Sur iPhone/iPad : appuie sur « Partager » ⎙ en bas de Safari, puis « Sur l’écran d’accueil ».',
  installGuideHint: 'Dans le menu de ton navigateur (⋮), choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».',
  installDone: 'Application installée', installDoneHint: 'RévizSTMG est installée sur cet appareil — lance-la depuis ton écran d’accueil.',
  installBannerText: 'Installe RévizSTMG comme une appli', later: 'Plus tard',
  installGuideTitle: 'Installer l’application', installGuideSub: 'Ajoute RévizSTMG à ton écran d’accueil en quelques secondes.',
  installNow: '📲 Installer maintenant', installSeeHow: 'Voir comment installer', installOrManual: 'ou, manuellement :',
  appOnlyTitle: 'Exclusivité de l’application', appOnlyBadge: 'Appli',
  appOnlyBody: 'Cette fonctionnalité est réservée à l’application installée. Installe RévizSTMG (gratuit, en 10 s) pour la débloquer.',
  openInSafari: '🧭 Ouvrir dans Safari', copyLink: '📋 Copier le lien', linkCopied: '✓ Lien copié — colle-le dans Safari',
  chooseDevice: 'Quel appareil utilises-tu ?', deviceIphone: 'iPhone / iPad', deviceAndroid: 'Android', changeDevice: '‹ Changer d’appareil',
  iosStep1: 'Ouvre revizstmg.github.io dans Safari (obligatoire : sur iPhone, seul Safari installe l’app).',
  iosStep2: 'Appuie sur Partager — l’icône ⎙ en bas de l’écran.',
  iosStep3: 'Choisis « Sur l’écran d’accueil », puis « Ajouter ». 🎉',
  iosTip: 'Dans Chrome sur iPhone, il n’y a que « Ajouter aux favoris » (un simple marque-page) : ça n’installe pas l’app. Passe par Safari.',
  andStep1: 'Ouvre le menu ⋮ (en haut à droite).',
  andStep2: 'Choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».',
  deskStep1: 'Clique sur l’icône d’installation dans la barre d’adresse.',
  coach: 'Coach de révision', coachSub: 'Un minuteur pour rythmer tes révisions, et des méthodes qui te correspondent.',
  coachAI: 'Coach IA', coachAISub: 'Une IA qui analyse tes points faibles et te crée un entraînement sur-mesure.',
  aiNoData: 'Fais quelques exercices d’abord : je repérerai tes points faibles et te créerai un entraînement personnalisé.', aiNoDataCta: 'Commencer à réviser',
  aiMyAnalysis: 'Mon analyse', aiIntro: 'J’ai analysé tes {n} réponses.', aiFocusSubject: 'À renforcer en priorité : {subject} ({pct}%).', aiGoodOverall: 'Bon niveau d’ensemble — on consolide et on vise plus haut !',
  aiLevelLabel: 'Niveau global', aiWeakTitle: 'Tes points faibles', aiStrongTitle: 'Tes points forts', aiNoWeak: 'Aucun point faible marqué — continue comme ça !',
  aiStart: 'Démarrer l’entraînement personnalisé', aiTraining: 'Entraînement personnalisé', aiAdapts: 'Chaque question s’adapte à tes résultats.', aiSessionDone: 'Entraînement terminé',
  aiBonusQuestion: 'Question bonus sur ton point faible', aiLocal: 'Analyse faite sur ton appareil — aucune donnée envoyée.',
  aiDiagnostic: 'Diagnostic', aiCoverage: 'Programme couvert', aiThisWeek: 'Cette semaine', aiActiveDays: 'jours actifs cette semaine', aiAccuracy: 'Taux de réussite',
  aiMastery: 'Ta maîtrise du programme', aiMastered: 'Maîtrisés', aiSolid: 'Solides', aiFragile: 'Fragiles', aiUnseen: 'Non vus',
  aiBySubject: 'Niveau par matière', aiNotSeen: 'À commencer',
  aiPlanTitle: 'Ton plan jusqu’au bac', aiPlanSub: 'Généré à partir de tes résultats et de la répétition espacée. Coche en révisant.', aiPlanEmpty: 'Rien à planifier pour l’instant — fais quelques exercices, je construirai ton plan.',
  aiToday: 'Aujourd’hui', aiTomorrow: 'Demain', aiDayIn: 'Dans {n} j', aiSetBac: 'Règle la date de ton bac pour un plan précis', aiBacIn: 'J-{n} avant le bac',
  aiAdviceTitle: 'Les conseils de ton coach', aiTargetSubject: 'Cibler une matière', aiAllSubjects: 'Toute la filière',
  aiLvlBeginner: 'Débutant', aiLvlProgress: 'En progrès', aiLvlConfirmed: 'Confirmé', aiLvlExpert: 'Expert', aiLevelTag: 'Ton niveau',
  aiThemesDone: 'thèmes travaillés', aiViewPlanMore: 'Voir tout le plan', aiViewPlanLess: 'Réduire',
  photoFiche: 'Fiche par photo', photoFicheSub: 'Photo → fiche',
  preferences: 'Préférences', prefA11yHint: 'Police adaptée (dys), fort contraste, lecture à voix haute', prefTabs: 'Personnaliser les onglets', prefTabsHint: 'Choisis les raccourcis de la barre du bas',
  prefBac: 'Date de mon bac', prefBacHint: 'Sert au compte à rebours et au plan de révision',
  timerTitle: 'Minuteur de révision', minShort: 'min', presetsLabel: 'Réglages rapides',
  preset_classic: 'Classique', preset_balanced: 'Équilibré', preset_marathon: 'Marathon', preset_custom: 'Perso',
  startTimer: 'Démarrer', pauseTimer: 'Pause', resetTimer: 'Réinitialiser', skipPhase: 'Passer',
  phaseFocus: 'Révision', phaseBreak: 'Pause', phaseReady: 'Prêt ?',
  sessionsDoneS: 'session terminée', sessionsDoneP: 'sessions terminées', resetToEdit: 'Réinitialise le minuteur pour changer les durées.',
  focusTip: 'Range ton téléphone, ferme les onglets inutiles et concentre-toi sur un seul chapitre.',
  breakTip: 'Lève-toi, bois de l’eau, repose tes yeux. Évite les écrans si tu peux !',
  idleTip: 'Choisis ta durée de révision et de pause, puis appuie sur Démarrer.',
  focusXpNote: 'Tu gagnes des XP à chaque session de révision terminée.',
  methodsTitle: 'Quelle méthode te correspond ?', methodsSub: 'Réponds à 3 questions pour des conseils personnalisés.',
  seeResults: 'Voir mes méthodes', restartQuiz: 'Recommencer', yourMethods: 'Tes méthodes conseillées', allMethods: 'Toutes les méthodes',
  smartRevision: 'Révision intelligente', smartRevisionSub: 'On te propose en priorité ce que tu risques d’oublier et tes points faibles.',
  toReviewToday: 'À revoir', weakPoints: 'Points faibles', neverSeen: 'Jamais vus', reviseNow: 'Réviser maintenant', priorityList: 'À réviser en priorité',
  reasonDue: 'À revoir', reasonWeak: 'Point faible', reasonNew: 'Nouveau', reasonReview: 'À consolider', masteredThemes: 'Thèmes maîtrisés',
  mockExam: 'Bac blanc', mockExamSub: 'Un examen chronométré, corrigé et noté sur 20, comme le jour J.',
  chooseSubject: 'Choisis la matière', wholeTrack: 'Toute la filière', duration: 'Durée', questionsShort: 'questions',
  startExam: 'Commencer l’examen', notEnoughQuestions: 'Pas assez de questions pour cette sélection — choisis une autre matière.',
  examNote: 'Aucune correction pendant l’épreuve : tout s’affiche à la fin.', examResult: 'Résultat du bac blanc', submitExam: 'Rendre ma copie', answered: 'répondu(es)',
  studyPlan: 'Programme jusqu’au bac', setBacDate: 'Quelle est la date de ton bac ?', examCountdown: 'Prochain bac', itsToday: 'C’est aujourd’hui !',
  editDate: 'Modifier la date', todayGoals: 'Tes objectifs du jour', allCaughtUp: 'Rien d’urgent — continue à réviser 💪', overallProgress: 'Avancement global', themes: 'thèmes',
  grandOral: 'Grand Oral', grandOralSub: 'Comprendre l’épreuve, préparer tes 2 questions et t’entraîner à l’oral.',
  accessibility: 'Accessibilité', accessibilitySub: 'Réglages pour lire plus confortablement. Toujours disponible, jamais bloqué.',
  dysMode: 'Confort dyslexie', dysDesc: 'Police lisible + espacement des lettres et des lignes.',
  contrastMode: 'Fort contraste', contrastDesc: 'Couleurs plus tranchées pour mieux voir.',
  bigTextMode: 'Grand texte', bigTextDesc: 'Agrandit tout le texte du site.',
  readAloud: 'Lire à voix haute', readAloudHint: 'Sur chaque cours, le bouton 🔊 lit le texte à voix haute.',
  reminders: 'Rappels de révision', dailyReminder: 'Rappel quotidien', dailyReminderHint: 'Une notification douce « c’est l’heure de réviser ».',
  reminderTime: 'Heure', testNotif: 'Tester', reminderTitle: 'RévizSTMG', reminderBody: 'C’est l’heure de réviser ! 📚',
  notifDenied: 'Notifications refusées — autorise-les dans les réglages de ton navigateur.', notifSent: 'Notification envoyée ✓', notifUnsupported: 'Notifications non disponibles sur cet appareil.',
  reminderLimit: 'App ouverte : rappel garanti. App fermée : possible sur Android installé ; sur iPhone, garde l’app ouverte en arrière-plan.',
  dropoutAlert: 'Élèves en décrochage', dropoutHint: 'À relancer en priorité.', noWorkWeek: 'Inactif cette semaine',
  bulkImport: 'Import rapide (coller plusieurs questions)', bulkAdd: 'Ajouter les questions', bulkNone: 'Aucune question détectée — vérifie le format.',
  bulkHelp: '1 bloc = 1 question (ligne vide entre les blocs).\nLigne 1 : la question · lignes suivantes : les choix (mets * devant la bonne) · ligne « = … » : explication.',
  bulkPlaceholder: 'Quelle est la capitale de la France ?\n* Paris\nLyon\nMarseille\n= Paris est la capitale.',
  deleteAccount: 'Supprimer mon compte', deleteAccountHint: 'Efface définitivement ton compte et toutes tes données (progression, classe, contributions).',
  deleteAccountConfirm: 'Supprimer définitivement ton compte et toutes tes données ? Cette action est irréversible.',
  consentText: 'J’ai lu et j’accepte les conditions d’utilisation et la politique de confidentialité.', readPrivacy: 'Lire',
  faq: 'FAQ', startGuide: 'Guide de démarrage', contactUs: 'Nous contacter', createdBy: 'Créé par',
  privacySummary: 'RévizSTMG utilise ton prénom, ton nom, ton e-mail et (si tu le souhaites) ta photo, ainsi que ta classe et ta progression, uniquement pour faire fonctionner l’application. Les données sont hébergées dans l’Union européenne (Supabase). Ton prénom, ta photo et tes scores sont partagés dans ta classe, les défis entre amis et le classement ; ton e-mail sert seulement à la connexion. Aucune publicité, aucune revente. Tu peux modifier ou supprimer tes données à tout moment depuis « Mon espace ». Pour un élève mineur, l’accord de l’établissement et/ou du représentant légal est requis.',
  // chapitre / thème
  backToChapters: 'Revenir aux chapitres', savePdf: 'Enregistrer (PDF)', gamesOfChapter: 'Jeux de ce chapitre', keyDefs: 'Définitions clés',
  notionsDefs: 'Notions et définitions', notionCol: 'Notion', definitionCol: 'Définition',
  exoUnit: 'exercice', exoUnitP: 'exercices', notionUnit: 'notion', notionUnitP: 'notions',
  previous: 'Précédent', nextChapter: 'Chapitre suivant', takeTest: 'Passer le test du thème', pageWord: 'Page', tapToOpen: 'Appuyer pour lire en plein écran',
  new: 'Nouveau', tabChapters: 'Chapitres', tabTest: 'Test du thème', tabProgress: 'Progression', tabTools: 'Outils', tabLesson: 'Cours', tabDefs: 'Définitions', tabExercises: 'Exercices', noDefsHere: 'Les définitions clés de ce thème se trouvent dans les autres chapitres.', lessonLabel: 'Le cours', exercisesLabel: 'Exercices',
  chooseChapter: 'Choisis un chapitre pour lire le cours et t’entraîner.', course: 'Cours',
  courseInChapters: 'Le cours, chapitre par chapitre', chapterWord: 'chapitre', chaptersWord: 'chapitres', exerciseWord: 'exercice', exercisesWord: 'exercices', chooseChapterHint: 'Suis les chapitres dans l’ordre, ou choisis directement celui à réviser.',
  catCourse: 'Le cours', catDeep: 'Cours approfondi', catMethod: 'Méthodes & calculs', catCases: 'Études de cas',
  gameSing: 'jeu', gamePlur: 'jeux', themeMastery: 'Maîtrise du thème', detailByGame: 'Détail par jeu',
  memoSheet: 'Fiche mémo — l’essentiel', goFurther: 'Pour aller plus loin',
  goFurtherSub: 'Vidéos et ressources pour approfondir (s’ouvrent dans un nouvel onglet).',
  saveFicheBtn: 'Enregistrer la fiche (PDF)', reviseBtn: 'Réviser',
  // jeux — cadre (GameHost)
  backToGames: 'Retour aux jeux', quit: 'Quitter', chooseMode: 'Choisis ton mode de jeu.',
  training: 'Entraînement', trainingDesc: 'Sans pression, avec les corrections détaillées.',
  challenge: 'Défi', challengeDesc: 'Chronomètre + score. Gagne plus d’XP !',
  check: 'Vérifier', next: 'Suivant', replay: 'Rejouer', changeMode: 'Changer de mode', done: 'Terminé',
  seeScore: 'Voir mon score', yourAnswer: 'Ta réponse…', goodAnswers: 'bonnes réponses',
  gl_qcm: 'QCM', gl_vraifaux: 'Vrai / Faux', gl_flashcard: 'Flashcards', gl_association: 'Association',
  gl_tri: 'Tri par catégories', gl_trou: 'Texte à trous', gl_ordre: 'Remise en ordre',
  gl_calcul: 'Calcul express', gl_memory: 'Memory', gl_doc: 'Étude de documents',
  gl_saisie: 'Réponse à écrire', gl_verbs: 'Verbes irréguliers', gl_grammar: 'Grammaire', gl_comprehension: 'Compréhension', gl_sql: 'Requête SQL', gl_caspratique: 'Cas pratique chiffré',
  // jeux — détail (mini-jeux)
  question: 'Question', answer: 'Réponse', seeAnswer: 'Voir la réponse', showAnswer: 'Voir la réponse', flipCard: 'Retourner la carte',
  tapToFlip: '👆 Touche pour retourner', toReview: 'À revoir', iKnew: 'Je savais', restartDeck: 'Recommencer', reviewMissed: 'Revoir les cartes à revoir', flashWellDone: 'Bien joué !', cardsKnownOf: '{c} acquise(s) sur {n}', toReviewLabel: 'à revoir', swipeHint: 'Glisse la carte : ← à revoir · je savais →',
  feedbackGood: 'Bravo !', feedbackBad: 'Presque…', timeUp: 'Temps écoulé.', nextQuestion: 'Question suivante',
  trueLabel: 'Vrai', falseLabel: 'Faux', exact: 'Exact !', rightAnswerIs: 'La bonne réponse :',
  expectedAnswer: 'Réponse attendue :', answerToComplete: 'Réponse à compléter', numericAnswer: 'Réponse chiffrée',
  listening: 'Compréhension orale', reading: 'Compréhension écrite', listen: 'Écouter', listenAgain: 'Réécouter', listenSlow: 'Plus lentement',
  listenInstr: 'Écoute l’audio (autant de fois que tu veux), puis réponds aux questions.',
  ttsNote: 'Voix lue par ton appareil.', answerAllFirst: 'Réponds à toutes les questions', yourScore: 'Ton score', transcript: 'Transcription',
  wellSorted: 'Bien classé !', itWas: 'C’était :', errorsCount: 'Erreurs',
  stepN: 'Étape', chooseBelow: 'choisis ci-dessous…',
  matchEach: 'Relie chaque élément à sa correspondance.', findPairs: 'Retrouve les paires.', hiddenCard: 'Carte cachée',
  // étude de documents
  readDocsThenAnswer: 'Lis attentivement les documents, puis réponds aux questions.',
  answerToThe: 'Répondre aux', questionsWord: 'questions', toWrite: 'À rédiger', basedOnDoc: 'd’après le doc.',
  writeAnswerHere: 'Rédige ta réponse ici…', seeCorrection: 'Voir le corrigé', correction: 'Corrigé',
  category: 'Catégorie', wasYourAnswerCorrect: 'Ta réponse était-elle correcte ?', iMastered: 'Je maîtrisais',
  // test du thème
  fullEvalOn: 'Une évaluation complète sur', qcmQuestionsSuffix: 'questions de QCM',
  writtenQuestionsSuffix: 'questions à rédiger', caseStudiesSuffix: 'cas pratiques à analyser',
  selfEvalNote1: 'Les questions rédigées se corrigent en auto-évaluation : tu rédiges ta réponse, puis tu affiches le corrigé et tu t’évalues honnêtement.',
  startTest: 'Commencer le test', back: 'Retour', part1Qcm: 'Partie 1 · QCM', part2Written: 'Partie 2 · À rédiger',
  themeTestDone: 'Test du thème terminé', succeeded: 'réussies',
  selfEvalNote2: 'Les questions rédigées sont auto-évaluées : sois honnête pour suivre ta vraie progression.',
  retakeTest: 'Refaire le test', analyzeCase: 'Analyse ce cas :', sortJustify: 'Classe et justifie :',
  presentExplain: 'Présente et explique :', defineExplain: 'Définis / explique :',
  caseStudy: 'Cas pratique', sortedClass: 'Classement justifié', development: 'Développement', writing: 'Rédaction',
  // pages badges / favoris
  myBadges: 'Mes badges', myFavorites: 'Mes favoris', badgesOf: 'Les badges de', favoritesOf: 'Les favoris de',
  unlocked: 'débloqués', earnedCheck: 'Obtenu ✓', resetProgress: 'Réinitialiser ma progression',
  resetConfirm: 'Effacer toute ta progression (XP, badges, scores) sur cet appareil ?',
  noFavYet: 'Aucun chapitre en favori pour l’instant.',
  addFavHint: 'Ajoute-en avec l’étoile ☆ sur une page de chapitre.',
  removeFav: 'Retirer des favoris', addFav: 'Ajouter aux favoris',
  autoTranslated: 'traduit automatiquement',
}
// Le français est inclus d'office. Les autres langues sont chargées à la demande
// (un fichier par langue) : l'app démarre plus vite pour tous ceux qui révisent
// en français. Le temps du chargement, les libellés s'affichent en français.
const DICT = { fr: FR }
const CHARGEURS = {
  en: () => import('./i18n/en.js'),
  es: () => import('./i18n/es.js'),
  it: () => import('./i18n/it.js'),
  ar: () => import('./i18n/ar.js'),
}
const enCours = {}
const abonnes = new Set()
function chargerLangue(lang) {
  if (DICT[lang] || !CHARGEURS[lang] || enCours[lang]) return
  enCours[lang] = CHARGEURS[lang]()
    .then((m) => { DICT[lang] = m.default; abonnes.forEach((maj) => maj()) })
    .catch(() => { delete enCours[lang] }) // hors ligne : on réessaiera
}

export function useLang() {
  const { state } = useStore()
  return state.lang || 'fr'
}

export function useT() {
  const lang = useLang()
  const [, setVersion] = useState(0)
  useEffect(() => {
    if (DICT[lang]) return
    const maj = () => setVersion((v) => v + 1)
    abonnes.add(maj)
    chargerLangue(lang)
    return () => { abonnes.delete(maj) }
  }, [lang])
  return (key) => (DICT[lang] && DICT[lang][key]) || FR[key] || key
}

// Libellé traduit d'un type de jeu (qcm, vraifaux, …).
export function useGameLabel() {
  const t = useT()
  return (type) => t('gl_' + type)
}

// Traduit un texte français vers la langue de l'interface (cache + service en
// ligne). Affiche le français tant que la traduction n'est pas arrivée.
export function useAutoTranslate(text) {
  const lang = useLang()
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (lang === 'fr' || !text || !String(text).trim()) { setOut(text); return }
    let alive = true
    translate(String(text), 'fr', lang)
      .then((r) => { if (alive && r.text) setOut(r.text) })
      .catch(() => { if (alive) setOut(text) })
    return () => { alive = false }
  }, [text, lang])
  return lang === 'fr' ? text : out
}
