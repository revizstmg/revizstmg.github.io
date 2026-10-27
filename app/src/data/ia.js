// Cadre commun des fonctions d'intelligence artificielle.
// Une seule liste des fonctions qui envoient des données à un fournisseur d'IA :
// elle sert de référence aux pages légales (confidentialité, CGU) et au test
// qui vérifie qu'aucun appel n'a été ajouté sans y figurer. L'activation de
// chaque fonction dépend du serveur ; le budget et le fournisseur sont décidés
// par le propriétaire du projet, pas par ce fichier.
export const FONCTIONS_IA = [
  { id: 'serie', nom: 'Créer ma série', fichier: 'data/practice.js', envoie: 'le cours du chapitre et les questions déjà posées' },
  { id: 'controle', nom: 'Questions type de contrôle', fichier: 'components/ChapterControl.jsx', envoie: 'le cours du chapitre et ta réponse rédigée' },
  { id: 'tuteur', nom: 'Envoyer au tuteur', fichier: 'components/CourseTutor.jsx', envoie: 'le cours du chapitre et tes questions' },
  { id: 'examen', nom: 'Examen blanc personnalisé', fichier: 'data/examenPersonnalise.js', envoie: 'ta demande et des extraits de cours' },
  { id: 'excellence', nom: 'Excellence économique', fichier: 'data/excellence.js', envoie: 'ton texte et le sujet' },
  { id: 'etude', nom: 'Demande de révision', fichier: 'data/studyRequest.js', envoie: 'ta demande et le cours concerné' },
  { id: 'photo', nom: 'Fiche par photo', fichier: 'ficheVision.js', envoie: 'la photo choisie' },
]

// Phrase unique quand une fonction d'IA n'est pas disponible.
export const MESSAGE_IA_INDISPONIBLE = 'Cette aide par intelligence artificielle n’est pas disponible pour le moment. Le cours et les exercices du site restent utilisables.'

// Garde-fou local contre les boucles et les clics répétés : au-delà, on s'arrête
// avant d'appeler le serveur (qui applique aussi sa propre limite).
export const LIMITE_IA_PAR_JOUR = 60
const CLE = 'stmg_ia_usage'

const jour = () => new Date().toISOString().slice(0, 10)
function lire() {
  try {
    const v = JSON.parse(localStorage.getItem(CLE) || 'null')
    return v && v.jour === jour() ? v : { jour: jour(), n: 0 }
  } catch { return { jour: jour(), n: 0 } }
}
export function utilisationsIA() { return lire().n }
// À appeler juste avant chaque requête qui envoie des données à une IA.
export function reserverIA() {
  const v = lire()
  if (v.n >= LIMITE_IA_PAR_JOUR) throw new Error('rate_limit')
  try { localStorage.setItem(CLE, JSON.stringify({ jour: v.jour, n: v.n + 1 })) } catch { /* stockage indisponible */ }
}
