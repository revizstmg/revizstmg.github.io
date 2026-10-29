import {chromium} from '/workspace/revizstmg.github.io/app/node_modules/playwright/index.mjs'
const browser=await chromium.launch()
const page=await browser.newPage({viewport:{width:390,height:844}})
await page.route('**/*',r=>new URL(r.request().url()).hostname==='localhost'?r.continue():r.fulfill({contentType:'application/json',body:'[]'}))
await page.goto('http://localhost:5192/')
const result=await page.evaluate(async()=>{
 const parent=await import('/src/parent.js'),friends=await import('/src/friends.js'),auth=await import('/src/auth.js')
 const writes=[],childRows=[],friendRows=[]
 const nativeFetch=window.fetch
 window.fetch=async(url,opts={})=>{
  const p=new URL(url).pathname
  if(p.endsWith('/child_stats')){const row=JSON.parse(opts.body)[0];writes.push({kind:'parent',...row});childRows.push(row);return new Response(JSON.stringify([row]),{status:200})}
  if(p.endsWith('/friend_user')){const row=JSON.parse(opts.body)[0];writes.push({kind:'friend',...row});friendRows.push(row);return new Response(JSON.stringify([row]),{status:200})}
  if(p.endsWith('/rpc/revizstmg_stats_enfant')){const code=JSON.parse(opts.body).p_code;return new Response(JSON.stringify(childRows.filter(x=>x.code===code).slice(-1)),{status:200})}
  if(p.endsWith('/rpc/revizstmg_trouver_ami')){const code=JSON.parse(opts.body).p_code;return new Response(JSON.stringify(friendRows.filter(x=>x.code===code).slice(0,1)),{status:200})}
  if(p.endsWith('/logout'))return new Response('{}',{status:200})
  return nativeFetch(url,opts)
 }
 localStorage.removeItem('stmg_parent_code');localStorage.removeItem('stmg_friend_code')
 const login=(id)=>localStorage.setItem('stmg_session',JSON.stringify({token:'audit-token-'+id,refresh:'audit-refresh',expires_at:9999999999,user:{id,email:id+'@example.invalid'}}))
 login('audit-account-A');const parentA=parent.parentCode(),friendA=friends.friendCode()
 await parent.publishChildStats({name:'Enfant audit A',xp:10});await friends.upsertMe({name:'Élève audit A',xp:10})
 auth.signOut();login('audit-account-B');const parentB=parent.parentCode(),friendB=friends.friendCode()
 await parent.publishChildStats({name:'Enfant audit B',xp:20});await friends.upsertMe({name:'Élève audit B',xp:20})
 const childFromCodeA=await parent.fetchChildByCode(parentA),friendFromCodeB=await friends.findByCode(friendB)
 window.fetch=nativeFetch
 return {parentCodesEqual:parentA===parentB,friendCodesEqual:friendA===friendB,childFromCodeA:childFromCodeA.name,friendFromCodeB:friendFromCodeB.name,writes:writes.map(({kind,device_id,name,code})=>({kind,device_id,name,code}))}
})
console.log(JSON.stringify(result,null,2))
await browser.close()
