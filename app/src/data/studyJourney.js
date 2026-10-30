// Un exemple pédagogique, pas une vraie copie ni une correction produite en direct.
export const DEMO = {
  title: 'TVA : du devoir à la méthode',
  subject: 'Gestion et finance · Terminale STMG',
  courseUrl: '/cours/terminale/gestion-et-finance/appliquer-les-regles-comptables/la-tva-collectee-deductible-a-decaisser/',
  question: 'Pour ce cas fictif, toutes les opérations sont soumises à une TVA de 20 % et la TVA sur les achats est intégralement déductible. Sur une même période, une entreprise vend pour 1 200 € HT et achète pour 600 € HT. Calcule la TVA à décaisser et justifie ta réponse.',
  answer: '1 200 × 20 % = 240 €. L’entreprise doit donc payer 240 € de TVA.',
  criteria: [
    {label: 'Repérer les ventes et le taux',points:1,max:1,feedback:'Les ventes HT et le taux de 20 % sont correctement utilisés.'},
    {label: 'Calculer la TVA collectée',points:1,max:1,feedback:'1 200 × 0,20 = 240 € : le calcul est juste.'},
    {label: 'Calculer la TVA déductible',points:0,max:1,feedback:'Le calcul sur les achats manque : 600 × 0,20 = 120 €.'},
    {label: 'Appliquer la formule',points:0,max:1,feedback:'Il faut soustraire la TVA déductible de la TVA collectée.'},
    {label: 'Conclure avec le bon montant',points:0,max:1,feedback:'La TVA à décaisser est de 240 − 120 = 120 €, et non 240 €.'},
  ],
  exercises: [
    {skill:'Distinguer les deux TVA',question:'Dans le cas fictif, quelle TVA l’entreprise facture-t-elle à ses clients ? Quelle TVA peut-elle déduire sur ses achats ?',correction:'La TVA facturée sur les ventes est la TVA collectée : 240 €. La TVA sur les achats ouvrant droit à déduction est la TVA déductible : 120 €.'},
    {skill:'Refaire le calcul',question:'Un nouveau cas fictif : ventes de 1 500 € HT et achats de 800 € HT, tous à 20 %. Toute la TVA sur les achats est déductible. Calcule la TVA à décaisser.',correction:'TVA collectée : 1 500 × 0,20 = 300 €. TVA déductible : 800 × 0,20 = 160 €. TVA à décaisser : 300 − 160 = 140 €.'},
    {skill:'Expliquer un crédit de TVA',question:'Dans un autre cas fictif, la TVA collectée vaut 200 € et la TVA déductible 260 €. Que signifie le résultat de leur différence ?',correction:'200 − 260 = −60 €. La TVA déductible dépasse la TVA collectée : il existe un crédit de TVA de 60 €. Il n’y a pas de TVA à décaisser pour cette période.'},
  ],
}

export const PLANS = [
  {id:'free',name:'Gratuit',intro:'Apprendre les bases',features:['Cours et exercices de base','Favoris et suivi de progression']},
  {id:'premium',name:'Premium',intro:'Tout le site pour réviser',features:['Tout le contenu gratuit','Bac blanc, sujets, révision, flashcards et outils de méthode','Chaque aide par IA : 1 utilisation par mois']},
  {id:'ultimate',name:'Ultimate',intro:'L’IA sans compter',features:['Tout Premium','Aide par IA presque illimitée : tuteur, séries personnalisées, corrections']},
]
