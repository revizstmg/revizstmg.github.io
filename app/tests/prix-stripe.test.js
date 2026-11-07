import { test, expect, vi } from 'vitest'
import { obtenirPrixStripe, prixConforme } from '../../supabase/functions/revizstmg-paiement/prix.js'
const prix=(extra={})=>({id:'price_new',active:true,unit_amount:1999,currency:'eur',type:'recurring',billing_scheme:'per_unit',recurring:{interval:'month',interval_count:1,usage_type:'licensed'},tax_behavior:'inclusive',...extra})
test('le prix doit correspondre au montant, à la devise et à la récurrence annoncés',()=>{
 expect(prixConforme(prix(),1999)).toBe(true)
 for(const extra of [{unit_amount:1499},{currency:'usd'},{active:false},{type:'one_time'},{recurring:{interval:'year',interval_count:1,usage_type:'licensed'}},{recurring:{interval:'month',interval_count:12,usage_type:'licensed'}},{tax_behavior:'exclusive'},{transform_quantity:{divide_by:100,round:'up'}}])expect(prixConforme(prix(extra),1999),JSON.stringify(extra)).toBe(false)
})
test('un prix correct est réutilisé sans mutation Stripe',async()=>{
 const stripe=vi.fn(async()=>({data:[prix()]}))
 expect(await obtenirPrixStripe({offre:'ultimate',periode:'mensuel',stripe})).toBe('price_new')
 expect(stripe).toHaveBeenCalledTimes(1)
 expect(stripe.mock.calls[0][0]).toContain('revizstmg_ultimate_mensuel_1999')
})
test('la hausse crée un prix idempotent sans déplacer la clé historique',async()=>{
 const stripe=vi.fn(async(path,method)=>method==='POST'?prix():path.includes('_1999')?{data:[]}:{data:[{id:'price_old',product:'prod_Ultimate',unit_amount:1499,lookup_key:'revizstmg_ultimate_mensuel'}]})
 expect(await obtenirPrixStripe({offre:'ultimate',periode:'mensuel',stripe})).toBe('price_new')
 const [path,method,body,headers]=stripe.mock.calls.find(c=>c[1]==='POST')
 expect(path).toBe('/v1/prices');expect(method).toBe('POST')
 expect(body.get('unit_amount')).toBe('1999');expect(body.get('currency')).toBe('eur')
 expect(body.get('product')).toBe('prod_Ultimate');expect(body.get('recurring[interval]')).toBe('month')
 expect(body.get('tax_behavior')).toBe('inclusive');expect(body.has('transfer_lookup_key')).toBe(false)
 expect(headers['Idempotency-Key']).toBe('revizstmg-prix-ultimate-mensuel-eur-1999')
 expect(stripe.mock.calls.filter(c=>c[1]&&c[1]!=='POST')).toHaveLength(0)
})
test('un catalogue incohérent bloque le paiement plutôt que facturer un autre montant',async()=>{
 const stripe=vi.fn(async()=>({data:[prix({unit_amount:1499})]}))
 await expect(obtenirPrixStripe({offre:'ultimate',periode:'mensuel',stripe})).rejects.toThrow('prix_incoherent')
 expect(stripe).toHaveBeenCalledTimes(1)
})
test('les annuels et Go ne sont pas achetables dans le checkout individuel',async()=>{
 const stripe=vi.fn()
 for(const [offre,periode] of [['ultimate','annuel'],['premium','annuel'],['go','mensuel']])await expect(obtenirPrixStripe({offre,periode,stripe})).rejects.toThrow('offre_inconnue')
 expect(stripe).not.toHaveBeenCalled()
})
test('un produit absent ou une création incorrecte ne peut pas ouvrir Checkout',async()=>{
 await expect(obtenirPrixStripe({offre:'ultimate',periode:'mensuel',stripe:async()=>({data:[]})})).rejects.toThrow('prix_introuvable')
 const stripe=async(path,method)=>method==='POST'?prix({unit_amount:1499}):path.includes('_1999')?{data:[]}:{data:[{product:'prod_Ultimate'}]}
 await expect(obtenirPrixStripe({offre:'ultimate',periode:'mensuel',stripe})).rejects.toThrow('prix_incoherent')
})
