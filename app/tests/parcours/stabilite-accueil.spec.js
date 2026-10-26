import {test,expect} from '@playwright/test'

// Visiteur sans compte, réseau et processeur ralentis comme sur un mobile d'entrée de gamme : la page
// chargée après coup ne doit pas déplacer le pied de page dans la zone visible (« bon » : moins de 0,1).
for(const [nom,route] of [['accueil','./'],['accueil de l’application','./#/accueil']])
test(`${nom} : le chargement ne décale pas la page`,async({page,browserName})=>{
 test.skip(browserName!=='chromium','mesure du décalage de mise en page disponible dans Chromium')
 await page.route('**/*',r=>{const u=new URL(r.request().url());return ['localhost','127.0.0.1'].includes(u.hostname)||['data:','blob:'].includes(u.protocol)?r.continue():r.abort('blockedbyclient')})
 const cdp=await page.context().newCDPSession(page)
 await cdp.send('Network.enable')
 await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200*1024,uploadThroughput:90*1024})
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4})
 await page.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true})})
 await page.goto(route,{waitUntil:'load'})
 await expect(page.locator('footer')).toBeAttached({timeout:30000})
 await page.waitForTimeout(2500)
 expect(await page.evaluate(()=>window.__cls)).toBeLessThan(0.1)
})
