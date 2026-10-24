import {cleanCopy,emojiPattern} from './style.js'
// Les émojis d’origine sont conservés à la demande du propriétaire.
// On garde les règles sur les tirets et les badges promotionnels.
export function visualCopy(value){
 if(Array.isArray(value))return value.map(visualCopy)
 if(typeof value!=='string')return value
 const text=cleanCopy(value)
 return /^(?:IA|AI)$/.test(text.replace(emojiPattern(),'').trim())?null:text
}
