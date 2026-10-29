import TexteRiche from '../components/TexteRiche.jsx'
import LegalContents from '../components/LegalContents.jsx'
import { Link } from 'react-router-dom'

// Conditions générales d'utilisation et mentions légales. Rédigées en français,
// comme la politique de confidentialité (Privacy.jsx). Accessibles depuis le
// pied de page. Dernière mise à jour : octobre 2026.
const lien = 'font-semibold text-[#84671b] underline dark:text-[#d9bd77]'

export default function Cgu() {
  return (
    <div className="animate-lux mx-auto max-w-2xl space-y-5">
      <header className="page-hero page-hero-compact">
        <p className="kicker"><TexteRiche texte={"RévizSTMG"} /></p>
        <h1 className="font-display text-3xl font-medium leading-tight"><TexteRiche texte={"Conditions d’utilisation & mentions légales"} /></h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400"><TexteRiche texte={"Dernière mise à jour : octobre 2026"} /></p>
      </header>
      <p className="text-sm"><TexteRiche texte="Les traductions facilitent la lecture. La version française de ces conditions fait référence." /></p><hr className="rule-gold" /><LegalContents />

      <Section title="Mentions légales">
        <p><TexteRiche texte={"**Éditeurs** : Matys DONAT et Gabriel MERLIN, élèves, à titre non professionnel et non commercial. Ils sont aussi responsables de la publication. Contact :  [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]]."} /></p>
        <p><TexteRiche texte={"**Hébergement du site** : GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis."} /></p>
        <p><TexteRiche texte={"**Hébergement des comptes et de la progression** : Supabase, serveurs situés dans l’Union européenne (région de Paris)."} /></p>
      </Section>

      <Section title="1. Objet">
        <p><TexteRiche texte={"Ces conditions encadrent l’utilisation de RévizSTMG, application gratuite de révision du bac STMG (cours, exercices, flashcards, bacs blancs, espace classe). Utiliser l’application vaut acceptation de ces conditions."} /></p>
      </Section>

      <Section title="2. Accès au service">
        <ul className="list-disc space-y-1 pl-5">
          <li><TexteRiche texte={"L’application est **gratuite**, sans publicité."} /></li>
          <li><TexteRiche texte={"Elle s’essaie **sans compte** : la progression reste alors sur l’appareil. Un **compte**  (adresse e-mail et mot de passe, ou Google) sauvegarde ta progression, te permet de la retrouver sur plusieurs appareils et donne accès aux espaces partagés (classe, amis, classement, suivi parent) et au rappel envoyé même quand l’application est fermée. Les informations données doivent être exactes ; le mot de passe est personnel et ne doit pas être partagé."} /></li>
          <li><TexteRiche texte={"Pour un élève mineur, l’utilisation suppose l’accord de l’établissement ou du représentant légal."} /></li>
          <li><TexteRiche texte={"Le service est fourni « en l’état ». Les éditeurs font de leur mieux pour qu’il reste disponible, sans pouvoir le garantir (maintenance, panne d’un hébergeur)."} /></li>
        </ul>
      </Section>

      <Section title="Boutique virtuelle et récompenses de progression">
        <p><TexteRiche texte={"Les pièces de la boutique sont gagnées dans l’application et n’ont aucune valeur monétaire. Elles ne s’achètent pas en euros. Les objets permanents restent dans la collection ; les gels de série sont consommés lorsqu’ils protègent une journée manquée."} /></p>
        <p><TexteRiche texte={"Les paliers sont récupérables une seule fois. Un mois Premium offert est proposé à partir de 20 000 XP (niveau 20) et de 20 tests de thèmes différents réussis à au moins 90 %. Un mois Ultimate offert est proposé à partir de 73 500 XP (niveau 30) et de 30 tests de thèmes différents réussis à au moins 95 %. Le meilleur résultat de chaque thème compte une seule fois."} /></p>
        <p><TexteRiche texte={"Premium et Ultimate sont des offres en préparation, sans date de lancement ni tarif annoncé. Premium prévoit l’analyse de copie, un bilan expliqué et un parcours vers les cours. Ultimate ajoute les exercices personnalisés générés, les corrections rédigées et le chatbot de cours. Pendant le développement, les outils restent accessibles aux comptes connectés. Le détail figure dans les [[offres prévues|/offres]]. Réserver une récompense n’active pas un abonnement. Après vérification des résultats par les éditeurs, le mois offert pourra être activé au lancement de l’offre concernée. Un compte est nécessaire ; l’attribution est limitée à un mois par compte et par offre. Aucun paiement, aucune carte bancaire et aucun renouvellement automatique ne sont prévus pour ces mois offerts. Les XP affichés localement ne constituent pas, seuls, une validation."} /></p>
        <p><TexteRiche texte={"Le lien « Préparer ma demande par e-mail » ouvre un brouillon dans la messagerie de l’utilisateur ; aucun message n’est envoyé automatiquement. Les demandes sont examinées à  [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]]."} /></p>
      </Section>

      <Section title="Abonnements payants (version de test)">
        <p><TexteRiche texte={"**Offres.** Deux abonnements existent : **Premium** (9,99 € TTC par mois ou 90 € TTC par an) et **Ultimate** (14,99 € TTC par mois ou 130 € TTC par an). Les prix sont affichés toutes taxes comprises."} /></p>
        <p><TexteRiche texte={"**Contenu des offres.** Les cours et les exercices de base sont gratuits. Premium donne accès au reste du site (bac blanc, sujets, outils de révision) et à chaque fonction d’intelligence artificielle une fois par mois ; Ultimate y ajoute une utilisation de l’intelligence artificielle presque illimitée, dans la limite d’un usage raisonnable."} /></p>
        <p><TexteRiche texte={"**Mode test.** Tant que la page des offres affiche « Mode test », aucune vraie carte n’est débitée : seules les cartes de test de Stripe fonctionnent."} /></p>
        <p><TexteRiche texte={"**Paiement.** Le paiement est traité par Stripe, qui reçoit les informations de carte ; RévizSTMG ne les voit ni ne les conserve. L’abonnement est renouvelé automatiquement à chaque échéance et peut être résilié à tout moment depuis « Gérer mon abonnement » ; il reste actif jusqu’à la fin de la période payée."} /></p>
        <p><TexteRiche texte={"**Qui peut s’abonner.** Il faut avoir 18 ans ou l’accord de son représentant légal, ce que la case à cocher avant le paiement confirme."} /></p>
        <p><TexteRiche texte={"**Droit de rétractation.** Tu disposes de 14 jours à compter de la souscription pour te rétracter en écrivant à revizstmg@gmail.com. Ces conditions de vente sont provisoires et seront complétées avant l’ouverture des paiements réels."} /></p>
      </Section>

      <Section title="3. Règles de bonne conduite">
        <p><TexteRiche texte={"Dans les espaces partagés (classe, messages de classe, défis entre amis, classement, nom affiché) :"} /></p>
        <ul className="list-disc space-y-1 pl-5">
          <li><TexteRiche texte={"respecter les autres : aucun propos insultant, harcelant, discriminatoire ou illégal ;"} /></li>
          <li><TexteRiche texte={"ne pas publier d’informations personnelles sur quelqu’un d’autre, ni de photo sans son accord ;"} /></li>
          <li><TexteRiche texte={"ne pas envoyer de messages en masse (spam), ne pas tenter d’accéder aux données des autres ni de perturber le service."} /></li>
        </ul>
        <p><TexteRiche texte={"Les professeurs peuvent retirer un contenu ou exclure un élève de leur classe. Les éditeurs peuvent supprimer un contenu ou un compte qui ne respecte pas ces règles. Pour signaler un problème :  [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]]."} /></p>
      </Section>

      <Section title="4. Contenu pédagogique">
        <p><TexteRiche texte={"Les cours et exercices suivent le programme officiel de STMG et sont relus avec soin. Ils peuvent malgré tout contenir des erreurs : ils complètent le cours du professeur sans le remplacer. Une erreur repérée ? Utilise le bouton « Signaler une erreur » sous l’exercice ou le chapitre, ou écris-nous : elle sera corrigée."} /></p>
        <p><TexteRiche texte={"Les vidéos et documents proposés en lien appartiennent à leurs auteurs et s’ouvrent sur leur propre site, sous leurs propres conditions."} /></p>
      </Section>

      <Section title="5. Fonctions qui s’appuient sur d’autres services">
        <ul className="list-disc space-y-1 pl-5">
          <li><TexteRiche texte={"**Fiche par photo** : la photo est envoyée à un service d’intelligence artificielle (Google Gemini ou Anthropic Claude) qui en tire une fiche. N’y mets pas d’informations personnelles."} /></li>
          <li><TexteRiche texte={"**Aides générées par IA dans les chapitres** (« Créer ma série », « Questions type de contrôle », tuteur de cours), « Excellence économique » et « Demande de révision » : à ta demande, le cours, tes questions, ton texte ou ta réponse sont envoyés à un service d’intelligence artificielle (Google Gemini ou Anthropic Claude). Une demande de révision peut inclure les fichiers que tu choisis. Un plafond quotidien local limite les clics répétés ; le serveur applique aussi ses limites. Les réponses de l’IA peuvent comporter des erreurs."} /></li>
          <li><TexteRiche texte={"**Traduction** de l’interface dans une autre langue que le français : les textes publics non intégrés sont envoyés au service MyMemory."} /></li>
        </ul>
        <p><TexteRiche texte={"Le détail figure dans la [[politique de confidentialité|/confidentialite]]."} /></p>
      </Section>

      <Section title="6. Propriété intellectuelle">
        <p><TexteRiche texte={"Les textes, exercices, illustrations et le code de RévizSTMG appartiennent à leurs auteurs. Tu peux les utiliser pour réviser, seul ou en classe. Toute autre reproduction ou réutilisation, en particulier commerciale, demande l’accord des éditeurs."} /></p>
      </Section>

      <Section title="7. Données personnelles">
        <p><TexteRiche texte={"La façon dont tes données sont traitées, et tes droits, sont décrits dans la  [[politique de confidentialité|/confidentialite]]."} /></p>
      </Section>

      <Section title="8. Modification des conditions">
        <p><TexteRiche texte={"Ces conditions peuvent évoluer avec l’application. La date de mise à jour figure en haut de la page ; en cas de changement important, l’information est donnée dans l’application."} /></p>
      </Section>

      <Section title="9. Droit applicable">
        <p><TexteRiche texte={"Ces conditions relèvent du droit français. En cas de difficulté, écris d’abord à  [[revizstmg@gmail.com|mailto:revizstmg@gmail.com]] : nous chercherons une solution à l’amiable."} /></p>
      </Section>

      <div className="pt-2">
        <Link to="/accueil" className="lien-retour">← Retour à l’accueil</Link>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-2 font-display text-lg font-semibold">{title}</h2>
      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  )
}
