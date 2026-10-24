import {Link,useLocation} from 'react-router-dom'
import {useLang,useT} from '../i18n.js'
import {classMessages} from '../i18n/classes.js'
import './DesktopQuickLinks.css'

const links=[['/classe','myClass','🧑‍🏫'],['/amis','friends','🤝'],['/boutique','shop','🛍️'],['/classement','leaderboard','🏆']]
export default function DesktopQuickLinks(){
 const t=useT(),lang=useLang(),{pathname}=useLocation()
 return <nav className="desktop-quick-links no-print" aria-label={(classMessages[lang]||classMessages.fr).community}>
  <div>{links.map(([to,label,icon])=><Link key={to} to={to} aria-current={pathname===to?'page':undefined}><span aria-hidden>{icon}</span><span>{t(label)}</span><span className="desktop-link-dot" aria-hidden/></Link>)}</div>
 </nav>
}
