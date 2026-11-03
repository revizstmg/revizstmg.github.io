# Dix audits indépendants

Campagne du 2 novembre 2026, reprise et clôturée le 3 novembre après interruption de quatre agents par la limite d’utilisation. **Dix agents distincts ont terminé leur rapport.** Les contrôles terminés ont été récupérés, sans recommencer les lots entiers.

Version gelée : `f0f70220`, source `05bd1531`. Avant lancement, compilation publiée, index public identique et quatre régressions publiques confirmées. Référence préalable : CI41503625386,691 unitaires UTC/Paris et359 parcours réussis. Les audits utilisent des worktrees/ports séparés, sans échange de conclusions, par vagues de six maximum. Aucun changement produit dans cette campagne.

## Sept constats distincts sur la version auditée

| Priorité proposée | Constat | Rapport |
|---|---|---|
| P2 | Erreur d’acceptation d’un duel invisible dans Duels, visible seulement dans Amis. | [02](02-social.md) |
| P2 | Une ancienne réponse photo réapparaît après « Tout recommencer ». | [08](08-productions.md) |
| P2 | L’analyse photo reste en attente sans délai ni annulation dans la version auditée. | [08](08-productions.md) |
| P2 | Le minuteur Focus plein écran s’ancre à un ancêtre transformé : commandes hors écran320×568. | [09](09-mobile.md) |
| P2 | L’espace parent lié relit son RPC en boucle sans action ; useT instable réactive l’effet. | [10](10-sauvegarde.md) |
| P3 | Une description d’erreur OAuth contenant « % » provoque URIError par double décodage. | [01](01-comptes.md) |
| P3 | Un index de chapitre invalide affiche404 mais modifie le dernier thème local mémorisé. | [04](04-premiere.md), confirmé indépendamment par [05](05-terminale.md) |

Le dernier constat est compté une seule fois. Son impact est borné au marqueur local : la position de lecture prioritaire peut préserver la reprise visuelle. Le cas OAuth nécessite une description contenant un pourcentage ; le rejet de connexion ordinaire fonctionne. Les mesures parent sont synthétiques et ne sont pas extrapolées en trafic de production.

**Évolution pendant l’audit :** la PR#162 de Claude, publiée ensuite dans `2e26cb85` (source `c01ad875`), ajoute notamment un délai natif90s à l’analyse photo et corrige son message401. Le constat d’attente photo décrit donc la version gelée antérieure ; son correctif ultérieur n’est pas certifié par les sondes de cette campagne. Les six autres mécanismes demeurent visibles dans la relecture du code correspondant après#162. Aucun de ces sept constats n’a été corrigé par cette campagne d’audit. Les rapports ne doivent pas être présentés comme dix validations de toute version future.

## Dix rapports achevés

| Agent | Domaine | Résultat et réserves principales |
|---|---|---|
| [01](01-comptes.md) | Comptes et identité | 13 parcours initiaux,3 sondes finales et10 unitaires réussis ; défaut OAuth reproduit deux fois et par le coordinateur. |
| [02](02-social.md) | Classes, amis, duels, classement | 20 parcours distincts et14 unitaires réussis ; erreur duel reproduite deux fois. |
| [03](03-recompenses.md) | Boutique et récompenses | 15 parcours et13 unitaires réussis ; aucun défaut confirmé. Attribution commerciale et gains serveur non certifiés. |
| [04](04-premiere.md) | Première et langues | 17 scénarios réussis et21 unitaires ; index invalide reproduit deux fois ; cinq PDF échantillonnés. |
| [05](05-terminale.md) | Terminale | Lot16/18 puis deux reprises isolées : vrai cours TVA validé et index invalide confirmé ; erreur de sélection de cours initiale explicitée. |
| [06](06-revision.md) | Révision, formules, audio | Lot15/17 puis quatre reprises/sondes réussies ; aucun défaut confirmé. Audio qualifié comme retard d’automatisation, parcours repris après fermeture du bandeau cookies. |
| [07](07-examens.md) | Bac, créateur, copies, Excellence | 20 scénarios distincts et64 unitaires réussis ; trois délais initiaux rejoués avec succès, aucun défaut confirmé. |
| [08](08-productions.md) | Notes, photo, contrôle, tuteur, oral | 18 réussites sur20 scénarios distincts ; deux défauts photo répétés isolément,22 exécutions au total. |
| [09](09-mobile.md) | Mobile, navigation, accessibilité | 20 scénarios réussis ; inspection visuelle puis reproduction géométrique du défaut Focus. Axe seul ne détectait pas ce défaut. |
| [10](10-sauvegarde.md) | Sauvegarde, offline, parent, pages publiques | Lot16/17 puis reprise du temps réussie ; boucle parent reproduite deux fois avec plafond de réponses. Recherche et codes parent vérifiés après correction des sondes. |

Ces nombres se recoupent entre agents et avec la CI : aucun total artificiel de fonctions uniques n’est calculé. Les commandes, variantes, résultats et incidents d’outillage sont détaillés dans chaque rapport. Amis/Boutique/Classe sans abonnement restent confirmés ; le Classement reste réservé, conformément à la règle existante.

## Preuves et limites

Les preuves compactes sont sous [preuves/](preuves/) ; traces et captures complètes restent dans `/workspace/work/audit10-20261102/preuves-NN/`. Les scripts de sondes dépendent du helper réseau bloqué `app/tests/parcours/eleve.js` et de chemins de sortie à adapter dans une worktree isolée. Ne pas retirer les interceptions réseau.

Comptes, copies, réponses IA, paiements et appels sociaux sont synthétiques. Aucun compte réel, courrier, paiement, quota facturé ni mutation Supabase. Les RLS/fonctions effectivement déployées, manuscrits, corrections pédagogiques réelles et concurrences entre appareils réels ne sont pas certifiés. Les délais liés à la charge de la machine, erreurs de sélecteurs et attentes incorrectes sont conservés séparément des défauts. Chromium et variantes d’écrans/langues échantillonnées, pas certification Safari ou lecteur d’écran humain. Inventaire et couverture ciblée ne signifient pas chaque bouton, chapitre et combinaison exhaustivement certifiés.

Le nouvel espace EPS demandé le3novembre est postérieur à la version gelée ; il fera l’objet d’une validation distincte.
