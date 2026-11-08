import {test,expect} from 'vitest'
import {encodeDeck,decodeDeck} from '../src/deckShare.js'
test('la langue de lecture accompagne le paquet partagé sans modifier ses cartes',()=>{
 const deck={title:'English',language:'en',cards:[{front:'Hello',back:'Bonjour'}]}
 expect(decodeDeck(encodeDeck(deck))).toEqual(deck)
 const legacy={title:'Français',cards:deck.cards};expect(decodeDeck(encodeDeck(legacy))).toEqual(legacy)
})
