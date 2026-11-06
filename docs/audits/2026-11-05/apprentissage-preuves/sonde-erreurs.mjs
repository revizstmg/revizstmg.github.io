import {majCarnet} from '../src/store.jsx'
const q={q:'Quelle est la bonne définition de « Structure fonctionnelle » ?',choices:['Réponse A','Réponse B'],answer:0}
const first=majCarnet([],{themeId:'mgmt-t1',type:'qcm',ratees:[q]},'2026-11-05')
const second=majCarnet(first,{themeId:'mgmt-t2',type:'qcm',ratees:[q]},'2026-11-05')
const third=majCarnet(second,{themeId:'mgmt-t1',type:'qcm',reussies:[q]},'2026-11-06')
console.log(JSON.stringify({first,afterSecondError:second,afterSuccessInFirst:third},null,2))
