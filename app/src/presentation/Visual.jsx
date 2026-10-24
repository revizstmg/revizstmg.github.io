import {createElement} from 'react'
import {cleanCopy,emojiPattern} from './style.js'
const paths={
 fox:'m3 3 7 4h4l7-4-2 13-7 6-7-6ZM3 9l6 5m12-5-6 5m-6 3 3 2 3-2M8 10h.1m8 0h.1',
 panda:'M6 7a3 3 0 1 1 2-5m8 5a3 3 0 1 0-2-5M12 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM6 10a2 3 0 1 0 4 0 2 3 0 1 0-4 0m8 0a2 3 0 1 0 4 0 2 3 0 1 0-4 0M10 17l2 1 2-1',
 owl:'M3 3l4 3h10l4-3v11a9 9 0 0 1-18 0ZM4 11a4 4 0 1 0 8 0 4 4 0 1 0-8 0m8 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0M10 17l2 3 2-3M8 11h.1m8 0h.1',
 dragon:'m6 22 1-8-5-4 8 1 1-9 5 5 5-2-1 8-7 2-2 7ZM13 8h.1M15 12h4',
 lion:'m12 1 4 3 4 1 1 5 2 3-3 4-1 4-5 1-4-1-4-3-3-4 1-5 3-4ZM12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM9 10h.1m6 0h.1M10 14l2 2 2-2',
 bird:'M2 14 9 3l3 5 8 1 2 5-6-1-4 9-3-8Z',
 turtle:'M6 8a7 6 0 1 0 0 12 7 6 0 1 0 0-12ZM18 10a3 3 0 1 1 0 6M5 8 3 5m2 14-2 3m11-14 2-3m-2 14 2 3M6 12h8m-4-4v12',
 shark:'M2 17c6-9 12-10 20-5l-5 3 5 4c-7 4-14 2-20-2Zm6-4 2-10 5 7m2 3h.1',

 alert:'m12 2 10 19H2ZM12 8v6m0 3h.1',info:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v6m0-10h.1',access:'M12 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 9h18M12 7v7m0 0-5 8m5-8 5 8',wave:'M2 8c4-7 6 7 10 0s6 7 10 0M2 16c4-7 6 7 10 0s6 7 10 0',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 2h6l1 4 4 1 2 5-2 5-4 1-1 4H9l-1-4-4-1-2-5 2-5 4-1Z',

 home:'M3 11 12 3l9 8M5 10v11h5v-7h4v7h5V10',
 book:'M3 4h7l2 2 2-2h7v16h-7l-2 1-2-1H3ZM12 6v15',
 people:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 7m2 3a6 6 0 0 1 3 5v2',
 person:'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 22v-2a9 9 0 0 1 18 0v2',
 trophy:'M8 3h8v7a4 4 0 0 1-8 0ZM8 5H3v3a5 5 0 0 0 5 5m8-8h5v3a5 5 0 0 1-5 5M12 14v7m-5 0h10',
 bag:'M5 7h14l2 14H3ZM8 8V6a4 4 0 0 1 8 0v2',
 brain:'M12 4v16m0-14C8 0 4 5 5 8c-4 2-3 7 0 8-1 5 5 7 7 3m0-13c4-6 8-1 7 2 4 2 3 7 0 8 1 5-5 7-7 3',
 file:'M6 2h8l5 5v15H6ZM14 2v6h5M9 12h7m-7 4h7',
 clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v6l4 2',
 star:'m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z',
 globe:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18',
 flame:'M13 2c1 5 6 7 6 12a7 7 0 0 1-14 0c0-3 2-5 4-7 0 4 1 5 3 5 2-3 1-6 1-10Z',
 message:'M3 3h18v14H9l-6 4ZM7 8h10M7 12h7',
 check:'m4 12 5 5L20 6', cross:'M5 5l14 14M5 19 19 5',
 target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 11v2',
 chart:'M3 3v18h18M7 17v-5m5 5V7m5 10V4',
 calculator:'M5 2h14v20H5ZM8 5h8v4H8Zm0 8h1m3 0h1m3 0h1M8 17h1m3 0h1m3 0h1',
 cards:'M6 3h15v16H6ZM3 7v15h14',
 calendar:'M3 5h18v16H3ZM7 2v6m10-6v6M3 10h18m-13 5h1m4 0h1m4 0h1',
 shield:'m12 2 9 4v6c0 5-5 8-9 10-4-2-9-5-9-10V6Z',
 key:'M8 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm4-2 9 9m-5-5 3-3m0 6 3-3',
 palette:'M12 2a10 10 0 1 0 0 20c3 0 1-4 3-5h3c7-2 3-15-6-15ZM7 7h.1M12 5h.1M17 8h.1M5 12h.1',
 sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2',
 moon:'M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z',
 light:'M8 17v-2a7 7 0 1 1 8 0v2Zm1 3h6m-5 3h4',
 search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 7 7',
 pen:'m4 16 12-12 4 4L8 20l-6 2ZM14 6l4 4',
 arrow:'M4 12h16m-6-6 6 6-6 6', refresh:'M20 8a9 9 0 0 0-16-2L2 9m0-6v6h6m-4 7a9 9 0 0 0 16 2l2-3m0 6v-6h-6',
 folder:'M2 5h8l2 3h10v13H2Z', bell:'M5 17V9a7 7 0 0 1 14 0v8l3 3H2Zm5 6h4',
 bolt:'m13 2-9 12h7l-1 8 10-13h-7Z',
 award:'M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM7 14 5 22l7-3 7 3-2-8',
 plant:'M12 22V10M12 14C3 15 2 8 3 4c7 0 10 4 9 10Zm0 3c0-8 3-11 9-11 0 7-3 11-9 11',
 snow:'M12 2v20M3 7l18 10M3 17 21 7M9 4l3 3 3-3M9 20l3-3 3 3',
 heart:'M12 21 3 12C-3 3 8-2 12 5c4-7 15-2 9 7Z',
 crown:'M3 5l5 5 4-8 4 8 5-5-2 16H5ZM5 17h14',
 animal:'M4 3l5 4h6l5-4v12a8 8 0 0 1-16 0ZM8 12h.1M16 12h.1M10 17l2 1 2-1',
 rocket:'M8 16C7 9 13 3 21 3c0 8-6 14-13 13ZM8 10H3v9l5-3m6 0v5h-9l3-5M14 7h3v3',
 lock:'M5 10h14v12H5ZM8 10V6a4 4 0 0 1 8 0v4',
 play:'m7 3 14 9-14 9Z', headphones:'M3 14v-2a9 9 0 0 1 18 0v2M3 12h4v9H3Zm14 0h4v9h-4',
 hand:'M5 13V9a2 2 0 0 1 4 0m0 4V4a2 2 0 0 1 4 0v9m0-6a2 2 0 0 1 4 0v6m0-3a2 2 0 0 1 4 0v7l-5 5H9l-7-8a2 2 0 0 1 3-1Z',
 briefcase:'M2 7h20v14H2ZM8 7V3h8v4M2 13h20m-12 0v3h4v-3',
 flag:'M4 22V2l9 3 7-2v12l-7 2-9-3',
}
const groups={alert:'⚠️❗❓❕❔',info:'ℹ️',access:'♿',wave:'🌊',settings:'⚙️🛠️🔧',home:'🏠🏡',book:'📖📚📘📗📕📙',people:'♧👥👨‍👩‍👧🤝🧑‍🏫👩‍🏫👨‍🏫',person:'👤👩👨🎓👩‍🎓👨‍🎓',trophy:'🏆🥇🥈🥉',bag:'🛍️🛒🎁💰💵💶',brain:'🧠🤖',file:'📝📄📃📑📋🧾',clock:'⏱️⏰⌛⏳🕐🕒🕓',star:'★☆✦◈◉☷⭐🌟✨✦💫',globe:'🌍🌎🌏🌐🗺️',flame:'🔥',message:'💬🗣️📣📢',check:'✅✔️☑️',cross:'❌✖️',target:'🎯',chart:'📈📊📉',calculator:'📐🧮➗➕➖✖',cards:'🃏🎴',calendar:'📅🗓️',shield:'🛡️⚖️',key:'🔑🗝️',palette:'🎨🌈',sun:'☀️🌞',moon:'🌙🌌🌃',light:'💡',search:'🔍🔎',pen:'✍️✏️🖊️',arrow:'↗️➡️🚪',refresh:'🔁🔄',folder:'📁📂🗂️',bell:'🔔',bolt:'⚡',award:'🏅🎖️',plant:'🌿🌲🌳🌱🌷🌹🌸🌺🌻🌼🪸',snow:'🧊❄️',heart:'❤️💜💚💙💛🙂😊😎',crown:'👑',animal:'🐱🐺',fox:'🦊',panda:'🐼',owl:'🦉',dragon:'🐉',lion:'🦁',bird:'🦅🐧',turtle:'🐢',shark:'🦈',rocket:'🚀',lock:'🔒🔐🔓',play:'▶️🎬📺',headphones:'🎧🔊🎵',hand:'✋👍👋💪',briefcase:'💼',flag:'🚩🏁'}
const lookup=new Map(Object.entries(groups).flatMap(([name,glyphs])=>[...glyphs.matchAll(emojiPattern())].map(match=>[match[0].replace(/\uFE0F/g,''),name])))
export function UiSymbol({glyph,decorative=false}){const key=glyph.replace(/\uFE0F/g,''),path=paths[lookup.get(key)]||(/\p{Regional_Indicator}/u.test(key)?paths.globe:paths.star);return createElement('svg',{className:'ui-symbol',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round',...(decorative?{'aria-hidden':true}:{role:'img','aria-label':glyph}),'data-ui-icon':lookup.get(key)||'star'},createElement('path',{d:path}))}
export function visualCopy(value){
 if(Array.isArray(value))return value.map(visualCopy)
 if(typeof value!=='string')return value
 const text=cleanCopy(value)
 if(/^(?:IA|AI)$/.test(text.replace(emojiPattern(),'').trim()))return null
 const matches=[...text.matchAll(emojiPattern())];if(!matches.length)return text
 const decorative=text.replace(emojiPattern(),'').trim().length>0
 const out=[];let from=0;for(const match of matches){if(match.index>from)out.push(text.slice(from,match.index));out.push(createElement(UiSymbol,{key:match.index,glyph:match[0],decorative}));from=match.index+match[0].length}if(from<text.length)out.push(text.slice(from));return out
}
