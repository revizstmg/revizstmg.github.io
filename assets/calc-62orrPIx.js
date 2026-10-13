const a=(n,e,t=1)=>Math.floor(Math.random()*((e-n)/t+1))*t+n,c=(n,e=2)=>Math.round(n*10**e)/10**e,$={tva:()=>{const n=a(40,120)*1e3,e=a(10,Math.floor(n/1e3/2))*1e3,t=20,r=n*t/100,o=e*t/100,i=r-o;return{prompt:`Ventes HT = ${s(n)} € ; achats HT = ${s(e)} € ; TVA à 20 %.
Calcule la TVA à décaisser.`,answer:i,unit:"€",tolerance:1,explain:`TVA collectée = ${s(n)} × 20 % = ${s(r)} €.
TVA déductible = ${s(e)} × 20 % = ${s(o)} €.
TVA à décaisser = ${s(r)} − ${s(o)} = ${s(i)} €.`}},seuil:()=>{const n=a(200,500)*1e3,e=a(30,55)/100,t=c(n*(1-e),0),r=a(60,Math.floor(n*e/1e3))*1e3,o=n-t,i=o/n,p=r/i;return{prompt:`CA = ${s(n)} € ; charges variables = ${s(t)} € ; charges fixes = ${s(r)} €.
Calcule le seuil de rentabilité (en €).`,answer:p,unit:"€",tolerance:200,explain:`MCV = ${s(n)} − ${s(t)} = ${s(o)} €.
Taux de MCV = ${s(o)} / ${s(n)} = ${c(i,3)}.
Seuil = charges fixes / taux de MCV = ${s(r)} / ${c(i,3)} ≈ ${s(c(p,0))} €.`}},amortissement:()=>{const n=a(8,40)*1e3,e=a(4,10),t=n/e;return{prompt:`Machine : ${s(n)} € HT, durée d'utilisation ${e} ans, amortissement linéaire.
Calcule l'annuité « pleine ».`,answer:t,unit:"€",tolerance:1,explain:`Taux linéaire = 1/${e} = ${c(100/e,2)} %.
Annuité = ${s(n)} × 1/${e} = ${s(c(t,2))} €.`}},caf:()=>{const n=a(20,90)*1e3,e=a(10,60)*1e3,t=n+e;return{prompt:`Résultat net = ${s(n)} € ; dotations aux amortissements = ${s(e)} € (ni reprise ni cession).
Calcule la CAF (méthode additive).`,answer:t,unit:"€",tolerance:1,explain:`CAF = résultat net + dotations − reprises + VNC cédées − produits de cession.
CAF = ${s(n)} + ${s(e)} = ${s(t)} €.`}},frng:()=>{const n=a(300,600)*1e3,e=a(200,n/1e3-20)*1e3,t=n-e;return{prompt:`Ressources stables = ${s(n)} € ; emplois stables = ${s(e)} €.
Calcule le FRNG.`,answer:t,unit:"€",tolerance:1,explain:`FRNG = ressources stables − emplois stables = ${s(n)} − ${s(e)} = ${s(t)} €.`}},taux_evolution:()=>{const n=a(100,400)*100,e=a(100,500)*100,t=(e-n)/n*100;return{prompt:`Une valeur passe de ${s(n)} à ${s(e)}.
Calcule le taux d'évolution (en %, arrondi à 0,1).`,answer:c(t,1),unit:"%",tolerance:.2,explain:`t = (V arrivée − V départ) / V départ = (${s(e)} − ${s(n)}) / ${s(n)} = ${c(t/100,4)} = ${c(t,1)} %.`}},cm_successif:()=>{const n=a(3,20),e=a(-15,20),t=(1+n/100)*(1+e/100),r=(t-1)*100;return{prompt:`Une grandeur augmente de ${n} % puis évolue de ${e} %.
Quel est le taux d'évolution global (en %, arrondi à 0,1) ?`,answer:c(r,1),unit:"%",tolerance:.3,explain:`CM global = (1 + ${n}/100) × (1 ${e<0?"−":"+"} ${Math.abs(e)}/100) = ${c(t,4)}.
Taux global = (CM − 1) × 100 = ${c(r,1)} %.`}},suite_geo:()=>{const n=a(10,40)*1e3,e=a(5,15),t=1-e/100,r=a(2,5),o=n*t**r;return{prompt:`Une valeur de ${s(n)} € perd ${e} % par an (suite géométrique).
Quelle est sa valeur au bout de ${r} ans ? (arrondi à l'euro)`,answer:c(o,0),unit:"€",tolerance:2,explain:`q = 1 − ${e}/100 = ${t}.
u_${r} = ${s(n)} × ${t}^${r} = ${s(c(o,2))} ≈ ${s(c(o,0))} €.`}},derivee_affine:()=>{const n=a(-5,5)||2,e=a(-20,40),t=a(-6,6),r=2*n*t+e;return{prompt:`Soit f(x) = ${n}x² ${e>=0?"+ "+e:"− "+-e}x + ${a(-10,10)}.
Calcule f'(${t}).`,answer:r,unit:"",tolerance:.01,explain:`f'(x) = 2×${n}x ${e>=0?"+ "+e:"− "+-e} = ${2*n}x ${e>=0?"+ "+e:"− "+-e}.
f'(${t}) = ${2*n}×${t} ${e>=0?"+ "+e:"− "+-e} = ${r}.`}},optimisation:()=>{const n=(a(0,1)?1:-1)*a(1,4),e=a(1,5)*(a(0,1)?1:-1),t=-2*n*e,r=a(-10,10),o=n*e*e+t*e+r,i=n>0?"minimum":"maximum";return{prompt:`Soit f(x) = ${u(n,t,r)}.
En utilisant la dérivée, calcule la valeur du ${i} de f (l'extremum).`,answer:o,unit:"",tolerance:.01,explain:`f'(x) = ${2*n}x ${l(t)} s'annule en x = −b/(2a) = ${e}.
f' change de signe en ${e} : ${i} atteint en x = ${e}.
Extremum : f(${e}) = ${n}·(${e})² ${l(t)}·(${e}) ${l(r)} = ${o}.`}},esperance_binomiale:()=>{const n=a(5,40),e=a(10,90)/100,t=n*e;return{prompt:`X suit la loi binomiale B(${n} ; ${e}).
Calcule l'espérance E(X).`,answer:c(t,2),unit:"",tolerance:.05,explain:`Pour une loi binomiale, E(X) = n × p = ${n} × ${e} = ${c(t,2)}.`}},proba_totale:()=>{const n=a(40,70)/100,e=c(1-n,2),t=a(1,6)/100,r=a(2,9)/100,o=n*t+e*r;return{prompt:`Machine A (${Math.round(n*100)} %) : ${Math.round(t*100)} % de défauts ; machine B (${Math.round(e*100)} %) : ${Math.round(r*100)} % de défauts.
Probabilité qu'une pièce prise au hasard soit défectueuse ? (en %, arrondi 0,1)`,answer:c(o*100,1),unit:"%",tolerance:.2,explain:`P(D) = P(A)×${t} + P(B)×${r} = ${n}×${t} + ${e}×${r} = ${c(o,4)} = ${c(o*100,1)} %.`}},valeur_apres_evolution:()=>{const n=a(50,500)*10,e=a(-30,40)||10,t=c(n*(1+e/100),2);return{prompt:`Une valeur de ${s(n)} € évolue de ${e} %.
Calcule la nouvelle valeur (arrondi au centime).`,answer:t,unit:"€",tolerance:.5,explain:`Nouvelle valeur = ${s(n)} × (1 ${e<0?"−":"+"} ${Math.abs(e)}/100) = ${s(n)} × ${c(1+e/100,3)} = ${s(t)} €.`}},indice_base100:()=>{const n=a(80,200)*10,e=a(60,260)*10,t=c(e/n*100,1);return{prompt:`Valeur de référence (base 100) : ${s(n)}.
Valeur observée : ${s(e)}.
Calcule l'indice (base 100, arrondi à 0,1).`,answer:t,unit:"",tolerance:.2,explain:`Indice = (valeur / référence) × 100 = (${s(e)} / ${s(n)}) × 100 = ${t}.`}},taux_moyen:()=>{const n=a(2,5),e=a(10,80),t=1+e/100,r=t**(1/n),o=c((r-1)*100,1);return{prompt:`Sur ${n} ans, une grandeur augmente globalement de ${e} %.
Calcule le taux d'évolution annuel moyen (en %, arrondi 0,1).`,answer:o,unit:"%",tolerance:.2,explain:`CM global = 1 + ${e}/100 = ${c(t,3)}.
CM moyen = (CM global)^(1/${n}) = ${c(r,4)}.
Taux moyen = (CM moyen − 1) × 100 ≈ ${o} %.`}},taux_reciproque:()=>{const n=a(5,40),e=1+n/100,t=c((1/e-1)*100,1);return{prompt:`Un prix augmente de ${n} %.
Quel taux d'évolution (en %, arrondi 0,1) annulerait exactement cette hausse (retour au prix initial) ?`,answer:t,unit:"%",tolerance:.2,explain:`CM = 1 + ${n}/100 = ${c(e,3)}.
CM réciproque = 1/${c(e,3)} = ${c(1/e,4)}.
Taux réciproque = (1/CM − 1) × 100 ≈ ${t} % (c'est une baisse).`}},suite_arith:()=>{const n=a(5,50),e=a(-8,12)||3,t=a(3,12),r=n+t*e;return{prompt:`Suite arithmétique : u₀ = ${n}, raison r = ${e}.
Calcule le terme u_${t}.`,answer:r,unit:"",tolerance:.01,explain:`u_n = u₀ + n × r = ${n} + ${t} × ${e} = ${r}.`}},suite_geo_terme:()=>{const n=a(100,2e3),e=a(2,12),t=c(1+e/100,2),r=a(2,6),o=n*t**r;return{prompt:`Suite géométrique : u₀ = ${s(n)}, raison q = ${t} (soit +${e} %/an).
Calcule u_${r} (arrondi à l'unité).`,answer:c(o,0),unit:"",tolerance:1,explain:`u_n = u₀ × qⁿ = ${s(n)} × ${t}^${r} = ${s(c(o,2))} ≈ ${s(c(o,0))}.`}},image_fonction:()=>{const n=a(-4,4)||1,e=a(-8,8),t=a(-10,10),r=a(-5,5),o=n*r*r+e*r+t;return{prompt:`Soit f(x) = ${u(n,e,t)}.
Calcule f(${r}).`,answer:o,unit:"",tolerance:.01,explain:`f(${r}) = ${n}·(${r})² ${l(e)}·(${r}) ${l(t)} = ${o}.`}},discriminant:()=>{const n=a(1,4),e=a(-8,8),t=a(-6,6),r=e*e-4*n*t;return{prompt:`Soit f(x) = ${u(n,e,t)}.
Calcule le discriminant Δ = b² − 4ac.`,answer:r,unit:"",tolerance:.01,explain:`Δ = b² − 4ac = (${e})² − 4×${n}×(${t}) = ${e*e} − ${4*n*t} = ${r}.`}},sommet_abscisse:()=>{const n=a(1,5),e=a(-8,8)*2,t=a(-8,8),r=c(-e/(2*n),2);return{prompt:`Soit f(x) = ${u(n,e,t)}.
Calcule l'abscisse du sommet : α = −b/(2a) (arrondi 0,01).`,answer:r,unit:"",tolerance:.02,explain:`α = −b/(2a) = −(${e})/(2×${n}) = ${r}.`}},lecture_graphique_affine:()=>{const n=a(1,2),e=a(0,4),t=6,r=a(1,t),o=n*r+e,i=Math.max(10,n*t+e+1);return{prompt:`Lis graphiquement l'image de ${r} par la fonction f représentée ci-dessus : f(${r}) = ?`,answer:o,unit:"",tolerance:.01,figure:{type:"grid",xmax:t,ymax:i,lines:[{a:n,b:e}],markX:r},explain:`On lit sur le graphique : à l'abscisse x = ${r}, la droite atteint l'ordonnée ${o}.
(Vérification : f(x) = ${n}x ${l(e)}, donc f(${r}) = ${n}×${r} ${l(e)} = ${o}.)`}},moyenne_serie:()=>{const n=Array.from({length:5},()=>a(2,20)),e=n.reduce((r,o)=>r+o,0),t=c(e/n.length,2);return{prompt:`Série : ${n.join(" ; ")}.
Calcule la moyenne (arrondi 0,01).`,answer:t,unit:"",tolerance:.02,explain:`Moyenne = (${n.join(" + ")}) / ${n.length} = ${e} / ${n.length} = ${t}.`}},mediane_serie:()=>{const n=Array.from({length:7},()=>a(2,30)).sort((t,r)=>t-r),e=n[3];return{prompt:`Série ordonnée : ${n.join(" ; ")}.
Calcule la médiane.`,answer:e,unit:"",tolerance:.01,explain:`7 valeurs → la médiane est la 4ᵉ valeur = ${e} (autant de valeurs avant qu'après).`}},etendue_serie:()=>{const n=Array.from({length:6},()=>a(3,40)),e=Math.max(...n)-Math.min(...n);return{prompt:`Série : ${n.join(" ; ")}.
Calcule l'étendue (max − min).`,answer:e,unit:"",tolerance:.01,explain:`Étendue = max − min = ${Math.max(...n)} − ${Math.min(...n)} = ${e}.`}},ecart_interquartile:()=>{const n=Array.from({length:8},()=>a(2,30)).sort((o,i)=>o-i),e=n[1],t=n[5],r=t-e;return{prompt:`Série ordonnée de 8 valeurs : ${n.join(" ; ")}.
Calcule l'écart interquartile (Q3 − Q1).`,answer:r,unit:"",tolerance:.01,explain:`Pour n = 8 : Q1 = 2ᵉ valeur (rang n/4 = 2) = ${e} ; Q3 = 6ᵉ valeur (rang 3n/4 = 6) = ${t}.
Écart interquartile = Q3 − Q1 = ${t} − ${e} = ${r}.`}},ecart_type:()=>{const n=Array.from({length:5},()=>a(4,16)),e=n.reduce((o,i)=>o+i,0)/n.length,t=n.reduce((o,i)=>o+(i-e)**2,0)/n.length,r=c(Math.sqrt(t),2);return{prompt:`Série : ${n.join(" ; ")}.
Calcule l'écart-type σ (à la calculatrice, arrondi 0,01).`,answer:r,unit:"",tolerance:.05,explain:`Moyenne = ${c(e,2)}.
Variance = moyenne des carrés des écarts à la moyenne = ${c(t,3)}.
Écart-type σ = √variance = ${r}.`}},nuage_point_moyen:()=>{const e=Array.from({length:5},(o,i)=>({x:2*(i+1),y:a(2,10)})),t=c(e.reduce((o,i)=>o+i.y,0)/5,2),r=e.reduce((o,i)=>o+i.x,0)/5;return{prompt:`Voici un nuage de 5 points (ci-dessus).
Calcule l'ordonnée ȳ du point moyen G (moyenne des y, arrondi 0,01).`,answer:t,unit:"",tolerance:.05,figure:{type:"scatter",xmax:12,ymax:12,points:e},explain:`ȳ = (${e.map(o=>o.y).join(" + ")}) / 5 = ${t}.
Le point moyen est G(x̄ ; ȳ) = G(${r} ; ${t}).`}},proba_cond:()=>{const n=a(30,70)/100,e=c(a(10,Math.round(n*100)-5)/100,2),t=c(e/n,3);return{prompt:`P(A) = ${n} et P(A∩B) = ${e}.
Calcule P_A(B) = P(A∩B) / P(A) (arrondi 0,001).`,answer:t,unit:"",tolerance:.005,explain:`P_A(B) = P(A∩B) / P(A) = ${e} / ${n} = ${t}.`}},esperance_va:()=>{const n=[a(0,3),a(4,7),a(8,12)],e=a(2,5)/10,t=a(2,4)/10,r=c(1-e-t,2),o=c(n[0]*e+n[1]*t+n[2]*r,2);return{prompt:`Variable aléatoire X :
valeurs : ${n[0]} / ${n[1]} / ${n[2]}
probabilités : ${e} / ${t} / ${r}.
Calcule l'espérance E(X) (arrondi 0,01).`,answer:o,unit:"",tolerance:.02,explain:`E(X) = Σ xᵢ·pᵢ = ${n[0]}×${e} + ${n[1]}×${t} + ${n[2]}×${r} = ${o}.`}},variance_binomiale:()=>{const n=a(10,50),e=a(20,80)/100,t=c(n*e*(1-e),2);return{prompt:`X suit la loi binomiale B(${n} ; ${e}).
Calcule la variance V(X) = n·p·(1−p) (arrondi 0,01).`,answer:t,unit:"",tolerance:.05,explain:`V(X) = n·p·(1−p) = ${n} × ${e} × ${c(1-e,2)} = ${t}.`}},amplitude_ic:()=>{const n=a(100,2500),e=c(2/Math.sqrt(n),3);return{prompt:`Un sondage porte sur un échantillon de n = ${s(n)} personnes.
Calcule l'amplitude de l'intervalle de confiance à 95 % : 2/√n (arrondi 0,001).`,answer:e,unit:"",tolerance:.002,explain:`Amplitude = 2/√n = 2/√${s(n)} = 2/${c(Math.sqrt(n),2)} = ${e}.`}},borne_ic:()=>{const n=a(100,1e3),e=a(30,70)/100,t=c(1/Math.sqrt(n),3),r=c(e-t,3);return{prompt:`Fréquence observée f = ${e} sur n = ${s(n)}.
Intervalle de confiance : [f − 1/√n ; f + 1/√n].
Calcule la borne inférieure (arrondi 0,001).`,answer:r,unit:"",tolerance:.003,explain:`1/√n = 1/√${s(n)} = ${t}.
Borne inférieure = f − 1/√n = ${e} − ${t} = ${r}.`}},trace_somme:()=>{const n=a(4,12),e=n*(n+1)/2;return{prompt:`On exécute cet algorithme :
S = 0
Pour i allant de 1 à ${n} :
    S = S + i
Que vaut S à la fin ?`,answer:e,unit:"",tolerance:.01,explain:`On additionne 1 + 2 + … + ${n} = ${n}×(${n}+1)/2 = ${e}.`}},trace_produit:()=>{const n=a(2,6),e=a(2,4);let t=1;for(let r=0;r<n;r++)t*=e;return{prompt:`On exécute cet algorithme :
P = 1
Pour i allant de 1 à ${n} :
    P = P × ${e}
Que vaut P à la fin ?`,answer:t,unit:"",tolerance:.01,explain:`On multiplie ${n} fois par ${e} : P = ${e}^${n} = ${t}.`}},trace_compteur:()=>{const n=a(20,60),e=a(3,8),t=a(3,6),r=n-e*t;return{prompt:`On exécute cet algorithme :
N = ${n}
Répéter ${t} fois :
    N = N − ${e}
Que vaut N à la fin ?`,answer:r,unit:"",tolerance:.01,explain:`On retire ${e}, ${t} fois : N = ${n} − ${e}×${t} = ${r}.`}}};function s(n){return Number(n).toLocaleString("fr-FR")}function u(n,e,t){const r=n===1?"x²":n===-1?"−x²":n<0?`−${-n}x²`:`${n}x²`,o=e===0?"":e===1?" + x":e===-1?" − x":e>0?` + ${e}x`:` − ${-e}x`,i=t===0?"":t>0?` + ${t}`:` − ${-t}`;return`${r}${o}${i}`}function l(n){return n>=0?`+ ${n}`:`− ${-n}`}function m(n,e=5){const t=$[n];return t?Array.from({length:e},()=>t()):[]}function d(n,e=6){const t=n.filter(r=>$[r]);for(let r=t.length-1;r>0;r--){const o=Math.floor(Math.random()*(r+1));[t[r],t[o]]=[t[o],t[r]]}return t.length?Array.from({length:e},(r,o)=>$[t[o%t.length]]()):[]}export{m as a,d as m};
