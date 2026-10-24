let claimed=false
export function claimSessionMotion(){if(claimed)return false;claimed=true;try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('revizstmg-motion-used'))return false;sessionStorage.setItem('revizstmg-motion-used','1');return true}catch{return false}}
