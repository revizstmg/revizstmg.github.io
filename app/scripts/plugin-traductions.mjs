// Traduit les littéraux publics du JSX à la compilation, sans observer/modifier
// le DOM de React et sans transmettre les variables (noms, saisies, messages).
import { dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
const publicModule = fileURLToPath(new URL('../src/localisation/PublicText.jsx', import.meta.url))
const attrs = new Set(['title', 'label', 'placeholder', 'aria-label', 'aria-description', 'alt'])
const componentAttrs = new Set([...attrs, 'titre', 'libelle', 'description', 'sub', 'sous'])
const ignored = new Set(['code', 'pre', 'script', 'style', 'textarea', 'svg', 'math', 'TextePublic', 'ElementPublic'])
export function cleanJsxText(value) {
  const lines = value.split(/\r\n|\n|\r/)
  let last = 0
  lines.forEach((line, i) => { if (/[^ \t]/.test(line)) last = i })
  return lines.reduce((out, line, i) => {
    let text = line.replace(/\t/g, ' ')
    if (i) text = text.replace(/^ +/, '')
    if (i !== lines.length - 1) text = text.replace(/ +$/, '')
    return out + (text ? text + (i !== last ? ' ' : '') : '')
  }, '')
}
const worthTranslating = (s) => /[\p{L}]{2}/u.test(s) && !/^(RévizSTMG|Réviz|Matys DONAT|Gabriel MERLIN|STMG|XP|SQL|PDF|PESTEL|SWOT|Gemini|Claude|Google|Apple|MyMemory|Premium|Ultimate|OK|EN|FR|ES|IT|AR)$/i.test(s.trim()) && !/^(https?:|mailto:)/i.test(s.trim()) && !/[\w.+-]+@[\w.-]+\.\w+/u.test(s)
export default function publicTranslations({ types: t }) {
  const model = (expr) => {
    if (t.isStringLiteral(expr) && worthTranslating(expr.value)) return { text: expr.value, values: [] }
    if (t.isTemplateLiteral(expr)) {
      const text = expr.quasis.map((q, i) => (q.value.cooked || '') + (i < expr.expressions.length ? `{v${i}}` : '')).join('')
      if (worthTranslating(expr.quasis.map((q) => q.value.cooked || '').join(' '))) return { text, values: expr.expressions }
    }
    return null
  }
  const allowed = (path, state) => !state.skipI18n && !path.findParent((p) => p.isJSXElement() && (
    (ignored.has(p.node.openingElement.name.name) && !(p.node.openingElement.name.name === 'textarea' && path.isJSXOpeningElement() && p === path.parentPath)) || p.node.openingElement.name.name === state.textId?.name ||
    p.node.openingElement.attributes.some((a) => t.isJSXAttribute(a) && ((a.name.name === 'translate' && a.value?.value === 'no') || a.name.name === 'data-no-translate'))
  ))
  const element = (m, state) => {
    state.usedI18n = true
    return t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(state.textId.name), [
      t.jsxAttribute(t.jsxIdentifier('text'), t.jsxExpressionContainer(t.stringLiteral(m.text))),
      ...(m.values.length ? [t.jsxAttribute(t.jsxIdentifier('values'), t.jsxExpressionContainer(t.arrayExpression(m.values)))] : []),
    ], true), null, [], true)
  }
  const expression = (node, state) => {
    const m = model(node)
    if (m) return element(m, state)
    if (t.isLogicalExpression(node)) {
      const right = expression(node.right, state)
      if (right !== node.right) return t.logicalExpression(node.operator, node.left, right)
    }
    if (t.isConditionalExpression(node)) {
      const yes = expression(node.consequent, state), no = expression(node.alternate, state)
      if (yes !== node.consequent || no !== node.alternate) return t.conditionalExpression(node.test, yes, no)
    }
    return node
  }
  return { name: 'revizstmg-public-translations', visitor: {
    Program: {
      enter(path, state) {
        const file = state.file.opts.filename || ''
        state.skipI18n = !file.includes('/src/') || file.includes('/localisation/') || !file.endsWith('.jsx')
        state.textId = path.scope.generateUidIdentifier('TextePublic')
        state.elementId = path.scope.generateUidIdentifier('ElementPublic')
        state.usedI18n = false
      },
      exit(path, state) {
        if (!state.usedI18n) return
        const target = publicModule
        let source = relative(dirname(state.file.opts.filename), target).replaceAll('\\', '/')
        if (!source.startsWith('.')) source = './' + source
        path.unshiftContainer('body', t.importDeclaration([
          t.importSpecifier(state.textId, t.identifier('TextePublic')),
          t.importSpecifier(state.elementId, t.identifier('ElementPublic')),
        ], t.stringLiteral(source)))
      },
    },
    JSXText(path, state) {
      if (!allowed(path, state)) return
      const text = cleanJsxText(path.node.value)
      if (worthTranslating(text)) { path.replaceWith(element({ text, values: [] }, state)); path.skip() }
    },
    JSXExpressionContainer(path, state) {
      if (!allowed(path, state) || path.parentPath.isJSXAttribute()) return
      const next = expression(path.node.expression, state)
      if (next !== path.node.expression) { path.node.expression = next }
    },
    JSXOpeningElement(path, state) {
      if (!allowed(path, state) || !t.isJSXIdentifier(path.node.name) || (ignored.has(path.node.name.name) && path.node.name.name !== 'textarea')) return
      const intrinsic = /^[a-z]/.test(path.node.name.name)
      const translatedProps = intrinsic ? attrs : componentAttrs
      const entries = []
      path.node.attributes.forEach((a) => {
        if (!t.isJSXAttribute(a) || !translatedProps.has(a.name.name) || !a.value) return
        const m = model(t.isJSXExpressionContainer(a.value) ? a.value.expression : a.value)
        if (m) entries.push(t.objectProperty(t.stringLiteral(a.name.name), t.objectExpression([
          t.objectProperty(t.identifier('text'), t.stringLiteral(m.text)),
          t.objectProperty(t.identifier('values'), t.arrayExpression(m.values)),
        ])))
      })
      if (!entries.length) return
      state.usedI18n = true
      const oldName = path.node.name.name
      path.node.name = t.jsxIdentifier(state.elementId.name)
      if (path.parentPath.node.closingElement) path.parentPath.node.closingElement.name = t.jsxIdentifier(state.elementId.name)
      path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier('as'), intrinsic ? t.stringLiteral(oldName) : t.jsxExpressionContainer(t.identifier(oldName))), t.jsxAttribute(t.jsxIdentifier('__translations'), t.jsxExpressionContainer(t.objectExpression(entries))))
    },
  } }
}
