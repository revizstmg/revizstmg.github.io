// Boutique virtuelle (pièces gagnées en révisant). Contenu : content/commun/boutique.json.
import { commun } from '../content/contenu.js'

export const SHOP_ITEMS = commun('boutique')
export const shopById = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]))
