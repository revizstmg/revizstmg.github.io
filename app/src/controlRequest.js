// Bornage de toute la demande, y compris Auth et la lecture du JSON.
// AbortController seul ne débloque pas une promesse qui ignore son signal.
export const CONTROL_WAIT_MS = 75000
export async function withControlDeadline(operation, controller, milliseconds = CONTROL_WAIT_MS) {
 const {signal}=controller
 let timer, onAbort
 const stopped=new Promise((_,reject)=>{
  onAbort=()=>reject(signal.reason instanceof Error ? signal.reason : Error('cancelled'))
  if(signal.aborted)return onAbort()
  signal.addEventListener('abort',onAbort,{once:true})
  timer=setTimeout(()=>controller.abort(Error('timeout')),milliseconds)
 })
 try {
  return await Promise.race([stopped,Promise.resolve().then(()=>{
   signal.throwIfAborted()
   return operation(signal)
  })])
 } finally {clearTimeout(timer);signal.removeEventListener('abort',onAbort)}
}
