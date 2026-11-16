import {preparer as original} from '/workspace/work/fix-economie-audits/app/tests/parcours/eleve.js'
export {etatEleve,attendreAccueil,etat} from '/workspace/work/fix-economie-audits/app/tests/parcours/eleve.js'
export async function preparer(page,...args){const errors=await original(page,...args);await page.route('https://revizstmg.github.io/**',route=>route.continue());return errors}
