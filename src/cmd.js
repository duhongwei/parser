/**
 * parse cmd module
 *
 */
const acorn = require('acorn')
const walk = require('acorn-walk')

module.exports = class {
  constructor(code) {
    this.ast = acorn.parse(code)
    this.code = code
    this.delPosition = []
  }
  parse() {
    const importInfo = this._parseImport()
    let exportInfo = this._parseExport()
  
    let code = this._delCode()
    code = `var exports={};${code}`
    return {
      importInfo,
      exportInfo,
      code
    }
  }
  //================= private ====================
  _delCode() {
    let code = ''
    let start = 0
    let end = 0

    const delPosition = this.delPosition.sort((a, b) => {

      if (a[0] > b[1]) {
        return 1
      }
      else {
        return -1
      }
    })
    for (const item of delPosition) {
      end = item[0]
      code += this.code.slice(start, end)
      start = item[1]
      if (item[2]) {
        code += item[2]
      }

    }

    code += this.code.slice(start)
    return code

  }
  _parseImport() {
    var importInfo = []
    var that = this
    walk.simple(this.ast, {
      VariableDeclaration(node) {
        let { token, file } = that._parseDeclarations(node.declarations)
        if (!file) {
          return
        }
        importInfo.push({
          type: 'cjs',
          file,
          token
        })
        that.delPosition.push([node.start, node.end])
      }
    })
    return importInfo
  }
  _parseExport() {
    const that = this
    walk.simple(this.ast, {
      ExpressionStatement(node) {

        if (node.expression.type === 'AssignmentExpression' && node.expression.left.type === 'MemberExpression' && node.expression.left.object && node.expression.left.object.type == 'Identifier') {
          const name = node.expression.left.object.name
          if (name === 'module') {
            let delStart = node.expression.left.object.start
            let delEnd = node.expression.left.object.end + 1
            that.delPosition.push([delStart, delEnd])
          }
        }
      }
    })
    return [{
      from: 'exports',
      to: 'default'
    }]
  }
  _parseDeclarations(declarations) {
    let token = []
    let file = null
    for (const item of declarations) {

      if (item.type === 'VariableDeclarator') {
        if (item.init.type === 'CallExpression' && item.init.callee.type == 'Identifier' && item.init.callee.name === 'require') {

          if (declarations.length > 1) {
            throw new Error('do not support multiple declaration in one statement');
          }
          file = item.init.arguments[0].value
          if (item.id.type === 'Identifier') {
            token.push({
              from: 'default',
              to: item.id.name
            })
          }
          if (item.id.type === 'ObjectPattern') {
            for (let p of item.id.properties) {
              token.push({
                from: p.key.name,
                to: p.key.name
              })
            }
          }
        }
      }
    }
    return {
      token,
      file
    }
  }
}
