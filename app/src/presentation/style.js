// Sépare une liste CSS en respectant les parenthèses des variables/couleurs.
export function cssParts(value){let depth=0,start=0,out=[];for(let i=0;i<value.length;i++){if(value[i]==='(')depth++;if(value[i]===')')depth--;if(value[i]===','&&depth===0){out.push(value.slice(start,i).trim());start=i+1}}out.push(value.slice(start).trim());return out}
export function flatBackground(value){
 if(typeof value!=='string'||!/(?:linear|radial|conic)-gradient\(/i.test(value))return value
 const layers=cssParts(value),fallback=layers.find(layer=>!layer.includes('gradient('))
 if(fallback)return fallback
 const layer=layers[0],inside=layer.slice(layer.indexOf('(')+1,layer.lastIndexOf(')'))
 const stops=cssParts(inside)
 for(const stop of stops){
  const match=/^(#[\da-f]{3,8}\b|(?:rgba?|hsla?|var|color-mix)\(|(?:white|black|red|green|blue)\b)/i.exec(stop)
  if(!match)continue
  if(!match[0].endsWith('('))return match[0]
  let depth=0;for(let i=0;i<stop.length;i++){if(stop[i]==='(')depth++;if(stop[i]===')'&&--depth===0)return stop.slice(0,i+1)}
 }
 return 'transparent'
}
export function flatStyle(style){if(!style||typeof style!=='object')return style;let next=style;for(const key of ['background','backgroundImage'])if(typeof style[key]==='string'&&style[key].includes('gradient(')){if(next===style)next={...style};const color=flatBackground(style[key]);if(key==='backgroundImage'){next.backgroundImage='none';next.backgroundColor=style.backgroundColor||color}else next[key]=color}return next}
export const emojiPattern=()=>/(?:[♧◈◉✦☷★☆]|[0-9#*]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|(?![©®™])\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?(?:\u200D(?![©®™])\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier})?)*)/gu
export function cleanCopy(value){return typeof value==='string'?value.replace(/[—–]/g,'-').replace(/([©®™])\uFE0F/g,'$1'):value}
export function plainCopy(value){return typeof value==='string'?cleanCopy(value).trim():value}
