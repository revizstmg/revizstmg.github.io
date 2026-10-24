import {test,expect,vi} from 'vitest'
import {transformSync} from '@babel/core'
import {renderToStaticMarkup} from 'react-dom/server'
import {createElement} from 'react'
import postcss from 'postcss'
import presentation from '../scripts/plugin-presentation.mjs'
import translations from '../scripts/plugin-traductions.mjs'
import surfaces from '../scripts/plugin-surfaces.mjs'
import {flatBackground,flatStyle,cleanCopy,plainCopy} from '../src/presentation/style.js'
import {visualCopy} from '../src/presentation/Visual.jsx'
test('les aplats gardent les couleurs et les variables CSS imbriquées',()=>{
 expect(flatBackground('linear-gradient(90deg,transparent,#c8a24e,transparent)')).toBe('#c8a24e')
 expect(flatBackground('radial-gradient(circle,red,transparent), var(--c-bg)')).toBe('var(--c-bg)')
 expect(flatBackground('linear-gradient(140deg, color-mix(in srgb, var(--c-accent) 16%, #17130d) 0%, #221d15 55%)')).toBe('color-mix(in srgb, var(--c-accent) 16%, #17130d)')
 expect(flatBackground('#203e36')).toBe('#203e36')
})
test('les styles inline ne modifient pas les objets ni les couleurs existantes',()=>{
 const style={backgroundImage:'linear-gradient(#123456,#fff)',color:'white'}
 expect(flatStyle(style)).toEqual({backgroundImage:'none',backgroundColor:'#123456',color:'white'})
 expect(style.backgroundImage).toContain('gradient')
 expect(flatStyle({backgroundColor:'red'})).toEqual({backgroundColor:'red'})
})
test('les déclarations CSS de toutes les pages deviennent des aplats',async()=>{
 const result=await postcss([surfaces()]).process('.hero{background:linear-gradient(90deg,#123456,#456789)}',{from:undefined})
 expect(result.css).not.toContain('gradient(');expect(result.css).toContain('#123456')
})
test('le texte rendu conserve les émojis d’origine et garde le texte, les nombres et les nœuds',()=>{
 const html=renderToStaticMarkup(createElement('div',null,visualCopy('📖 Cours — 12 / 20')))
 expect(html).not.toContain('<svg');expect(html).toContain('📖 Cours - 12 / 20')
 expect(plainCopy('📖 Cours — titre')).toBe('📖 Cours - titre')
 const node=createElement('b',null,'Nom personnel');expect(visualCopy(node)).toBe(node)
 expect(visualCopy(0)).toBe(0);expect(visualCopy(null)).toBeNull()
 expect(cleanCopy('1–5')).toBe('1-5');expect(visualCopy('© 2026 RévizSTMG')).toBe('© 2026 RévizSTMG');expect(visualCopy('Marque ® ™')).toBe('Marque ® ™')
})
test('les badges IA disparaissent mais les explications de provenance restent',()=>{
 expect(visualCopy('✨ IA')).toBeNull();expect(visualCopy('AI')).toBeNull();expect(visualCopy('🤖 IA')).toBeNull()
 expect(visualCopy('Ce texte est généré par IA.')).toBe('Ce texte est généré par IA.')
})
test('la compilation conserve les actions, champs, données et SVG',()=>{
 const source='const view=<button onClick={save} aria-label="📖 Cours — titre" style={colors}><span>{label}</span>📖<input value={draft}/><svg><path d={path}/></svg></button>'
 const {code}=transformSync(source,{filename:'/app/src/components/Test.jsx',configFile:false,babelrc:false,plugins:[translations,presentation],parserOpts:{plugins:['jsx']}})
 expect(code).toContain('onClick={save}');expect(code).toContain('value={draft}');expect(code).toContain('d={path}')
 expect(code).toContain('flatStyle');expect(code).toContain('visualCopy');expect(code).toContain('plainCopy')
})
test('une animation au plus peut être réclamée dans la même session',async()=>{
 vi.resetModules();const items=new Map();vi.stubGlobal('window',{matchMedia:()=>({matches:false})});vi.stubGlobal('sessionStorage',{getItem:k=>items.get(k),setItem:(k,v)=>items.set(k,v)})
 const first=await import('../src/presentation/session.js');expect(first.claimSessionMotion()).toBe(true);expect(first.claimSessionMotion()).toBe(false)
 vi.resetModules();const reload=await import('../src/presentation/session.js');expect(reload.claimSessionMotion()).toBe(false);vi.unstubAllGlobals()
})
