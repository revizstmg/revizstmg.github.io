# Parcours de vacances STMG

Entrée `/#/vacances`, depuis Accueil, Réviser et Mon parcours. Complète le plan hebdomadaire de Claude (#129), sans le remplacer. Pilote droit/économie/management, Première et Terminale. Accessible sans paiement ; sans compte, sauvegarde sur l’appareil seulement.

## Parcours
- Choisir une matière, un à trois chapitres admissibles, l’objectif (bases ou contrôle), la date de départ, trois ou quatre séances par semaine et une durée indicative de 15/20/30 minutes.
- Six ou huit séances sur quatorze jours. Les dates sont indicatives, sans verrou calendaire ; aucun temps prévu n’est présenté comme du temps mesuré.
- Bilan initial de deux questions par chapitre. Chaque réponse et correction est sauvegardée immédiatement ; reprendre après rechargement.
- Séance : lire les passages utiles et les expliquer avec ses mots, puis jusqu’à trois questions. Les chapitres fragiles sont prioritaires, avec une compensation par nombre d’expositions pour conserver la couverture. Les questions nouvelles passent avant les rappels. Une question est présentée au maximum deux fois ; la création refuse une sélection trop courte pour tenir ce contrat.
- Objectif contrôle : accès mis en avant aux questions rédigées existantes du chapitre ; elles ne sont pas intégrées au calcul des deux bilans et conservent leurs conditions et limites propres.
- Bilan final après les séances : deux autres questions par chapitre. Les questions de bilan, de séance et de démonstration sont disjointes. Il s’agit d’un repère local QCM : ni épreuve étalonnée, ni mesure exhaustive des compétences, ni note scolaire.

## Contenu et limites
Questions issues exclusivement des exercices QCM déjà rattachés à chaque chapitre, chargés à la demande. Pas de nouvelle génération ni d’appel IA à l’ouverture. Un chapitre doit contenir au moins sept questions distinctes : une démonstration, deux au départ, deux à la fin et au moins deux pour pratiquer (la sélection totale doit aussi fournir neuf ou douze questions de pratique selon le rythme). Les courts chapitres sans réserve suffisante ne sont pas proposés ; aucun remplissage depuis un autre chapitre. Des questions de pratique peuvent revenir une seule fois plus tard pour consolider ; cela est annoncé. Les réponses scolaires privées ne sont jamais transmises au parent.

## Sauvegarde et partage
Le programme courant est `state.parcours.vacances`, synchronisé par le dossier de progression existant. Un seul programme courant ; confirmation avant remplacement. La fusion conserve le programme le plus récent lors d’un remplacement et réunit les réponses d’un même programme. Deux tirages concurrents d’une séance restent atomiques, sans mélanger les questions de deux versions. Les objectifs du parcours hebdomadaire restent indépendants.

Le résumé parent est un objet borné dans `subjects[].vacances` du JSON déjà prévu par `child_stats`, sans nouveau champ SQL. Seulement matière (entrée déjà existante), séances faites/prévues, pourcentages des deux QCM et date de départ. Pas de questions, réponses, conversation ou difficultés détaillées. Publication seulement avec le partage parent déjà activé volontairement ; désactivation/révocation et suppression existantes conservées. Aucun changement de table, RLS, réglage ou donnée NAH. Les tests interceptent toutes les requêtes externes.

## Interface
Six langues hors ligne pour les commandes. Contenu pédagogique conservé en français, identifié comme tel. Vert profond/crème, aplats, boutons non pilules, clavier et téléphone. Aucun prix réel ni avantage commercial promis : les abonnements restent en préparation.
