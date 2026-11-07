// Lexical comparison for introductory SELECT exercises. Quoted values retain
// their spelling; aliases are accepted without altering string literals.
export function sqlNorm(value) {
  const tokens = String(value).match(/'(?:''|[^'])*'|"(?:""|[^"])*"|[\p{L}_][\p{L}\p{N}_]*|\d+(?:\.\d+)?|<=|>=|<>|!=|[(),.*=<>;]/gu) || []
  const rest = String(value).replace(/'(?:''|[^'])*'|"(?:""|[^"])*"|[\p{L}_][\p{L}\p{N}_]*|\d+(?:\.\d+)?|<=|>=|<>|!=|[(),.*=<>;]/gu, '').trim()
  if (rest) return null
  let ts = tokens.map(t => /^["']/.test(t) ? t : t.toLowerCase())
  if (ts.at(-1) === ';') ts.pop()
  if (ts.includes(';')) return null
  const from = ts.indexOf('from')
  const reserved = new Set(['where','order','group','having','limit','join','inner','left','right'])
  if (from >= 0) {
    const at = from + 2
    const explicit = ts[at] === 'as'
    const alias = ts[at + (explicit ? 1 : 0)]
    if (alias && /^[a-z_]\w*$/.test(alias) && !reserved.has(alias)) {
      ts.splice(at, explicit ? 2 : 1)
      ts = ts.filter((t,i,a) => !(t === alias && a[i+1] === '.') && !(t === '.' && a[i-1] === alias))
    }
  }
  return ts.join(' ')
}
export function sqlMatches(input, answer, alternatives = []) {
  const n = sqlNorm(input)
  return !!n && [answer,...alternatives].some(a => sqlNorm(a) === n)
}
