import {flatBackground} from '../src/presentation/style.js'
export default function surfaces(){return {postcssPlugin:'revizstmg-surfaces',Declaration(decl){if(decl.value.includes('gradient(')&&['background','background-image','border-image'].includes(decl.prop)){const value=flatBackground(decl.value);if(decl.prop==='background-image'){decl.prop='background';decl.value=value}else if(decl.prop==='border-image')decl.value='none';else decl.value=value}}}}
surfaces.postcss=true
